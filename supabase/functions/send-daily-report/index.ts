import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SiteData {
  id: string;
  name: string;
  organisation: string;
  team: string;
  weeklyData?: Array<{
    week: string;
    totalScore: number;
    totalRecommendations: number;
    totalCost: number;
  }>;
  allTimeStats?: {
    totalScore: number;
    totalRecommendations: number;
    totalCost: number;
  };
}

async function fetchCarbonData(): Promise<{ sites: SiteData[] }> {
  console.log("Fetching carbon data from edge function...");
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-carbon-data`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch carbon data: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Received data structure:", JSON.stringify(data).substring(0, 200));
  
  // The API returns { sites: [...] } directly
  if (!data.sites || !Array.isArray(data.sites)) {
    throw new Error(`Invalid data structure received: ${JSON.stringify(data).substring(0, 100)}`);
  }
  
  return data;
}

function generateDailyStatsWorkbook(sites: SiteData[]) {
  const dailyData = sites.map(site => ({
    'Site Name': site.name,
    'Organisation': site.organisation,
    'Team': site.team,
    'Total Score': site.allTimeStats?.totalScore || 0,
    'Total Recommendations': site.allTimeStats?.totalRecommendations || 0,
    'Total Investment/Opportunity (£)': site.allTimeStats?.totalCost || 0,
  }));

  const ws = XLSX.utils.json_to_sheet(dailyData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Daily Statistics");
  
  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
}

function generateSiteStatsWorkbook(sites: SiteData[]) {
  const siteData = sites.flatMap(site => 
    (site.weeklyData || []).map(week => ({
      'Site Name': site.name,
      'Organisation': site.organisation,
      'Team': site.team,
      'Week': week.week,
      'Score': week.totalScore,
      'Recommendations': week.totalRecommendations,
      'Investment/Opportunity (£)': week.totalCost,
    }))
  );

  const ws = XLSX.utils.json_to_sheet(siteData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Site Statistics");
  
  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
}

async function generateChartImage(chartConfig: any): Promise<Uint8Array> {
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
  console.log("Generating chart from QuickChart.io:", chartUrl.substring(0, 100) + "...");
  
  const response = await fetch(chartUrl);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to generate chart: ${response.statusText}`, errorText);
    throw new Error(`Failed to generate chart: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  console.log("Chart generated successfully, size:", arrayBuffer.byteLength);
  return new Uint8Array(arrayBuffer);
}

async function generatePDFWithCharts(sites: SiteData[]): Promise<string> {
  console.log("Generating PDF with charts...");
  
  const doc = new jsPDF();
  
  // Calculate organization stats for charts
  const orgStats = sites.reduce((acc, site) => {
    if (!acc[site.organisation]) {
      acc[site.organisation] = {
        totalScore: 0,
        totalRecommendations: 0,
        totalCost: 0,
        siteCount: 0,
      };
    }
    acc[site.organisation].totalScore += site.allTimeStats?.totalScore || 0;
    acc[site.organisation].totalRecommendations += site.allTimeStats?.totalRecommendations || 0;
    acc[site.organisation].totalCost += site.allTimeStats?.totalCost || 0;
    acc[site.organisation].siteCount += 1;
    return acc;
  }, {} as Record<string, any>);

  const orgNames = Object.keys(orgStats);
  const scores = orgNames.map(org => orgStats[org].totalScore);
  const recommendations = orgNames.map(org => orgStats[org].totalRecommendations);
  const costs = orgNames.map(org => orgStats[org].totalCost);

  // Chart 1: Organization Scores
  const scoresChartConfig = {
    type: 'bar',
    data: {
      labels: orgNames,
      datasets: [{
        label: 'Total Score',
        data: scores,
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Organization Scores',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Chart 2: Total Recommendations
  const recsChartConfig = {
    type: 'bar',
    data: {
      labels: orgNames,
      datasets: [{
        label: 'Total Recommendations',
        data: recommendations,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Total Recommendations by Organization',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Chart 3: Total Investment/Opportunity
  const costsChartConfig = {
    type: 'bar',
    data: {
      labels: orgNames,
      datasets: [{
        label: 'Total Investment/Opportunity (£)',
        data: costs,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Total Investment/Opportunity by Organization',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Generate chart images
  console.log("Generating scores chart...");
  const scoresImage = await generateChartImage(scoresChartConfig);
  console.log("Generating recommendations chart...");
  const recsImage = await generateChartImage(recsChartConfig);
  console.log("Generating costs chart...");
  const costsImage = await generateChartImage(costsChartConfig);
  console.log("All charts generated successfully");

  // Add title page
  doc.setFontSize(24);
  doc.text('Daily Carbon Data Report', 20, 30);
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);
  doc.text(`Total sites analyzed: ${sites.length}`, 20, 50);
  
  // Convert Uint8Array to base64 for jsPDF
  const arrayBufferToBase64 = (buffer: Uint8Array) => {
    if (!buffer || buffer.length === 0) {
      throw new Error("Buffer is empty or undefined");
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };
  
  console.log("Converting images to base64...");
  const scoresBase64 = arrayBufferToBase64(scoresImage);
  const recsBase64 = arrayBufferToBase64(recsImage);
  const costsBase64 = arrayBufferToBase64(costsImage);

  // Add first chart
  console.log("Adding scores chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${scoresBase64}`, 'PNG', 10, 10, 190, 100);

  // Add second chart
  console.log("Adding recommendations chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${recsBase64}`, 'PNG', 10, 10, 190, 100);

  // Add third chart
  console.log("Adding costs chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${costsBase64}`, 'PNG', 10, 10, 190, 100);
  
  console.log("PDF generation complete");

  // Return as base64
  return doc.output('datauristring').split(',')[1];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting daily report generation...");
    
    // Fetch data
    const { sites } = await fetchCarbonData();
    console.log(`Fetched data for ${sites.length} sites`);

    // Generate Excel files
    console.log("Generating Excel files...");
    const dailyStatsExcel = generateDailyStatsWorkbook(sites);
    const siteStatsExcel = generateSiteStatsWorkbook(sites);

    // Generate PDF with charts
    const pdfBase64 = await generatePDFWithCharts(sites);

    // Convert buffers to base64 for email attachments
    const dailyStatsBase64 = btoa(String.fromCharCode(...new Uint8Array(dailyStatsExcel)));
    const siteStatsBase64 = btoa(String.fromCharCode(...new Uint8Array(siteStatsExcel)));

    console.log("Sending email with attachments...");
    
    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: "Carbon Reports <onboarding@resend.dev>",
      to: ["chaitanya@perse.energy"],
      subject: `Daily Carbon Data Report - ${new Date().toLocaleDateString()}`,
      html: `
        <h1>Daily Carbon Data Report</h1>
        <p>Please find attached your daily carbon data report including:</p>
        <ul>
          <li>PDF Report with visualization charts</li>
          <li>Daily Statistics Excel file</li>
          <li>Site Statistics Excel file</li>
        </ul>
        <p>Report generated on: ${new Date().toLocaleString()}</p>
        <p>Total sites analyzed: ${sites.length}</p>
      `,
      attachments: [
        {
          filename: `carbon-report-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBase64,
        },
        {
          filename: `daily-statistics-${new Date().toISOString().split('T')[0]}.xlsx`,
          content: dailyStatsBase64,
        },
        {
          filename: `site-statistics-${new Date().toISOString().split('T')[0]}.xlsx`,
          content: siteStatsBase64,
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Daily report sent successfully",
        emailResponse 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-daily-report function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
