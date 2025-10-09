import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { filterAndGroupSites, filterAndGroupSitesByTeam, getDateRanges, SiteRecord } from "@/utils/chartHelpers";
import { getTeamForAgent } from "@/utils/teamMapping";

interface SiteChartsProps {
  data: SiteRecord[];
  viewType: 'individual' | 'team';
}

const SiteCharts = ({ data, viewType }: SiteChartsProps) => {
  const dateRanges = getDateRanges();

  const totalData = viewType === 'individual' 
    ? filterAndGroupSites(data)
    : filterAndGroupSitesByTeam(data, getTeamForAgent);
    
  const weekData = viewType === 'individual'
    ? filterAndGroupSites(data, dateRanges.thisWeek.start, dateRanges.thisWeek.end)
    : filterAndGroupSitesByTeam(data, getTeamForAgent, dateRanges.thisWeek.start, dateRanges.thisWeek.end);
    
  const yesterdayData = viewType === 'individual'
    ? filterAndGroupSites(data, dateRanges.yesterday.start, dateRanges.yesterday.end)
    : filterAndGroupSitesByTeam(data, getTeamForAgent, dateRanges.yesterday.start, dateRanges.yesterday.end);
    
  const todayData = viewType === 'individual'
    ? filterAndGroupSites(data, dateRanges.today.start, dateRanges.today.end)
    : filterAndGroupSitesByTeam(data, getTeamForAgent, dateRanges.today.start, dateRanges.today.end);

  const ChartCard = ({ 
    title, 
    description, 
    data, 
    color 
  }: { 
    title: string; 
    description: string; 
    data: { name: string; sites: number }[]; 
    color: string;
  }) => {
    const totalSites = data.reduce((sum, item) => sum + item.sites, 0);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {title} (Total: {totalSites})
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No data available for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="sites" fill={color} radius={[8, 8, 0, 0]} label={{ position: 'top', fill: 'hsl(var(--foreground))' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <ChartCard 
        title="Today" 
        description="Sites added today"
        data={todayData}
        color="#FF5733"
      />
      <ChartCard 
        title="Yesterday" 
        description="Sites added yesterday"
        data={yesterdayData}
        color="#FF5733"
      />
      <ChartCard 
        title="This Week" 
        description="Monday to Sunday"
        data={weekData}
        color="#FF5733"
      />
      <ChartCard 
        title="All Active Sites by Agent" 
        description="Total number of active sites added per agent (all dates)"
        data={totalData}
        color="#FF5733"
      />
    </div>
  );
};

export default SiteCharts;
