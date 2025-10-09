import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Leaf, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setData(result);
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

          {/* Data Display */}
          {data && !loading && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>API Response</CardTitle>
                  <CardDescription>
                    Data from Labrador Carbon API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10">
                        Success
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Status: 200 OK
                      </span>
                    </div>
                    
                    <div className="rounded-lg bg-muted p-4">
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="font-medium">Endpoint:</span>
                      <span className="text-sm text-muted-foreground">
                        /carbon/v3/site-activity
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="font-medium">UTM Source:</span>
                      <span className="text-sm text-muted-foreground">edf</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-medium">Site Type:</span>
                      <span className="text-sm text-muted-foreground">ndomestic</span>
                    </div>
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
