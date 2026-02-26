import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteRecord } from "@/utils/chartHelpers";
import {
  getLast7DaysDailyStats,
  getCurrentMonthDailyStats,
  getPreviousMonthDailyStats,
  getCurrentMonthWeeklyStats,
  getPreviousMonthWeeklyStats,
  getTotalDailyStats,
  getLast7DaysRecommendationStats,
  getCurrentMonthRecommendationStats,
  getPreviousMonthRecommendationStats,
  getTotalRecommendationStats,
  getLast7DaysStats,
  getCurrentMonthStats,
  getPreviousMonthStats,
  getTotalStats,
  getOctoberDailyStats,
  getOctoberWeeklyStats,
  getOctoberStats,
  getOctoberRecommendationStats,
} from "@/utils/organisationHelpers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Leaf, Package } from "lucide-react";

interface OrganisationStatsProps {
  data: SiteRecord[];
}

const OrganisationStats = ({ data }: OrganisationStatsProps) => {
  const last7DaysData = getLast7DaysDailyStats(data);
  const currentMonthData = getCurrentMonthDailyStats(data);
  const currentMonthWeeklyData = getCurrentMonthWeeklyStats(data);
  const previousMonthData = getPreviousMonthDailyStats(data);
  const previousMonthWeeklyData = getPreviousMonthWeeklyStats(data);
  const totalData = getTotalDailyStats(data);
  const octoberDailyData = getOctoberDailyStats(data);
  const octoberWeeklyData = getOctoberWeeklyStats(data);

  const last7DaysRecStats = getLast7DaysRecommendationStats(data);
  const currentMonthRecStats = getCurrentMonthRecommendationStats(data);
  const previousMonthRecStats = getPreviousMonthRecommendationStats(data);
  const totalRecStats = getTotalRecommendationStats(data);
  const octoberRecStats = getOctoberRecommendationStats(data);

  const last7DaysTotals = getLast7DaysStats(data);
  const currentMonthTotals = getCurrentMonthStats(data);
  const previousMonthTotals = getPreviousMonthStats(data);
  const totalTotals = getTotalStats(data);
  const octoberTotals = getOctoberStats(data);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const MetricCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold text-foreground mt-2">{value}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-12">
      {/* Overview Metrics - Last 7 Days */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">Overview - Last 7 Days</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Sites"
            value={last7DaysTotals.totalSites}
            icon={Package}
            description="Sites added"
          />
          <MetricCard
            title="Total Savings"
            value={`£${(last7DaysTotals.totalSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            description="Financial savings"
          />
          <MetricCard
            title="Carbon Savings"
            value={`${(last7DaysTotals.totalCarbonSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kg`}
            icon={Leaf}
            description="CO₂ reduction"
          />
          <MetricCard
            title="Unique Customers"
            value={last7DaysTotals.uniqueCustomers}
            icon={TrendingUp}
            description="Active customers"
          />
        </div>
      </div>

      {/* Site Statistics */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-foreground">Site Statistics</h3>
        
        {/* Last 7 Days */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Last 7 Days - Daily Site Activity</CardTitle>
            <CardDescription>Sites added, unique customers, and interactions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={last7DaysData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorSites" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="sites" fill="url(#colorSites)" name="Sites Added" radius={[8, 8, 0, 0]} />
                <Bar dataKey="customers" fill="url(#colorCustomers)" name="Unique Customers" radius={[8, 8, 0, 0]} />
                <Bar dataKey="interactions" fill="url(#colorInteractions)" name="Interactions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Current Month */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Current Month - Daily Site Activity</CardTitle>
            <CardDescription>Sites added, unique customers, and interactions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={currentMonthData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="sites" fill="url(#colorSites)" name="Sites Added" radius={[8, 8, 0, 0]} />
                <Bar dataKey="customers" fill="url(#colorCustomers)" name="Unique Customers" radius={[8, 8, 0, 0]} />
                <Bar dataKey="interactions" fill="url(#colorInteractions)" name="Interactions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Previous Month */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Previous Month - Daily Site Activity</CardTitle>
            <CardDescription>Sites added, unique customers, and interactions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={previousMonthData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="sites" fill="url(#colorSites)" name="Sites Added" radius={[8, 8, 0, 0]} />
                <Bar dataKey="customers" fill="url(#colorCustomers)" name="Unique Customers" radius={[8, 8, 0, 0]} />
                <Bar dataKey="interactions" fill="url(#colorInteractions)" name="Interactions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Total (All Time) - Monthly Site Activity</CardTitle>
            <CardDescription>Sites added, unique customers, and interactions per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={totalData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="sites" fill="url(#colorSites)" name="Sites Added" radius={[8, 8, 0, 0]} />
                <Bar dataKey="customers" fill="url(#colorCustomers)" name="Unique Customers" radius={[8, 8, 0, 0]} />
                <Bar dataKey="interactions" fill="url(#colorInteractions)" name="Interactions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* October 2025 Statistics */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">October 2025 Statistics</h3>
        </div>

        {/* October Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Sites"
            value={octoberTotals.totalSites}
            icon={Package}
            description="Sites added in October"
          />
          <MetricCard
            title="Total Savings"
            value={`£${(octoberTotals.totalSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            description="Financial savings"
          />
          <MetricCard
            title="Carbon Savings"
            value={`${(octoberTotals.totalCarbonSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kg`}
            icon={Leaf}
            description="CO₂ reduction"
          />
          <MetricCard
            title="Unique Customers"
            value={octoberTotals.uniqueCustomers}
            icon={TrendingUp}
            description="Active customers"
          />
        </div>

        {/* October Daily Site Activity */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">October 2025 - Daily Site Activity</CardTitle>
            <CardDescription>Sites added, unique customers, and interactions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={octoberDailyData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="sites" fill="url(#colorSites)" name="Sites Added" radius={[8, 8, 0, 0]} />
                <Bar dataKey="customers" fill="url(#colorCustomers)" name="Unique Customers" radius={[8, 8, 0, 0]} />
                <Bar dataKey="interactions" fill="url(#colorInteractions)" name="Interactions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* October Weekly Savings */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">October 2025 - Weekly Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={octoberWeeklyData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Savings (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Savings (£)') return `£${Number(value).toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="url(#colorSavings)" name="Total Savings (£)" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="carbonSavings" fill="url(#colorCarbon)" name="Carbon Savings (kg CO₂)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold text-foreground">Week</th>
                    <th className="text-right p-2 font-semibold text-foreground">Sites</th>
                    <th className="text-right p-2 font-semibold text-foreground">Customers</th>
                    <th className="text-right p-2 font-semibold text-foreground">Interactions</th>
                    <th className="text-right p-2 font-semibold text-foreground">Savings (£)</th>
                    <th className="text-right p-2 font-semibold text-foreground">Carbon Savings (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {octoberWeeklyData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2 text-foreground">{row.date}</td>
                      <td className="text-right p-2 text-foreground">{row.sites || 0}</td>
                      <td className="text-right p-2 text-foreground">{row.customers || 0}</td>
                      <td className="text-right p-2 text-foreground">{row.interactions || 0}</td>
                      <td className="text-right p-2 text-foreground">£{(row.savings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right p-2 text-foreground">{(row.carbonSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* October Recommendation Analysis */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">October 2025 - Recommendation Analysis</CardTitle>
            <CardDescription>Investment/Opportunity, savings, and carbon savings by recommendation type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={octoberRecStats} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="type" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Investment/Opportunity (£)' || name === 'Total Savings (£)') return `£${Number(value).toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="totalCost" fill="hsl(var(--chart-4))" name="Investment/Opportunity (£)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="totalSavings" fill="hsl(var(--chart-1))" name="Total Savings (£)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="totalCarbonSavings" fill="hsl(var(--chart-2))" name="Carbon Savings (kg CO₂)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold text-foreground">Type</th>
                    <th className="text-right p-2 font-semibold text-foreground">Count</th>
                    <th className="text-right p-2 font-semibold text-foreground">Total Savings (£)</th>
                    <th className="text-right p-2 font-semibold text-foreground">Investment/Opportunity (£)</th>
                    <th className="text-right p-2 font-semibold text-foreground">Carbon Savings (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {octoberRecStats.map((stat, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2 text-foreground font-medium">{stat.type}</td>
                      <td className="text-right p-2 text-foreground">{(stat.count || 0).toLocaleString()}</td>
                      <td className="text-right p-2 text-foreground">£{(stat.totalSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right p-2 text-foreground">£{(stat.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right p-2 text-foreground">{(stat.totalCarbonSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Statistics */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-foreground">Savings Statistics</h3>
        
        {/* Last 7 Days */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Last 7 Days - Daily Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={last7DaysData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Savings (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Savings (£)') return `£${Number(value).toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="url(#colorSavings)" name="Total Savings (£)" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="carbonSavings" fill="url(#colorCarbon)" name="Carbon Savings (kg CO₂)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Current Month */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Current Month - Weekly Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={currentMonthWeeklyData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Savings (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Savings (£)') return `£${Number(value).toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="url(#colorSavings)" name="Total Savings (£)" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="carbonSavings" fill="url(#colorCarbon)" name="Carbon Savings (kg CO₂)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold text-foreground">Week</th>
                    <th className="text-right p-2 font-semibold text-foreground">Sites</th>
                    <th className="text-right p-2 font-semibold text-foreground">Customers</th>
                    <th className="text-right p-2 font-semibold text-foreground">Interactions</th>
                    <th className="text-right p-2 font-semibold text-foreground">Savings (£)</th>
                    <th className="text-right p-2 font-semibold text-foreground">Carbon Savings (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthWeeklyData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2 text-foreground">{row.date}</td>
                      <td className="text-right p-2 text-foreground">{row.sites || 0}</td>
                      <td className="text-right p-2 text-foreground">{row.customers || 0}</td>
                      <td className="text-right p-2 text-foreground">{row.interactions || 0}</td>
                      <td className="text-right p-2 text-foreground">£{(row.savings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right p-2 text-foreground">{(row.carbonSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Previous Month */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Previous Month - Weekly Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={previousMonthWeeklyData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Savings (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Total Savings (£)') return `£${Number(value).toFixed(2)}`;
                    if (name === 'Carbon Savings (kg CO₂)') return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="savings" fill="url(#colorSavings)" name="Total Savings (£)" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="carbonSavings" fill="url(#colorCarbon)" name="Carbon Savings (kg CO₂)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold text-foreground">Week</th>
                    <th className="text-right p-2 font-semibold text-foreground">Sites</th>
                    <th className="text-right p-2 font-semibold text-foreground">Customers</th>
                    <th className="text-right p-2 font-semibold text-foreground">Interactions</th>
                    <th className="text-right p-2 font-semibold text-foreground">Savings (£)</th>
                    <th className="text-right p-2 font-semibold text-foreground">Carbon Savings (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {previousMonthWeeklyData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2 text-foreground">{row.date}</td>
                      <td className="text-right p-2 text-foreground">{row.sites || 0}</td>
                      <td className="text-right p-2 text-foreground">{row.customers || 0}</td>
                      <td className="text-right p-2 text-foreground">{row.interactions || 0}</td>
                      <td className="text-right p-2 text-foreground">£{(row.savings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right p-2 text-foreground">{(row.carbonSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Total (All Time) - Monthly Savings</CardTitle>
            <CardDescription>Financial savings, energy cost, and carbon savings identified per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={totalData} margin={{ top: 20, right: 60, left: 20, bottom: 80 }}>
                <defs>
                  <linearGradient id="colorEnergyCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis yAxisId="left" className="text-xs" label={{ value: 'Amount (£)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" className="text-xs" label={{ value: 'Carbon (kg CO₂)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name.includes('£')) return `£${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    if (name.includes('CO₂')) return `${Number(value).toFixed(2)} kg`;
                    return value;
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="energyCost" fill="url(#colorEnergyCost)" name="Current Energy Cost (£)" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="left" dataKey="savings" fill="url(#colorSavings)" name="Total Savings (£)" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="carbonSavings" fill="url(#colorCarbon)" name="Carbon Savings (kg CO₂)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold text-foreground">Month</th>
                    <th className="text-right p-2 font-semibold text-foreground">Sites</th>
                    <th className="text-right p-2 font-semibold text-foreground">Energy Cost (£)</th>
                    <th className="text-right p-2 font-semibold text-foreground">Savings (£)</th>
                    <th className="text-right p-2 font-semibold text-foreground">Carbon Savings (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {totalData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2 text-foreground">{row.date}</td>
                      <td className="text-right p-2 text-foreground">{row.sites || 0}</td>
                      <td className="text-right p-2 text-foreground">£{(row.energyCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right p-2 text-foreground">£{(row.savings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right p-2 text-foreground">{(row.carbonSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation Type Analysis - Last 7 Days */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">Recommendation Analysis - Last 7 Days</h3>
        </div>
        
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">By Recommendation Type</CardTitle>
            <CardDescription>Savings, costs, and carbon impact by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={last7DaysRecStats} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="type" className="text-xs" width={90} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name.includes('£') || name.includes('Savings') || name.includes('Investment') || name.includes('Opportunity')) {
                      return `£${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                    if (name.includes('Carbon')) {
                      return `${Number(value).toFixed(2)} kg CO₂`;
                    }
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="totalSavings" fill="hsl(var(--chart-1))" name="Total Savings (£)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="totalCost" fill="hsl(var(--chart-4))" name="Total Investment / Opportunity (£)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="totalCarbonSavings" fill="hsl(var(--chart-2))" name="Carbon Savings (kg)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation Type Analysis - Current Month */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">Recommendation Analysis - Current Month</h3>
        </div>
        
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">By Recommendation Type</CardTitle>
            <CardDescription>Savings, costs, and carbon impact by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={currentMonthRecStats} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="type" className="text-xs" width={90} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name.includes('£') || name.includes('Savings') || name.includes('Investment') || name.includes('Opportunity')) {
                      return `£${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                    if (name.includes('Carbon')) {
                      return `${Number(value).toFixed(2)} kg CO₂`;
                    }
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="totalSavings" fill="hsl(var(--chart-1))" name="Total Savings (£)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="totalCost" fill="hsl(var(--chart-4))" name="Total Investment / Opportunity (£)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="totalCarbonSavings" fill="hsl(var(--chart-2))" name="Carbon Savings (kg)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation Type Analysis - Previous Month */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">Recommendation Analysis - Previous Month</h3>
        </div>
        
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">By Recommendation Type</CardTitle>
            <CardDescription>Savings, costs, and carbon impact by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={previousMonthRecStats} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="type" className="text-xs" width={90} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name.includes('£') || name.includes('Savings') || name.includes('Investment') || name.includes('Opportunity')) {
                      return `£${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                    if (name.includes('Carbon')) {
                      return `${Number(value).toFixed(2)} kg CO₂`;
                    }
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="totalSavings" fill="hsl(var(--chart-1))" name="Total Savings (£)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="totalCost" fill="hsl(var(--chart-4))" name="Total Investment / Opportunity (£)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="totalCarbonSavings" fill="hsl(var(--chart-2))" name="Carbon Savings (kg)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation Type Analysis - Total */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">Recommendation Analysis - All Time</h3>
        </div>
        
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">By Recommendation Type</CardTitle>
            <CardDescription>Total savings, costs, and carbon impact by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={totalRecStats} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="type" className="text-xs" width={90} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name.includes('£') || name.includes('Savings') || name.includes('Investment') || name.includes('Opportunity')) {
                      return `£${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                    if (name.includes('Carbon')) {
                      return `${Number(value).toFixed(2)} kg CO₂`;
                    }
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="totalSavings" fill="hsl(var(--chart-1))" name="Total Savings (£)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="totalCost" fill="hsl(var(--chart-4))" name="Total Investment / Opportunity (£)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="totalCarbonSavings" fill="hsl(var(--chart-2))" name="Carbon Savings (kg)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold text-foreground">Recommendation Type</th>
                    <th className="text-right p-2 font-semibold text-foreground">Count</th>
                    <th className="text-right p-2 font-semibold text-foreground">Total Savings (£)</th>
                    <th className="text-right p-2 font-semibold text-foreground">Total Investment/Opportunity (£)</th>
                    <th className="text-right p-2 font-semibold text-foreground">Carbon Savings (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {totalRecStats.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2 text-foreground capitalize">{row.type}</td>
                      <td className="text-right p-2 text-foreground">{row.count || 0}</td>
                      <td className="text-right p-2 text-foreground">£{(row.totalSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right p-2 text-foreground">£{(row.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right p-2 text-foreground">{(row.totalCarbonSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganisationStats;
