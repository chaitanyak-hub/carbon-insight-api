import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { filterAndGroupSites, filterAndGroupSitesByTeam, getDateRanges, groupByWeek, SiteRecord } from "@/utils/chartHelpers";
import { getTeamForAgent } from "@/utils/teamMapping";

interface SiteChartsProps {
  data: SiteRecord[];
  viewType: 'individual' | 'team';
  metricType: 'all' | 'sites' | 'contacts' | 'interaction';
}

const SiteCharts = ({ data, viewType, metricType }: SiteChartsProps) => {
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
  
  const weeklyTrendData = groupByWeek(data);

  const ChartCard = ({ 
    title, 
    description, 
    data, 
    color 
  }: { 
    title: string; 
    description: string; 
    data: { name: string; sites: number; uniqueContacts: number; customerInteraction: number }[]; 
    color: string;
  }) => {
    const totalSites = data.reduce((sum, item) => sum + item.sites, 0);
    const totalContacts = data.reduce((sum, item) => sum + item.uniqueContacts, 0);
    const totalInteraction = data.reduce((sum, item) => sum + item.customerInteraction, 0);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {title} ({metricType === 'all' ? `Sites: ${totalSites}, Contacts: ${totalContacts}, Interactions: ${totalInteraction}` : 
                     metricType === 'sites' ? `Sites: ${totalSites}` :
                     metricType === 'contacts' ? `Unique Contacts: ${totalContacts}` :
                     `Customer Interactions: ${totalInteraction}`})
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-foreground mb-2">{data.name}</p>
                          {(metricType === 'all' || metricType === 'sites') && (
                            <p className="text-sm text-muted-foreground">Sites: {data.sites}</p>
                          )}
                          {(metricType === 'all' || metricType === 'contacts') && (
                            <p className="text-sm text-muted-foreground">Unique Contacts: {data.uniqueContacts}</p>
                          )}
                          {(metricType === 'all' || metricType === 'interaction') && (
                            <p className="text-sm text-muted-foreground">Customer Interactions: {data.customerInteraction}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {(metricType === 'all' || metricType === 'sites') && (
                  <Bar dataKey="sites" fill={color} radius={[8, 8, 0, 0]} label={{ position: 'top', fill: 'hsl(var(--foreground))' }} />
                )}
                {(metricType === 'all' || metricType === 'contacts') && (
                  <Bar dataKey="uniqueContacts" fill="#4CAF50" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: 'hsl(var(--foreground))' }} />
                )}
                {(metricType === 'all' || metricType === 'interaction') && (
                  <Bar dataKey="customerInteraction" fill="#2196F3" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: 'hsl(var(--foreground))' }} />
                )}
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
      
      {/* Week on Week Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Week on Week Statistics</CardTitle>
          <CardDescription>
            {metricType === 'all' && `Trends - Sites: ${weeklyTrendData.reduce((sum, d) => sum + d.sites, 0)}, Contacts: ${weeklyTrendData.reduce((sum, d) => sum + d.uniqueContacts, 0)}, Interactions: ${weeklyTrendData.reduce((sum, d) => sum + d.customerInteraction, 0)}`}
            {metricType === 'sites' && `Total Sites: ${weeklyTrendData.reduce((sum, d) => sum + d.sites, 0)}`}
            {metricType === 'contacts' && `Total Unique Contacts: ${weeklyTrendData.reduce((sum, d) => sum + d.uniqueContacts, 0)}`}
            {metricType === 'interaction' && `Total Customer Interactions: ${weeklyTrendData.reduce((sum, d) => sum + d.customerInteraction, 0)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyTrendData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No weekly data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={weeklyTrendData} margin={{ top: 30, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="week" 
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
                <Legend />
                {(metricType === 'all' || metricType === 'sites') && (
                  <Line type="monotone" dataKey="sites" stroke="#FF5733" name="Sites" strokeWidth={2} />
                )}
                {(metricType === 'all' || metricType === 'contacts') && (
                  <Line type="monotone" dataKey="uniqueContacts" stroke="#4CAF50" name="Unique Contacts" strokeWidth={2} />
                )}
                {(metricType === 'all' || metricType === 'interaction') && (
                  <Line type="monotone" dataKey="customerInteraction" stroke="#2196F3" name="Customer Interaction" strokeWidth={2} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteCharts;
