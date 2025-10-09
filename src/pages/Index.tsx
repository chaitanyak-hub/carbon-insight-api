import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Leaf, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import SiteCharts from "@/components/SiteCharts";
import { SiteRecord } from "@/utils/chartHelpers";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [data, setData] = useState<SiteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'individual' | 'team'>('individual');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Calling backend function...');
        
        const { data: result, error: functionError } = await supabase.functions.invoke(
          'fetch-carbon-data'
        );

        if (functionError) {
          console.error('Function error:', functionError);
          throw new Error(functionError.message || 'Failed to fetch data from backend');
        }

        console.log('Data received:', result);
        
        // Handle both array and object responses
        const records = Array.isArray(result) 
          ? result 
          : (result?.data?.sites || result?.sites || result?.records || result?.data || []);
        setData(records);
      } catch (err) {
        console.error('Error:', err);
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
                <CardContent>
                  <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'individual' | 'team')}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="individual">Individual Agents</TabsTrigger>
                      <TabsTrigger value="team">Teams</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              <SiteCharts data={data} viewType={viewType} />

              {/* Raw Data Card (Collapsible) */}
              <Card>
                <CardHeader>
                  <CardTitle>Raw API Response</CardTitle>
                  <CardDescription>
                    Complete data from Labrador Carbon API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted p-4 max-h-96 overflow-auto">
                    <pre className="text-xs">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
