import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Leaf, AlertCircle, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import SiteCharts from "@/components/SiteCharts";
import OrganisationStats from "@/components/OrganisationStats";
import { SiteRecord } from "@/utils/chartHelpers";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EmailReportDialog } from "@/components/EmailReportDialog";

const Index = () => {
  const [data, setData] = useState<SiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'individual' | 'team'>('individual');
  const [metricType, setMetricType] = useState<'all' | 'sites' | 'contacts' | 'interaction'>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const invokeWithRetry = async (attempt = 1): Promise<any> => {
      const { data, error } = await supabase.functions.invoke('fetch-carbon-data');
      if (error) {
        if (attempt < 3) {
          console.warn(`invoke attempt ${attempt} failed: ${error.message}. Retrying...`);
          await sleep(500 * attempt);
          return invokeWithRetry(attempt + 1);
        }
        throw new Error(`Failed to send a request to the backend after retries: ${error.message}`);
      }
      return data;
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let result: any = null;
        try {
          result = await invokeWithRetry();
        } catch (invErr) {
          console.warn('invoke failed after retries, falling back to direct fetch...', invErr);
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-carbon-data`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 12000);
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            signal: controller.signal,
          }).finally(() => clearTimeout(timeout));

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Direct fetch failed: ${response.status} ${response.statusText} - ${errorText}`);
          }
          result = await response.json();
        }

        const records = Array.isArray(result)
          ? result
          : (result?.data?.sites || result?.sites || result?.records || result?.data || []);
        setData(records);
      } catch (err) {
        console.error('Error details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Site Activity Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Carbon footprint and site activity monitoring
            </p>
            <div className="flex justify-center pt-2">
              <EmailReportDialog />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Fetching data...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Agent Based Statistics Section */}
          {data.length > 0 && !loading && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Agent Based Statistics</h2>
                <p className="text-muted-foreground">Individual agent and team performance metrics</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Data Summary</CardTitle>
                  <CardDescription>
                    Active sites by EDF Energy agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Note: Date filters apply only to "All Active Sites by Agent" chart
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date From</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateFrom && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date To</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateTo && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Display Metrics</label>
                    <Select value={metricType} onValueChange={(value: any) => setMetricType(value)}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder="Select metrics" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stats</SelectItem>
                        <SelectItem value="sites">Only Sites</SelectItem>
                        <SelectItem value="contacts">Only Unique Contacts</SelectItem>
                        <SelectItem value="interaction">Only Customer Interaction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'individual' | 'team')}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="individual">Individual Agents</TabsTrigger>
                      <TabsTrigger value="team">Teams</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              <SiteCharts 
                data={data} 
                viewType={viewType} 
                metricType={metricType}
                dateFrom={dateFrom}
                dateTo={dateTo}
              />
            </div>
          )}

          {/* Organisation Based Section */}
          {data.length > 0 && !loading && (
            <div className="space-y-8 mt-12 pt-12 border-t border-border">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">Organisation Based Statistics</h2>
                <p className="text-muted-foreground">Company-wide metrics and analytics</p>
              </div>

              <OrganisationStats data={data} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
