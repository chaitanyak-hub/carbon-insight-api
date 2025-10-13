import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteRecord, groupByWeekAndAgent, formatAgentName } from "@/utils/chartHelpers";
import { getTeamForAgent } from "@/utils/teamMapping";

interface WeeklyStatsTableProps {
  data: SiteRecord[];
  viewType: 'individual' | 'team';
}

const WeeklyStatsTable = ({ data, viewType }: WeeklyStatsTableProps) => {
  const weeklyData = groupByWeekAndAgent(data, viewType === 'team' ? getTeamForAgent : undefined);
  
  // Transform data for table format
  const tableData: Array<{
    week: string;
    agent: string;
    sites: number;
    uniqueCustomers: number;
    interaction: number;
  }> = [];

  weeklyData.forEach((weekData) => {
    const week = weekData.week;
    const agents = Object.keys(weekData).filter(key => 
      key !== 'week' && !key.includes('_contacts') && !key.includes('_interaction')
    );

    agents.forEach(agent => {
      tableData.push({
        week,
        agent,
        sites: weekData[agent] || 0,
        uniqueCustomers: weekData[`${agent}_contacts`] || 0,
        interaction: weekData[`${agent}_interaction`] || 0,
      });
    });
  });

  // Sort by week (descending) and then by agent
  tableData.sort((a, b) => {
    if (a.week !== b.week) {
      return b.week.localeCompare(a.week);
    }
    return a.agent.localeCompare(b.agent);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          Weekly Statistics by {viewType === 'individual' ? 'Agent' : 'Team'}
        </CardTitle>
        <CardDescription>
          Week-by-week breakdown (Wednesday to Tuesday) showing sites added, unique customers, and interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Week (Wed-Tue)</TableHead>
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
                    <TableRow key={`${row.week}-${row.agent}-${index}`}>
                      <TableCell className="font-medium">{row.week}</TableCell>
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
