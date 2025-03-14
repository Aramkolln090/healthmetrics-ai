import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Activity, 
  Heart, 
  LineChart, 
  Plus,
  Droplets,
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MetricForm } from "@/components/metrics/MetricForm";
import { metricsService } from "@/lib/db/metrics";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { HealthMetric, MetricType } from "@/lib/db/types";

const MetricsPage = () => {
  const { user, session, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<MetricType>("blood_pressure");
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchMetrics = async () => {
    if (!user || !session) {
      setMetrics([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await metricsService.getMetrics(user.id, activeTab);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast({
        title: 'Error loading metrics',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      setMetrics([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchMetrics();
    }
  }, [user, session, activeTab, isAuthLoading]);

  const formatMetricData = (metrics: HealthMetric[]) => {
    return metrics.map(metric => ({
      date: format(new Date(metric.recorded_at), 'MMM dd'),
      ...(activeTab === 'blood_pressure'
        ? {
            systolic: (metric.value as any).systolic,
            diastolic: (metric.value as any).diastolic,
          }
        : activeTab === 'glucose'
        ? { value: (metric.value as any).level }
        : activeTab === 'heart_rate'
        ? { value: (metric.value as any).bpm }
        : {}),
    }));
  };

  const renderChart = () => {
    const data = formatMetricData(metrics);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          {activeTab === 'blood_pressure' ? (
            <>
              <Line type="monotone" dataKey="systolic" stroke="#8884d8" name="Systolic" />
              <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" name="Diastolic" />
            </>
          ) : (
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Health Metrics</h1>
          {user && (
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Reading
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Add New Health Reading</DialogTitle>
                <DialogDescription>
                  Enter the details for your new health metric reading.
                </DialogDescription>
                <MetricForm 
                  type={activeTab}
                  onSuccess={() => {
                    setShowAddForm(false);
                    if (user && session) {
                      fetchMetrics();
                    }
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as MetricType)}>
          <TabsList>
            <TabsTrigger value="blood_pressure">
              <Heart className="mr-2 h-4 w-4" />
              Blood Pressure
            </TabsTrigger>
            <TabsTrigger value="glucose">
              <Droplets className="mr-2 h-4 w-4" />
              Glucose
            </TabsTrigger>
            <TabsTrigger value="heart_rate">
              <Activity className="mr-2 h-4 w-4" />
              Heart Rate
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] rounded-md border p-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <LineChart className="inline-block mr-2" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>
                  View your health metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAuthLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    Checking authentication...
                  </div>
                ) : !user || !session ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <p className="text-muted-foreground mb-4">Please sign in to view your metrics</p>
                  </div>
                ) : isLoading ? (
                  <div className="flex justify-center items-center h-[300px]">
                    Loading metrics...
                  </div>
                ) : metrics.length > 0 ? (
                  renderChart()
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <p className="text-muted-foreground mb-4">No data available</p>
                    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setShowAddForm(true)}>
                          <Plus className="mr-2 h-4 w-4" /> Add Your First Reading
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Add Your First Health Reading</DialogTitle>
                        <DialogDescription>
                          Start tracking your health by adding your first metric reading.
                        </DialogDescription>
                        <MetricForm 
                          type={activeTab}
                          onSuccess={() => {
                            setShowAddForm(false);
                            if (user && session) {
                              fetchMetrics();
                            }
                          }}
                          onCancel={() => setShowAddForm(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollArea>
        </Tabs>
      </main>
    </div>
  );
};

export default MetricsPage;
