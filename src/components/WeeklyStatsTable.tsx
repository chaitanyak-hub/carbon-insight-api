import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SiteRecord, groupByWeekAndAgent, formatAgentName } from "@/utils/chartHelpers";
import { getTeamForAgent, TEAMS } from "@/utils/teamMapping";
import * as XLSX from 'xlsx';

interface WeeklyStatsTableProps {
  data: SiteRecord[];
  viewType: 'individual' | 'team';
}

const WeeklyStatsTable = ({ data, viewType }: WeeklyStatsTableProps) => {
  // Helper function to get team leader for an agent
  const getTeamLeaderForAgent = (agentEmail: string): string => {
    for (const team of TEAMS) {
      const member = team.members.find(
        (m) => m.email.toLowerCase() === agentEmail.toLowerCase()
      );
      if (member) {
        return team.lead;
      }
    }
    return 'Unknown';
  };

  // Helper function to format date as DD/MM/YYYY
  const formatDateDDMMYYYY = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Transform data for daily table format
  const tableData: Array<{
    date: string;
    agent: string;
    agentEmail: string;
    sites: number;
    uniqueCustomers: number;
    interaction: number;
  }> = [];

  // Group data by date and agent
  const dailyGroups = new Map<string, Map<string, { sites: number; contacts: Set<string>; interactions: number }>>();

  data.forEach(record => {
    if (!record.onboard_date) return;
    
    // Include inactive sites only for Lauren Wise, otherwise filter to ACTIVE only
    const isLaurenWise = record.agent_name?.toLowerCase().includes('lauren.wise');
    if (record.site_status !== 'ACTIVE' && !isLaurenWise) return;
    
    const date = new Date(record.onboard_date).toISOString().split('T')[0];
    const agentKey = viewType === 'team' 
      ? getTeamForAgent(record.agent_name || '') || 'Unknown'
      : formatAgentName(record.agent_name || '');

    if (!dailyGroups.has(date)) {
      dailyGroups.set(date, new Map());
    }
    
    const dateGroup = dailyGroups.get(date)!;
    if (!dateGroup.has(agentKey)) {
      dateGroup.set(agentKey, { sites: 0, contacts: new Set(), interactions: 0 });
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

  // Convert to array format - need to get original agent email for team leader lookup
  const agentEmailMap = new Map<string, string>();
  data.forEach(record => {
    if (record.agent_name) {
      const formattedName = formatAgentName(record.agent_name);
      agentEmailMap.set(formattedName, record.agent_name);
    }
  });

  dailyGroups.forEach((agents, date) => {
    agents.forEach((data, agent) => {
      tableData.push({
        date,
        agent,
        agentEmail: agentEmailMap.get(agent) || '',
        sites: data.sites,
        uniqueCustomers: data.contacts.size,
        interaction: data.interactions,
      });
    });
  });

  // Sort by date (descending) and then by agent
  tableData.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return a.agent.localeCompare(b.agent);
  });

  // Function to export to Excel
  const exportToExcel = () => {
    const exportData = tableData.map(row => {
      const interactionPercentage = row.uniqueCustomers > 0 
        ? Math.round((row.interaction / row.uniqueCustomers) * 100)
        : 0;
      
      return {
        'Date': formatDateDDMMYYYY(row.date),
        [viewType === 'individual' ? 'Agent' : 'Team']: row.agent,
        'Team Leader': viewType === 'individual' ? getTeamLeaderForAgent(row.agentEmail) : '',
        'Sites Added': row.sites,
        'Unique Customers': row.uniqueCustomers,
        'Interactions': row.interaction,
        'Interaction %': `${interactionPercentage}%`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Statistics');
    
    const fileName = `Daily_Statistics_${viewType}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">
              Daily Statistics by {viewType === 'individual' ? 'Agent' : 'Team'}
            </CardTitle>
            <CardDescription>
              Day-by-day breakdown showing sites added, unique customers, and interactions
            </CardDescription>
          </div>
          <Button 
            onClick={exportToExcel} 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">{viewType === 'individual' ? 'Agent' : 'Team'}</TableHead>
                <TableHead className="text-right font-bold">Sites Added</TableHead>
                <TableHead className="text-right font-bold">Unique Customers</TableHead>
                <TableHead className="text-right font-bold">Interactions</TableHead>
                <TableHead className="text-right font-bold">Interaction %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row, index) => {
                  const interactionPercentage = row.uniqueCustomers > 0 
                    ? Math.round((row.interaction / row.uniqueCustomers) * 100)
                    : 0;
                  
                  return (
                    <TableRow key={`${row.date}-${row.agent}-${index}`}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell>{row.agent}</TableCell>
                      <TableCell className="text-right">{row.sites}</TableCell>
                      <TableCell className="text-right">{row.uniqueCustomers}</TableCell>
                      <TableCell className="text-right">{row.interaction}</TableCell>
                      <TableCell className="text-right">{interactionPercentage}%</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyStatsTable;
