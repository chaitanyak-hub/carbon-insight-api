import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteRecord } from "@/utils/chartHelpers";
import {
  getLast7DaysStats,
  getCurrentMonthStats,
  getPreviousMonthStats,
  getTotalStats,
} from "@/utils/organisationHelpers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Building2, Users, MousePointerClick, Leaf, Coins } from "lucide-react";

interface OrganisationStatsProps {
  data: SiteRecord[];
}

const OrganisationStats = ({ data }: OrganisationStatsProps) => {
  const last7DaysStats = getLast7DaysStats(data);
  const currentMonthStats = getCurrentMonthStats(data);
  const previousMonthStats = getPreviousMonthStats(data);
  const totalStats = getTotalStats(data);

  const siteStatsData = [
    { period: "Last 7 Days", sites: last7DaysStats.totalSites, customers: last7DaysStats.uniqueCustomers, interactions: last7DaysStats.totalInteractions },
    { period: "Current Month", sites: currentMonthStats.totalSites, customers: currentMonthStats.uniqueCustomers, interactions: currentMonthStats.totalInteractions },
    { period: "Previous Month", sites: previousMonthStats.totalSites, customers: previousMonthStats.uniqueCustomers, interactions: previousMonthStats.totalInteractions },
    { period: "Total", sites: totalStats.totalSites, customers: totalStats.uniqueCustomers, interactions: totalStats.totalInteractions },
  ];

  const savingsStatsData = [
    { period: "Last 7 Days", savings: last7DaysStats.totalSavings, carbon: last7DaysStats.totalCarbonSavings },
    { period: "Current Month", savings: currentMonthStats.totalSavings, carbon: currentMonthStats.totalCarbonSavings },
    { period: "Previous Month", savings: previousMonthStats.totalSavings, carbon: previousMonthStats.totalCarbonSavings },
    { period: "Total", savings: totalStats.totalSavings, carbon: totalStats.totalCarbonSavings },
  ];

  const StatCard = ({ title, value, icon: Icon, description }: { title: string; value: number; icon: any; description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Site Statistics */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Site Statistics</h3>
        
        {/* Last 7 Days */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-3">Last 7 Days</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Sites Added" value={last7DaysStats.totalSites} icon={Building2} description="Active sites in last 7 days" />
            <StatCard title="Unique Customers" value={last7DaysStats.uniqueCustomers} icon={Users} description="Unique contacts" />
            <StatCard title="Total Interactions" value={last7DaysStats.totalInteractions} icon={MousePointerClick} description="Customer logins" />
          </div>
        </div>

        {/* Current Month */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-3">Current Month</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Sites Added" value={currentMonthStats.totalSites} icon={Building2} description="Active sites this month" />
            <StatCard title="Unique Customers" value={currentMonthStats.uniqueCustomers} icon={Users} description="Unique contacts" />
            <StatCard title="Total Interactions" value={currentMonthStats.totalInteractions} icon={MousePointerClick} description="Customer logins" />
          </div>
        </div>

        {/* Previous Month */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-3">Previous Month</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Sites Added" value={previousMonthStats.totalSites} icon={Building2} description="Active sites last month" />
            <StatCard title="Unique Customers" value={previousMonthStats.uniqueCustomers} icon={Users} description="Unique contacts" />
            <StatCard title="Total Interactions" value={previousMonthStats.totalInteractions} icon={MousePointerClick} description="Customer logins" />
          </div>
        </div>

        {/* Total */}
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-3">Total (All Time)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Sites Added" value={totalStats.totalSites} icon={Building2} description="All active sites" />
            <StatCard title="Unique Customers" value={totalStats.uniqueCustomers} icon={Users} description="Unique contacts" />
            <StatCard title="Total Interactions" value={totalStats.totalInteractions} icon={MousePointerClick} description="Customer logins" />
          </div>
        </div>
      </div>

      {/* Savings Statistics */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Savings Statistics</h3>
        
        {/* Last 7 Days */}
        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days - Savings</CardTitle>
            <CardDescription>Total financial and carbon savings identified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <StatCard title="Total Savings" value={last7DaysStats.totalSavings} icon={Coins} description={`£${last7DaysStats.totalSavings.toFixed(2)}`} />
              <StatCard title="Carbon Savings" value={last7DaysStats.totalCarbonSavings} icon={Leaf} description={`${last7DaysStats.totalCarbonSavings.toFixed(2)} kg CO₂`} />
            </div>
          </CardContent>
        </Card>

        {/* Current Month */}
        <Card>
          <CardHeader>
            <CardTitle>Current Month - Savings</CardTitle>
            <CardDescription>Total financial and carbon savings identified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <StatCard title="Total Savings" value={currentMonthStats.totalSavings} icon={Coins} description={`£${currentMonthStats.totalSavings.toFixed(2)}`} />
              <StatCard title="Carbon Savings" value={currentMonthStats.totalCarbonSavings} icon={Leaf} description={`${currentMonthStats.totalCarbonSavings.toFixed(2)} kg CO₂`} />
            </div>
          </CardContent>
        </Card>

        {/* Previous Month */}
        <Card>
          <CardHeader>
            <CardTitle>Previous Month - Savings</CardTitle>
            <CardDescription>Total financial and carbon savings identified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <StatCard title="Total Savings" value={previousMonthStats.totalSavings} icon={Coins} description={`£${previousMonthStats.totalSavings.toFixed(2)}`} />
              <StatCard title="Carbon Savings" value={previousMonthStats.totalCarbonSavings} icon={Leaf} description={`${previousMonthStats.totalCarbonSavings.toFixed(2)} kg CO₂`} />
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardHeader>
            <CardTitle>Total (All Time) - Savings</CardTitle>
            <CardDescription>Total financial and carbon savings identified</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <StatCard title="Total Savings" value={totalStats.totalSavings} icon={Coins} description={`£${totalStats.totalSavings.toFixed(2)}`} />
              <StatCard title="Carbon Savings" value={totalStats.totalCarbonSavings} icon={Leaf} description={`${totalStats.totalCarbonSavings.toFixed(2)} kg CO₂`} />
            </div>
          </CardContent>
        </Card>

        {/* Savings Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Comparison</CardTitle>
            <CardDescription>Financial and carbon savings across all time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={savingsStatsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="period" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Savings (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Savings (£)') return `£${value.toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${value.toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="hsl(var(--primary))" name="Total Savings (£)" />
                <Bar yAxisId="right" dataKey="carbon" fill="hsl(var(--chart-2))" name="Carbon Savings (kg CO₂)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganisationStats;
