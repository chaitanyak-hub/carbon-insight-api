import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { filterAndGroupSites, filterAndGroupSitesByTeam, getDateRanges, groupByWeekAndAgent, SiteRecord } from "@/utils/chartHelpers";
import { getTeamForAgent } from "@/utils/teamMapping";
import WeeklyStatsTable from "./WeeklyStatsTable";

interface SiteChartsProps {
  data: SiteRecord[];
  viewType: 'individual' | 'team';
  metricType: 'all' | 'sites' | 'contacts' | 'interaction';
  dateFrom?: Date;
  dateTo?: Date;
}

const SiteCharts = ({ data, viewType, metricType, dateFrom, dateTo }: SiteChartsProps) => {
  const dateRanges = getDateRanges();

  // Custom date range only applies to "All Active Sites by Agent"
  const totalData = viewType === 'individual' 
    ? filterAndGroupSites(data, dateFrom, dateTo)
    : filterAndGroupSitesByTeam(data, getTeamForAgent, dateFrom, dateTo);
    
  // Other charts always use their predefined date ranges
  const weekData = viewType === 'individual'
    ? filterAndGroupSites(data, dateRanges.thisWeek.start, dateRanges.thisWeek.end)
    : filterAndGroupSitesByTeam(data, getTeamForAgent, dateRanges.thisWeek.start, dateRanges.thisWeek.end);
    
  const monthData = viewType === 'individual'
    ? filterAndGroupSites(data, dateRanges.thisMonth.start, dateRanges.thisMonth.end)
    : filterAndGroupSitesByTeam(data, getTeamForAgent, dateRanges.thisMonth.start, dateRanges.thisMonth.end);
    
  const yesterdayData = viewType === 'individual'
    ? filterAndGroupSites(data, dateRanges.yesterday.start, dateRanges.yesterday.end)
    : filterAndGroupSitesByTeam(data, getTeamForAgent, dateRanges.yesterday.start, dateRanges.yesterday.end);
    
  const todayData = viewType === 'individual'
    ? filterAndGroupSites(data, dateRanges.today.start, dateRanges.today.end)
    : filterAndGroupSitesByTeam(data, getTeamForAgent, dateRanges.today.start, dateRanges.today.end);
  
  const weeklyTrendData = groupByWeekAndAgent(data, viewType === 'team' ? getTeamForAgent : undefined);
  
  // Get unique agents/teams for the weekly chart
  const agentKeys = weeklyTrendData.length > 0 
    ? Object.keys(weeklyTrendData[0]).filter(key => key !== 'week' && !key.includes('_contacts') && !key.includes('_interaction'))
    : [];
  
  const colors = ['#FF5733', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF9800', '#00BCD4', '#E91E63'];

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
    const interactionPercentage = totalContacts > 0 ? Math.round((totalInteraction / totalContacts) * 100) : 0;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {title} ({metricType === 'all' ? `Sites: ${totalSites}, Contacts: ${totalContacts}, Interactions: ${totalInteraction} (${interactionPercentage}%)` : 
                     metricType === 'sites' ? `Sites: ${totalSites}` :
                     metricType === 'contacts' ? `Unique Contacts: ${totalContacts}` :
                     `Customer Interactions: ${totalInteraction} (${interactionPercentage}%)`})
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
                            <p className="text-sm text-muted-foreground">
                              Customer Interactions: {data.customerInteraction} 
                              {data.uniqueContacts > 0 && ` (${Math.round((data.customerInteraction / data.uniqueContacts) * 100)}%)`}
                            </p>
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
                  <Bar 
                    dataKey="customerInteraction" 
                    fill="#2196F3" 
                    radius={[8, 8, 0, 0]} 
                    label={(props: any) => {
                      if (!props.payload) return null;
                      const percentage = props.payload.uniqueContacts > 0 
                        ? Math.round((props.payload.customerInteraction / props.payload.uniqueContacts) * 100)
                        : 0;
                      return (
                        <text 
                          x={props.x + props.width / 2} 
                          y={props.y - 5} 
                          fill="hsl(var(--foreground))" 
                          textAnchor="middle"
                          fontSize={12}
                        >
                          {`${props.value} (${percentage}%)`}
                        </text>
                      );
                    }}
                  />
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
          <CardTitle className="text-2xl">
            Week on Week Statistics by {viewType === 'individual' ? 'Agent' : 'Team'}
          </CardTitle>
          <CardDescription>
            Weekly trends showing {metricType === 'all' ? 'all metrics' : 
                                   metricType === 'sites' ? 'sites only' :
                                   metricType === 'contacts' ? 'unique contacts only' :
                                   'customer interactions only'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyTrendData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No weekly data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={weeklyTrendData} margin={{ top: 30, right: 30, left: 20, bottom: 80 }}>
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-foreground mb-2">{payload[0].payload.week}</p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              {entry.name}: {entry.value}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {metricType === 'all' && agentKeys.map((agent, index) => (
                  <Bar key={agent} dataKey={agent} fill={colors[index % colors.length]} />
                ))}
                {metricType === 'sites' && agentKeys.map((agent, index) => (
                  <Bar key={agent} dataKey={agent} fill={colors[index % colors.length]} />
                ))}
                {metricType === 'contacts' && agentKeys.map((agent, index) => (
                  <Bar key={`${agent}_contacts`} dataKey={`${agent}_contacts`} fill={colors[index % colors.length]} name={agent} />
                ))}
                {metricType === 'interaction' && agentKeys.map((agent, index) => (
                  <Bar key={`${agent}_interaction`} dataKey={`${agent}_interaction`} fill={colors[index % colors.length]} name={agent} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Current Month Statistics */}
      <ChartCard 
        title="Current Month" 
        description={`${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} - Sites added this month`}
        data={monthData}
        color="#9C27B0"
      />

      {/* Daily Statistics Table */}
      <WeeklyStatsTable data={data} viewType={viewType} />
    </div>
  );
};

export default SiteCharts;
