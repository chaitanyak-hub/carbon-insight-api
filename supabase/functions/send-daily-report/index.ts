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
  site_name?: string;
  agent_name?: string;
  site_status?: string;
  onboard_date?: string;
  contact_email?: string;
  recommendations?: Array<{
    potential_savings?: number;
    potential_carbon_savings?: number;
    potential_cost?: number;
  }>;
  [key: string]: any;
}

interface AgentStats {
  agentName: string;
  team: string;
  totalSites: number;
  totalSavings: number;
  totalCarbonSavings: number;
  totalCost: number;
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

  const responseData = await response.json();
  console.log("Received data structure:", JSON.stringify(responseData).substring(0, 200));
  
  // The API returns { code, status, data: { sites: [...] } }
  if (!responseData.data || !responseData.data.sites || !Array.isArray(responseData.data.sites)) {
    throw new Error(`Invalid data structure received: ${JSON.stringify(responseData).substring(0, 100)}`);
  }
  
  return { sites: responseData.data.sites };
}

const getTeamForAgent = (agentEmail: string): string => {
  const TEAMS: any = {
    "amanda.adams@edfenergy.com": "Team Adam Parkins",
    "ben.houston@edfenergy.com": "Team Adam Parkins",
    "danny.cotton@edfenergy.com": "Team Adam Parkins",
    "darren.manning@edfenergy.com": "Team Adam Parkins",
    "david.maddox@edfenergy.com": "Team Adam Parkins",
    "dean.lipscombe@edfenergy.com": "Team Adam Parkins",
    "sarina.montesini@edfenergy.com": "Team Adam Parkins",
    "sophie.michael@edfenergy.com": "Team Adam Parkins",
    "amy.randall@edfenergy.com": "Team Rikki Nealgrove",
    "chris.langridge@edfenergy.com": "Team Rikki Nealgrove",
    "daniel.kearney@edfenergy.com": "Team Rikki Nealgrove",
    "catherine.hendon@edfenergy.com": "Team Rikki Nealgrove",
    "jennifer.hall@edfenergy.com": "Team Rikki Nealgrove",
    "luke.hudson-young@edfenergy.com": "Team Rikki Nealgrove",
    "matt.fricker@edfenergy.com": "Team Rikki Nealgrove",
    "mitchell.dawes@edfenergy.com": "Team Rikki Nealgrove",
    "sophie.kingston@edfenergy.com": "Team Rikki Nealgrove",
    "agata.siadura@edfenergy.com": "Team Joe Green",
    "andrew.tait@edfenergy.com": "Team Joe Green",
    "emma.george@edfenergy.com": "Team Joe Green",
    "grace.mitchell@edfenergy.com": "Team Joe Green",
    "jack.jeffrey@edfenergy.com": "Team Joe Green",
    "milchyas.ephrem@edfenergy.com": "Team Joe Green",
    "pam.maglennon@edfenergy.com": "Team Joe Green",
    "pete.emerson@edfenergy.com": "Team Joe Green",
    "sam.smith@edfenergy.com": "Team Joe Green",
    "thomas.oake@edfenergy.com": "Team Joe Green",
    "david.monk@edfenergy.com": "Team Tuesday Jamieson",
    "jenny.norris@edfenergy.com": "Team Tuesday Jamieson",
    "kelly.howell@edfenergy.com": "Team Tuesday Jamieson",
    "gwyn.lewis@edfenergy.com": "Team Tuesday Jamieson",
    "lauren.wise@edfenergy.com": "Team Tuesday Jamieson",
    "martin.house@edfenergy.com": "Team Tuesday Jamieson",
    "ben.wybrow@edfenergy.com": "Team Tuesday Jamieson",
    "carli.bird@edfenergy.com": "Team Tuesday Jamieson",
    "orlando.nogueir@edfenergy.com": "Team Tuesday Jamieson",
  };
  
  return TEAMS[agentEmail.toLowerCase()] || "Unknown Team";
};

const calculateSiteStats = (site: SiteData) => {
  let totalSavings = 0;
  let totalCarbonSavings = 0;
  let totalCost = 0;
  let recommendationCount = 0;
  
  if (site.recommendations && Array.isArray(site.recommendations)) {
    recommendationCount = site.recommendations.length;
    site.recommendations.forEach((rec: any) => {
      totalSavings += rec.potential_savings || 0;
      totalCarbonSavings += rec.potential_carbon_savings || 0;
      totalCost += rec.potential_cost || 0;
    });
  }
  
  return { totalSavings, totalCarbonSavings, totalCost, recommendationCount };
};

const aggregateStatsByAgent = (sites: SiteData[]): AgentStats[] => {
  const agentMap = new Map<string, AgentStats>();
  
  sites.forEach(site => {
    if (!site.agent_name) return;
    
    const agentEmail = site.agent_name.toLowerCase();
    const team = getTeamForAgent(agentEmail);
    const stats = calculateSiteStats(site);
    
    if (!agentMap.has(agentEmail)) {
      agentMap.set(agentEmail, {
        agentName: agentEmail,
        team,
        totalSites: 0,
        totalSavings: 0,
        totalCarbonSavings: 0,
        totalCost: 0,
      });
    }
    
    const agentStats = agentMap.get(agentEmail)!;
    agentStats.totalSites++;
    agentStats.totalSavings += stats.totalSavings;
    agentStats.totalCarbonSavings += stats.totalCarbonSavings;
    agentStats.totalCost += stats.totalCost;
  });
  
  return Array.from(agentMap.values());
};

function generateDailyStatsWorkbook(sites: SiteData[]) {
  const agentStats = aggregateStatsByAgent(sites);
  
  const dailyData = agentStats.map(agent => ({
    'Agent': agent.agentName,
    'Team': agent.team,
    'Total Sites': agent.totalSites,
    'Total Savings (£)': agent.totalSavings.toFixed(2),
    'Total Carbon Savings (kg)': agent.totalCarbonSavings.toFixed(2),
    'Total Cost (£)': agent.totalCost.toFixed(2),
  }));

  const ws = XLSX.utils.json_to_sheet(dailyData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Agent Statistics");
  
  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
}

function generateSiteStatsWorkbook(sites: SiteData[]) {
  const siteData = sites
    .filter(site => site.site_status === 'ACTIVE')
    .map(site => {
      const stats = calculateSiteStats(site);
      return {
        'Site Name': site.site_name || 'Unknown',
        'Agent': site.agent_name || 'Unknown',
        'Team': site.agent_name ? getTeamForAgent(site.agent_name.toLowerCase()) : 'Unknown',
        'Status': site.site_status || 'Unknown',
        'Onboard Date': site.onboard_date || 'Unknown',
        'Total Recommendations': stats.recommendationCount,
        'Total Savings (£)': stats.totalSavings.toFixed(2),
        'Total Carbon Savings (kg)': stats.totalCarbonSavings.toFixed(2),
        'Total Cost (£)': stats.totalCost.toFixed(2),
      };
    });

  const ws = XLSX.utils.json_to_sheet(siteData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Site Details");
  
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
  
  // Calculate team stats for charts
  const agentStats = aggregateStatsByAgent(sites);
  
  // Group by team
  const teamStats = agentStats.reduce((acc, agent) => {
    if (!acc[agent.team]) {
      acc[agent.team] = {
        totalSites: 0,
        totalSavings: 0,
        totalCarbonSavings: 0,
        totalCost: 0,
      };
    }
    acc[agent.team].totalSites += agent.totalSites;
    acc[agent.team].totalSavings += agent.totalSavings;
    acc[agent.team].totalCarbonSavings += agent.totalCarbonSavings;
    acc[agent.team].totalCost += agent.totalCost;
    return acc;
  }, {} as Record<string, any>);

  const teamNames = Object.keys(teamStats);
  const sites_count = teamNames.map(team => teamStats[team].totalSites);
  const savings = teamNames.map(team => teamStats[team].totalSavings);
  const costs = teamNames.map(team => teamStats[team].totalCost);

  // Chart 1: Sites by Team
  const sitesChartConfig = {
    type: 'bar',
    data: {
      labels: teamNames,
      datasets: [{
        label: 'Total Sites',
        data: sites_count,
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Sites by Team',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Chart 2: Total Savings by Team
  const savingsChartConfig = {
    type: 'bar',
    data: {
      labels: teamNames,
      datasets: [{
        label: 'Total Savings (£)',
        data: savings,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Total Savings by Team',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Chart 3: Total Investment/Cost by Team
  const costsChartConfig = {
    type: 'bar',
    data: {
      labels: teamNames,
      datasets: [{
        label: 'Total Investment/Cost (£)',
        data: costs,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Total Investment/Cost by Team',
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
  console.log("Generating sites chart...");
  const sitesImage = await generateChartImage(sitesChartConfig);
  console.log("Generating savings chart...");
  const savingsImage = await generateChartImage(savingsChartConfig);
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
  const sitesBase64 = arrayBufferToBase64(sitesImage);
  const savingsBase64 = arrayBufferToBase64(savingsImage);
  const costsBase64 = arrayBufferToBase64(costsImage);

  // Add first chart
  console.log("Adding sites chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${sitesBase64}`, 'PNG', 10, 10, 190, 100);

  // Add second chart
  console.log("Adding savings chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${savingsBase64}`, 'PNG', 10, 10, 190, 100);

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
    
    // Parse request body to get email addresses
    let recipients = ["chaitanya@perse.energy"]; // Default recipient
    try {
      const body = await req.json();
      if (body.recipients && Array.isArray(body.recipients) && body.recipients.length > 0) {
        recipients = body.recipients;
        console.log(`Sending to custom recipients: ${recipients.join(", ")}`);
      }
    } catch (e) {
      console.log("No custom recipients provided, using default");
    }
    
    // Fetch data
    const { sites } = await fetchCarbonData();
    console.log(`Fetched data for ${sites.length} sites`);

    // Generate Excel files
    console.log("Generating Excel files...");
    const dailyStatsExcel = generateDailyStatsWorkbook(sites);
    const siteStatsExcel = generateSiteStatsWorkbook(sites);

    // Generate PDF with charts
    const pdfBase64 = await generatePDFWithCharts(sites);

    // Convert buffers to base64 for email attachments (using chunked approach for large buffers)
    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      return btoa(binary);
    };

    const dailyStatsBase64 = arrayBufferToBase64(dailyStatsExcel);
    const siteStatsBase64 = arrayBufferToBase64(siteStatsExcel);

    console.log("Sending email with attachments...");
    
    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: "Carbon Reports <onboarding@resend.dev>",
      to: recipients,
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
