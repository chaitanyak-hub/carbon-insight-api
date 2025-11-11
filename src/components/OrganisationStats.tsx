import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteRecord } from "@/utils/chartHelpers";
import {
  getLast7DaysDailyStats,
  getCurrentMonthDailyStats,
  getPreviousMonthDailyStats,
  getTotalDailyStats,
} from "@/utils/organisationHelpers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface OrganisationStatsProps {
  data: SiteRecord[];
}

const OrganisationStats = ({ data }: OrganisationStatsProps) => {
  const last7DaysData = getLast7DaysDailyStats(data);
  const currentMonthData = getCurrentMonthDailyStats(data);
  const previousMonthData = getPreviousMonthDailyStats(data);
  const totalData = getTotalDailyStats(data);

  return (
    <div className="space-y-8">
      {/* Site Statistics */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Site Statistics</h3>
        
        {/* Last 7 Days */}
        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days - Daily Site Activity</CardTitle>
            <CardDescription>Sites added, unique customers, and interactions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="sites" fill="hsl(var(--chart-1))" name="Sites Added" />
                <Bar dataKey="customers" fill="hsl(var(--chart-2))" name="Unique Customers" />
                <Bar dataKey="interactions" fill="hsl(var(--chart-3))" name="Interactions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Current Month */}
        <Card>
          <CardHeader>
            <CardTitle>Current Month - Daily Site Activity</CardTitle>
            <CardDescription>Sites added, unique customers, and interactions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={currentMonthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="sites" fill="hsl(var(--chart-1))" name="Sites Added" />
                <Bar dataKey="customers" fill="hsl(var(--chart-2))" name="Unique Customers" />
                <Bar dataKey="interactions" fill="hsl(var(--chart-3))" name="Interactions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Previous Month */}
        <Card>
          <CardHeader>
            <CardTitle>Previous Month - Daily Site Activity</CardTitle>
            <CardDescription>Sites added, unique customers, and interactions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={previousMonthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="sites" fill="hsl(var(--chart-1))" name="Sites Added" />
                <Bar dataKey="customers" fill="hsl(var(--chart-2))" name="Unique Customers" />
                <Bar dataKey="interactions" fill="hsl(var(--chart-3))" name="Interactions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardHeader>
            <CardTitle>Total (All Time) - Monthly Site Activity</CardTitle>
            <CardDescription>Sites added, unique customers, and interactions per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={totalData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="sites" fill="hsl(var(--chart-1))" name="Sites Added" />
                <Bar dataKey="customers" fill="hsl(var(--chart-2))" name="Unique Customers" />
                <Bar dataKey="interactions" fill="hsl(var(--chart-3))" name="Interactions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Savings Statistics */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Savings Statistics</h3>
        
        {/* Last 7 Days */}
        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days - Daily Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Savings (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Savings (£)') return `£${Number(value).toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="hsl(var(--primary))" name="Total Savings (£)" />
                <Bar yAxisId="right" dataKey="carbonSavings" fill="hsl(var(--chart-2))" name="Carbon Savings (kg CO₂)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Current Month */}
        <Card>
          <CardHeader>
            <CardTitle>Current Month - Daily Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={currentMonthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Savings (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Savings (£)') return `£${Number(value).toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="hsl(var(--primary))" name="Total Savings (£)" />
                <Bar yAxisId="right" dataKey="carbonSavings" fill="hsl(var(--chart-2))" name="Carbon Savings (kg CO₂)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Previous Month */}
        <Card>
          <CardHeader>
            <CardTitle>Previous Month - Daily Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={previousMonthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Savings (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Savings (£)') return `£${Number(value).toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="hsl(var(--primary))" name="Total Savings (£)" />
                <Bar yAxisId="right" dataKey="carbonSavings" fill="hsl(var(--chart-2))" name="Carbon Savings (kg CO₂)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardHeader>
            <CardTitle>Total (All Time) - Monthly Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={totalData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Savings (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Savings (£)') return `£${Number(value).toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="hsl(var(--primary))" name="Total Savings (£)" />
                <Bar yAxisId="right" dataKey="carbonSavings" fill="hsl(var(--chart-2))" name="Carbon Savings (kg CO₂)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganisationStats;
