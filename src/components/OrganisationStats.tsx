import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SiteRecord } from "@/utils/chartHelpers";
import {
  getLast7DaysDailyStats,
  getCurrentMonthDailyStats,
  getPreviousMonthDailyStats,
  getTotalDailyStats,
  getLast7DaysRecommendationStats,
  getCurrentMonthRecommendationStats,
  getPreviousMonthRecommendationStats,
  getTotalRecommendationStats,
  getLast7DaysStats,
  getCurrentMonthStats,
  getPreviousMonthStats,
  getTotalStats,
} from "@/utils/organisationHelpers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Leaf, Package } from "lucide-react";

interface OrganisationStatsProps {
  data: SiteRecord[];
}

const OrganisationStats = ({ data }: OrganisationStatsProps) => {
  const last7DaysData = getLast7DaysDailyStats(data);
  const currentMonthData = getCurrentMonthDailyStats(data);
  const previousMonthData = getPreviousMonthDailyStats(data);
  const totalData = getTotalDailyStats(data);

  const last7DaysRecStats = getLast7DaysRecommendationStats(data);
  const currentMonthRecStats = getCurrentMonthRecommendationStats(data);
  const previousMonthRecStats = getPreviousMonthRecommendationStats(data);
  const totalRecStats = getTotalRecommendationStats(data);

  const last7DaysTotals = getLast7DaysStats(data);
  const currentMonthTotals = getCurrentMonthStats(data);
  const previousMonthTotals = getPreviousMonthStats(data);
  const totalTotals = getTotalStats(data);

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
            value={`£${last7DaysTotals.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            description="Financial savings"
          />
          <MetricCard
            title="Carbon Savings"
            value={`${last7DaysTotals.totalCarbonSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kg`}
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Sites Added</TableHead>
                    <TableHead className="text-right">Unique Customers</TableHead>
                    <TableHead className="text-right">Interactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {last7DaysData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell className="text-right">{row.sites}</TableCell>
                      <TableCell className="text-right">{row.customers}</TableCell>
                      <TableCell className="text-right">{row.interactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Sites Added</TableHead>
                    <TableHead className="text-right">Unique Customers</TableHead>
                    <TableHead className="text-right">Interactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell className="text-right">{row.sites}</TableCell>
                      <TableCell className="text-right">{row.customers}</TableCell>
                      <TableCell className="text-right">{row.interactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Sites Added</TableHead>
                    <TableHead className="text-right">Unique Customers</TableHead>
                    <TableHead className="text-right">Interactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previousMonthData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell className="text-right">{row.sites}</TableCell>
                      <TableCell className="text-right">{row.customers}</TableCell>
                      <TableCell className="text-right">{row.interactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Sites Added</TableHead>
                    <TableHead className="text-right">Unique Customers</TableHead>
                    <TableHead className="text-right">Interactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell className="text-right">{row.sites}</TableCell>
                      <TableCell className="text-right">{row.customers}</TableCell>
                      <TableCell className="text-right">{row.interactions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total Savings (£)</TableHead>
                    <TableHead className="text-right">Carbon Savings (kg CO₂)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {last7DaysData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell className="text-right">£{row.savings.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.carbonSavings.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Current Month */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Current Month - Daily Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={currentMonthData} margin={{ top: 20, right: 60, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total Savings (£)</TableHead>
                    <TableHead className="text-right">Carbon Savings (kg CO₂)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell className="text-right">£{row.savings.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.carbonSavings.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Previous Month */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Previous Month - Daily Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={previousMonthData} margin={{ top: 20, right: 60, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
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

        {/* Total */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">Total (All Time) - Monthly Savings</CardTitle>
            <CardDescription>Financial and carbon savings identified per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={totalData} margin={{ top: 20, right: 60, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total Savings (£)</TableHead>
                    <TableHead className="text-right">Carbon Savings (kg CO₂)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell className="font-medium">{row.date}</TableCell>
                      <TableCell className="text-right">£{row.savings.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.carbonSavings.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recommendation Type</TableHead>
                    <TableHead className="text-right">Total Savings (£)</TableHead>
                    <TableHead className="text-right">Investment/Opportunity (£)</TableHead>
                    <TableHead className="text-right">Carbon Savings (kg)</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {last7DaysRecStats.map((row) => (
                    <TableRow key={row.type}>
                      <TableCell className="font-medium">{row.type}</TableCell>
                      <TableCell className="text-right">£{row.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">£{row.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">{row.totalCarbonSavings.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recommendation Type</TableHead>
                    <TableHead className="text-right">Total Savings (£)</TableHead>
                    <TableHead className="text-right">Investment/Opportunity (£)</TableHead>
                    <TableHead className="text-right">Carbon Savings (kg)</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthRecStats.map((row) => (
                    <TableRow key={row.type}>
                      <TableCell className="font-medium">{row.type}</TableCell>
                      <TableCell className="text-right">£{row.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">£{row.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">{row.totalCarbonSavings.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Data Table</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recommendation Type</TableHead>
                    <TableHead className="text-right">Total Savings (£)</TableHead>
                    <TableHead className="text-right">Investment/Opportunity (£)</TableHead>
                    <TableHead className="text-right">Carbon Savings (kg)</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalRecStats.map((row) => (
                    <TableRow key={row.type}>
                      <TableCell className="font-medium">{row.type}</TableCell>
                      <TableCell className="text-right">£{row.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">£{row.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">{row.totalCarbonSavings.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganisationStats;
