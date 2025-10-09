import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { filterAndGroupSites, getDateRanges, SiteRecord } from "@/utils/chartHelpers";

interface SiteChartsProps {
  data: SiteRecord[];
}

const SiteCharts = ({ data }: SiteChartsProps) => {
  const dateRanges = getDateRanges();

  const totalData = filterAndGroupSites(data);
  const weekData = filterAndGroupSites(data, dateRanges.thisWeek.start, dateRanges.thisWeek.end);
  const yesterdayData = filterAndGroupSites(data, dateRanges.yesterday.start, dateRanges.yesterday.end);
  const todayData = filterAndGroupSites(data, dateRanges.today.start, dateRanges.today.end);

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
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="sites" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard 
          title="Total Active Sites" 
          description="All time sites by agent"
          data={totalData}
          color="hsl(var(--primary))"
        />
        <ChartCard 
          title="This Week" 
          description="Monday to Sunday"
          data={weekData}
          color="hsl(var(--accent))"
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard 
          title="Yesterday" 
          description="Sites added yesterday"
          data={yesterdayData}
          color="hsl(142 60% 45%)"
        />
        <ChartCard 
          title="Today" 
          description="Sites added today"
          data={todayData}
          color="hsl(142 76% 36%)"
        />
      </div>
    </div>
  );
};

export default SiteCharts;
