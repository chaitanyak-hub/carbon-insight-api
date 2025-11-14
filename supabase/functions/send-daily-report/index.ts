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
  contact_phone?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  company_name?: string;
  siteAddress?: string;
  display_name?: string;
  logged_in_contacts?: number;
  latest_contact_login?: string;
  elecMeter?: any;
  gasMeter?: any;
  recommendations?: Array<{
    type?: string;
    potential_savings?: number;
    potential_carbon_savings?: number;
    potential_cost?: number;
    upgrade_cost?: number;
    payback_period?: number;
  }>;
  [key: string]: any;
}

interface DailyAgentStats {
  date: string;
  agent: string;
  agentEmail: string;
  sites: number;
  uniqueCustomers: number;
  interactions: number;
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

// Helper function to format agent name
const formatAgentName = (email: string): string => {
  if (!email) return 'Unknown';
  const name = email.split('@')[0];
  return name.split('.').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join(' ');
};

// Helper function to format date as DD/MM/YYYY
const formatDateDDMMYYYY = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper functions for Site Statistics
const extractMPAN = (record: any): string => {
  if (record.elecMeter && typeof record.elecMeter === 'object') {
    const mpans = Object.keys(record.elecMeter);
    return mpans.length > 0 ? mpans.join(', ') : 'N/A';
  }
  return 'N/A';
};

const extractMPRN = (record: any): string => {
  if (record.gasMeter && typeof record.gasMeter === 'object') {
    const mprns = Object.keys(record.gasMeter);
    return mprns.length > 0 ? mprns.join(', ') : 'N/A';
  }
  return 'N/A';
};

const formatRecommendations = (record: any): string => {
  if (record.recommendations && Array.isArray(record.recommendations) && record.recommendations.length > 0) {
    return record.recommendations
      .filter((rec: any) => rec.potential_savings > 0)
      .map((rec: any) => {
        const parts = [
          `Type: ${rec.type}`,
          `Savings: £${rec.potential_savings.toFixed(2)}`,
          `Cost: £${rec.upgrade_cost?.toFixed(2) || 0}`,
          rec.payback_period !== null && rec.payback_period !== undefined ? `Payback: ${rec.payback_period.toFixed(2)} years` : 'Payback: N/A',
        ];
        return `[${parts.join(' | ')}]`;
      })
      .join(' ');
  }
  return 'N/A';
};

const calculateTotalSavings = (record: any): number => {
  if (record.recommendations && Array.isArray(record.recommendations) && record.recommendations.length > 0) {
    return record.recommendations
      .filter((rec: any) => rec.potential_savings > 0)
      .reduce((total: number, rec: any) => total + (rec.potential_savings || 0), 0);
  }
  return 0;
};

// Generate daily statistics matching WeeklyStatsTable format
const generateDailyStatsByAgent = (sites: SiteData[]): DailyAgentStats[] => {
  const dailyGroups = new Map<string, Map<string, { sites: number; contacts: Set<string>; interactions: number; agentEmail: string }>>();
  
  sites.forEach(record => {
    if (!record.onboard_date) return;
    if (record.site_status !== 'ACTIVE') return;
    
    const date = new Date(record.onboard_date).toISOString().split('T')[0];
    const agentKey = formatAgentName(record.agent_name || '');
    
    if (!dailyGroups.has(date)) {
      dailyGroups.set(date, new Map());
    }
    
    const dateGroup = dailyGroups.get(date)!;
    if (!dateGroup.has(agentKey)) {
      dateGroup.set(agentKey, { 
        sites: 0, 
        contacts: new Set(), 
        interactions: 0,
        agentEmail: record.agent_name || ''
      });
    }
    
    const agentData = dateGroup.get(agentKey)!;
    agentData.sites++;
    
    if (record.contact_email) {
      agentData.contacts.add(record.contact_email);
    }
    
    if (record.logged_in_contacts && record.logged_in_contacts > 0) {
      agentData.interactions++;
    }
  });
  
  const tableData: DailyAgentStats[] = [];
  dailyGroups.forEach((agents, date) => {
    agents.forEach((data, agent) => {
      tableData.push({
        date,
        agent,
        agentEmail: data.agentEmail,
        sites: data.sites,
        uniqueCustomers: data.contacts.size,
        interactions: data.interactions,
      });
    });
  });
  
  tableData.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return a.agent.localeCompare(b.agent);
  });
  
  return tableData;
};

// Generate Daily Statistics workbook matching WeeklyStatsTable export format
function generateDailyStatsWorkbook(sites: SiteData[]) {
  const dailyStats = generateDailyStatsByAgent(sites);
  
  const exportData = dailyStats.map(row => {
    const interactionPercentage = row.uniqueCustomers > 0 
      ? Math.round((row.interactions / row.uniqueCustomers) * 100)
      : 0;
    
    return {
      'Date': formatDateDDMMYYYY(row.date),
      'Agent': row.agent,
      'Team Leader': getTeamForAgent(row.agentEmail.toLowerCase()),
      'Sites Added': row.sites,
      'Unique Customers': row.uniqueCustomers,
      'Interactions': row.interactions,
      'Interaction %': `${interactionPercentage}%`,
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Daily Statistics");
  
  return XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
}

// Generate Site Statistics workbook matching SiteStatisticsTable export format
function generateSiteStatsWorkbook(sites: SiteData[]) {
  const siteData = sites
    .filter(site => site.site_status === 'ACTIVE')
    .map(record => ({
      'Site Address': record.siteAddress || record.display_name || 'N/A',
      'Agent Name': formatAgentName(record.agent_name || 'Unknown'),
      'Site Added Date': formatDateDDMMYYYY(record.onboard_date || ''),
      'Site Status': record.site_status || 'N/A',
      'Customer Email': record.contact_email || 'N/A',
      'Contact Phone': record.contact_phone || 'N/A',
      'First Name': record.contact_first_name || 'N/A',
      'Last Name': record.contact_last_name || 'N/A',
      'MPAN': extractMPAN(record),
      'MPRN': extractMPRN(record),
      'Company Name': record.company_name || 'N/A',
      'Recommendations': formatRecommendations(record),
      'Total Savings': `£${calculateTotalSavings(record).toFixed(2)}`,
      'Interaction Status': record.latest_contact_login ? 'Yes' : 'No',
    }));

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

// Helper to get date ranges
const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Week starts on Wednesday
  const dayOfWeek = now.getDay();
  const daysFromWednesday = (dayOfWeek + 4) % 7;
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - daysFromWednesday);
  
  return {
    today: { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) },
    yesterday: { start: yesterday, end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1) },
    thisWeek: { start: thisWeekStart, end: today },
  };
};

// Helper to filter and group sites by agent
const filterAndGroupSitesByAgent = (sites: SiteData[], startDate?: Date, endDate?: Date) => {
  const agentStats = new Map<string, { sites: number; contacts: Set<string>; interactions: number }>();
  
  sites.forEach(site => {
    if (site.site_status !== 'ACTIVE') return;
    if (!site.agent_name) return;
    
    if (startDate && endDate && site.onboard_date) {
      const siteDate = new Date(site.onboard_date);
      if (siteDate < startDate || siteDate > endDate) return;
    }
    
    const agentName = formatAgentName(site.agent_name);
    if (!agentStats.has(agentName)) {
      agentStats.set(agentName, { sites: 0, contacts: new Set(), interactions: 0 });
    }
    
    const stats = agentStats.get(agentName)!;
    stats.sites++;
    if (site.contact_email) stats.contacts.add(site.contact_email);
    if (site.logged_in_contacts && site.logged_in_contacts > 0) stats.interactions++;
  });
  
  return Array.from(agentStats.entries()).map(([name, stats]) => ({
    name,
    sites: stats.sites,
    uniqueContacts: stats.contacts.size,
    customerInteraction: stats.interactions,
  }));
};

async function generatePDFWithCharts(sites: SiteData[]): Promise<string> {
  console.log("Generating PDF with charts...");
  
  const doc = new jsPDF();
  const dateRanges = getDateRanges();
  
  // Generate data for each chart type
  const todayData = filterAndGroupSitesByAgent(sites, dateRanges.today.start, dateRanges.today.end);
  const yesterdayData = filterAndGroupSitesByAgent(sites, dateRanges.yesterday.start, dateRanges.yesterday.end);
  const thisWeekData = filterAndGroupSitesByAgent(sites, dateRanges.thisWeek.start, dateRanges.thisWeek.end);
  const allActiveSitesData = filterAndGroupSitesByAgent(sites);
  
  // Calculate team stats
  const teamStats = new Map<string, { 
    totalSites: number; 
    totalSavings: number; 
    totalCost: number;
    uniqueCustomers: Set<string>;
    interactions: number;
  }>();
  
  sites.forEach(site => {
    if (!site.agent_name || site.site_status !== 'ACTIVE') return;
    
    const team = getTeamForAgent(site.agent_name.toLowerCase());
    if (!teamStats.has(team)) {
      teamStats.set(team, {
        totalSites: 0,
        totalSavings: 0,
        totalCost: 0,
        uniqueCustomers: new Set(),
        interactions: 0,
      });
    }
    
    const stats = teamStats.get(team)!;
    stats.totalSites++;
    
    if (site.recommendations && Array.isArray(site.recommendations)) {
      site.recommendations.forEach((rec: any) => {
        stats.totalSavings += rec.potential_savings || 0;
        stats.totalCost += rec.upgrade_cost || 0;
      });
    }
    
    if (site.contact_email) {
      stats.uniqueCustomers.add(site.contact_email);
    }
    
    if (site.logged_in_contacts && site.logged_in_contacts > 0) {
      stats.interactions++;
    }
  });

  const teamNames = Array.from(teamStats.keys());
  const team_sites = teamNames.map(team => teamStats.get(team)!.totalSites);
  const team_savings = teamNames.map(team => teamStats.get(team)!.totalSavings);
  const team_costs = teamNames.map(team => teamStats.get(team)!.totalCost);
  const team_customers = teamNames.map(team => teamStats.get(team)!.uniqueCustomers.size);
  const team_interactions = teamNames.map(team => teamStats.get(team)!.interactions);

  // Chart 1: Today
  const todayChartConfig = {
    type: 'bar',
    data: {
      labels: todayData.map(d => d.name),
      datasets: [{
        label: 'Sites Added Today',
        data: todayData.map(d => d.sites),
        backgroundColor: 'rgba(255, 87, 51, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Sites Added Today',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Chart 2: Yesterday
  const yesterdayChartConfig = {
    type: 'bar',
    data: {
      labels: yesterdayData.map(d => d.name),
      datasets: [{
        label: 'Sites Added Yesterday',
        data: yesterdayData.map(d => d.sites),
        backgroundColor: 'rgba(255, 87, 51, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Sites Added Yesterday',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Chart 3: This Week
  const thisWeekChartConfig = {
    type: 'bar',
    data: {
      labels: thisWeekData.map(d => d.name),
      datasets: [{
        label: 'Sites This Week (Wed-Tue)',
        data: thisWeekData.map(d => d.sites),
        backgroundColor: 'rgba(255, 87, 51, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Sites This Week (Wednesday to Tuesday)',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Chart 4: All Active Sites by Agent
  const allSitesChartConfig = {
    type: 'bar',
    data: {
      labels: allActiveSitesData.map(d => d.name),
      datasets: [{
        label: 'All Active Sites',
        data: allActiveSitesData.map(d => d.sites),
        backgroundColor: 'rgba(255, 87, 51, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'All Active Sites by Agent',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Chart 5: Sites by Team
  const teamSitesChartConfig = {
    type: 'bar',
    data: {
      labels: teamNames,
      datasets: [{
        label: 'Total Sites by Team',
        data: team_sites,
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

  // Chart 6: Total Savings by Team
  const teamSavingsChartConfig = {
    type: 'bar',
    data: {
      labels: teamNames,
      datasets: [{
        label: 'Total Savings (£)',
        data: team_savings,
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

  // Chart 7: Total Investment/Cost by Team
  const teamCostsChartConfig = {
    type: 'bar',
    data: {
      labels: teamNames,
      datasets: [{
        label: 'Total Investment/Cost (£)',
        data: team_costs,
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

  // Chart 8: Unique Customers by Team
  const teamCustomersChartConfig = {
    type: 'bar',
    data: {
      labels: teamNames,
      datasets: [{
        label: 'Unique Customers',
        data: team_customers,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Unique Customers by Team',
        fontSize: 18,
      },
      scales: {
        yAxes: [{
          ticks: { beginAtZero: true }
        }]
      }
    }
  };

  // Chart 9: Interactions by Team
  const teamInteractionsChartConfig = {
    type: 'bar',
    data: {
      labels: teamNames,
      datasets: [{
        label: 'Interactions',
        data: team_interactions,
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Interactions by Team',
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
  console.log("Generating today chart...");
  const todayImage = await generateChartImage(todayChartConfig);
  console.log("Generating yesterday chart...");
  const yesterdayImage = await generateChartImage(yesterdayChartConfig);
  console.log("Generating this week chart...");
  const thisWeekImage = await generateChartImage(thisWeekChartConfig);
  console.log("Generating all sites chart...");
  const allSitesImage = await generateChartImage(allSitesChartConfig);
  console.log("Generating team sites chart...");
  const teamSitesImage = await generateChartImage(teamSitesChartConfig);
  console.log("Generating team savings chart...");
  const teamSavingsImage = await generateChartImage(teamSavingsChartConfig);
  console.log("Generating team costs chart...");
  const teamCostsImage = await generateChartImage(teamCostsChartConfig);
  console.log("Generating team customers chart...");
  const teamCustomersImage = await generateChartImage(teamCustomersChartConfig);
  console.log("Generating team interactions chart...");
  const teamInteractionsImage = await generateChartImage(teamInteractionsChartConfig);
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
  const todayBase64 = arrayBufferToBase64(todayImage);
  const yesterdayBase64 = arrayBufferToBase64(yesterdayImage);
  const thisWeekBase64 = arrayBufferToBase64(thisWeekImage);
  const allSitesBase64 = arrayBufferToBase64(allSitesImage);
  const teamSitesBase64 = arrayBufferToBase64(teamSitesImage);
  const teamSavingsBase64 = arrayBufferToBase64(teamSavingsImage);
  const teamCostsBase64 = arrayBufferToBase64(teamCostsImage);
  const teamCustomersBase64 = arrayBufferToBase64(teamCustomersImage);
  const teamInteractionsBase64 = arrayBufferToBase64(teamInteractionsImage);

  // Add charts
  console.log("Adding today chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${todayBase64}`, 'PNG', 10, 10, 190, 100);

  console.log("Adding yesterday chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${yesterdayBase64}`, 'PNG', 10, 10, 190, 100);

  console.log("Adding this week chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${thisWeekBase64}`, 'PNG', 10, 10, 190, 100);

  console.log("Adding all sites chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${allSitesBase64}`, 'PNG', 10, 10, 190, 100);

  console.log("Adding team sites chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${teamSitesBase64}`, 'PNG', 10, 10, 190, 100);

  console.log("Adding team savings chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${teamSavingsBase64}`, 'PNG', 10, 10, 190, 100);

  console.log("Adding team costs chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${teamCostsBase64}`, 'PNG', 10, 10, 190, 100);

  console.log("Adding team customers chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${teamCustomersBase64}`, 'PNG', 10, 10, 190, 100);

  console.log("Adding team interactions chart to PDF...");
  doc.addPage();
  doc.addImage(`data:image/png;base64,${teamInteractionsBase64}`, 'PNG', 10, 10, 190, 100);
  
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
