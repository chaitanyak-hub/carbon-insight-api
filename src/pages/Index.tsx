import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Leaf, AlertCircle, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import SiteCharts from "@/components/SiteCharts";
import { SiteRecord } from "@/utils/chartHelpers";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Index = () => {
  const [data, setData] = useState<SiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'individual' | 'team'>('individual');
  const [metricType, setMetricType] = useState<'all' | 'sites' | 'contacts' | 'interaction'>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Calling backend function...');
        
        const { data: result, error: functionError } = await supabase.functions.invoke('fetch-carbon-data');

        if (functionError) {
          console.error('Function error:', functionError);
          throw new Error(`Failed to fetch data: ${functionError.message}`);
        }

        console.log('Data received:', result);
        
        // Handle both array and object responses
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

          {/* Charts Display */}
          {data.length > 0 && !loading && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
