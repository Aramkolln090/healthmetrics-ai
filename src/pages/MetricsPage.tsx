import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { 
  Activity, 
  Heart, 
  LineChart, 
  Plus,
  Droplets,
  User,
  BarChart3,
  Home,
  Calendar,
  Settings,
  Clock,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  X
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { MetricForm } from "@/components/metrics/MetricForm";
import { metricsService } from "@/lib/db/metrics";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, subDays } from "date-fns";
import { HealthMetric, MetricType } from "@/lib/db/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { SharedSidebar } from "@/components/ui/shared-sidebar";

const MetricsPage = () => {
  const { user, session, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MetricType>("blood_pressure");
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [recentEntries, setRecentEntries] = useState<HealthMetric[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard');
  
  // Add separate state for each metric type
  const [bloodPressureMetrics, setBloodPressureMetrics] = useState<HealthMetric[]>([]);
  const [glucoseMetrics, setGlucoseMetrics] = useState<HealthMetric[]>([]);
  const [heartRateMetrics, setHeartRateMetrics] = useState<HealthMetric[]>([]);

  const fetchMetrics = async () => {
    if (!user || !session) {
      setMetrics([]);
      setBloodPressureMetrics([]);
      setGlucoseMetrics([]);
      setHeartRateMetrics([]);
      setRecentEntries([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch data for the active tab (for the chart)
      const data = await metricsService.getMetrics(user.id, activeTab);
      setMetrics(data);
      
      // Fetch all metric types in parallel
      const [bloodPressureData, glucoseData, heartRateData] = await Promise.all([
        metricsService.getMetrics(user.id, 'blood_pressure'),
        metricsService.getMetrics(user.id, 'glucose'),
        metricsService.getMetrics(user.id, 'heart_rate')
      ]);
      
      // Set data for each metric type
      setBloodPressureMetrics(bloodPressureData);
      setGlucoseMetrics(glucoseData);
      setHeartRateMetrics(heartRateData);
      
      // Combine all metrics for recent entries
      const allMetrics = [...bloodPressureData, ...glucoseData, ...heartRateData];
      allMetrics.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
      setRecentEntries(allMetrics.slice(0, 5));
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast({
        title: 'Error loading metrics',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      setMetrics([]);
      setBloodPressureMetrics([]);
      setGlucoseMetrics([]);
      setHeartRateMetrics([]);
      setRecentEntries([]);
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
      fullDate: format(new Date(metric.recorded_at), 'MMM dd, yyyy HH:mm'),
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
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'blood_pressure' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorSystolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorDiastolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                formatter={(value, name) => [`${value} mmHg`, name === 'systolic' ? 'Systolic' : 'Diastolic']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area type="monotone" dataKey="systolic" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSystolic)" name="Systolic" />
              <Area type="monotone" dataKey="diastolic" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorDiastolic)" name="Diastolic" />
            </AreaChart>
          ) : (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                formatter={(value) => [
                  `${value} ${activeTab === 'glucose' ? 'mg/dL' : activeTab === 'heart_rate' ? 'bpm' : ''}`,
                  activeTab === 'glucose' ? 'Glucose' : activeTab === 'heart_rate' ? 'Heart Rate' : activeTab
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                name={activeTab === 'glucose' ? 'Glucose' : activeTab === 'heart_rate' ? 'Heart Rate' : activeTab}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  const getMetricCardIcon = (type: MetricType) => {
    switch (type) {
      case 'blood_pressure':
        return <Heart className="h-5 w-5 text-healthStatus-alert" />;
      case 'glucose':
        return <Droplets className="h-5 w-5 text-primary" />;
      case 'heart_rate':
        return <Activity className="h-5 w-5 text-healthStatus-warning" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getMetricValue = (metric: HealthMetric) => {
    switch (metric.type) {
      case 'blood_pressure':
        return `${(metric.value as any).systolic}/${(metric.value as any).diastolic} mmHg`;
      case 'glucose':
        return `${(metric.value as any).level} ${(metric.value as any).unit || 'mg/dL'}`;
      case 'heart_rate':
        return `${(metric.value as any).bpm} bpm`;
      default:
        return JSON.stringify(metric.value);
    }
  };

  const formatMetricType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getSidebarItems = () => {
    return [
      { icon: <Home className="h-5 w-5" />, label: 'Dashboard', onClick: () => setActiveView('dashboard') },
      { icon: <BarChart3 className="h-5 w-5" />, label: 'History', onClick: () => setActiveView('history') },
      { icon: <Calendar className="h-5 w-5" />, label: 'Calendar', onClick: () => navigate('/calendar') },
      { icon: <Settings className="h-5 w-5" />, label: 'Settings', onClick: () => navigate('/settings') },
    ];
  }

  const getMetricSummary = () => {
    if (!metrics.length) return null;

    const latestMetric = metrics[0];
    
    switch (activeTab) {
      case 'blood_pressure':
        const systolic = (latestMetric.value as any).systolic;
        const diastolic = (latestMetric.value as any).diastolic;
        const bpStatus = systolic < 120 && diastolic < 80 
          ? { label: 'Normal', color: 'health-badge-normal' }
          : systolic < 130 && diastolic < 85
          ? { label: 'Elevated', color: 'health-badge-caution' }
          : systolic < 140 && diastolic < 90
          ? { label: 'Borderline', color: 'health-badge-warning' }
          : { label: 'High', color: 'health-badge-alert' };

        return {
          value: `${systolic}/${diastolic}`,
          unit: 'mmHg',
          status: bpStatus,
          progress: Math.min(100, (systolic / 160) * 100)
        };
      
      case 'glucose':
        const glucoseLevel = (latestMetric.value as any).level;
        // Fasting glucose levels
        const glucoseStatus = glucoseLevel < 70
          ? { label: 'Low', color: 'health-badge-alert' }
          : glucoseLevel <= 99
          ? { label: 'Normal', color: 'health-badge-normal' }
          : glucoseLevel <= 125
          ? { label: 'Elevated', color: 'health-badge-caution' }
          : { label: 'High', color: 'health-badge-alert' };

        return {
          value: glucoseLevel,
          unit: 'mg/dL',
          status: glucoseStatus,
          progress: Math.min(100, (glucoseLevel / 200) * 100)
        };
        
      case 'heart_rate':
        const bpm = (latestMetric.value as any).bpm;
        // Resting heart rate for adults
        const heartStatus = bpm < 60
          ? { label: 'Low', color: 'health-badge-caution' }
          : bpm <= 100
          ? { label: 'Normal', color: 'health-badge-normal' }
          : bpm <= 120
          ? { label: 'Elevated', color: 'health-badge-warning' }
          : { label: 'High', color: 'health-badge-alert' };

        return {
          value: bpm,
          unit: 'bpm',
          status: heartStatus,
          progress: Math.min(100, (bpm / 150) * 100)
        };
      
      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SharedSidebar items={getSidebarItems()} />
        </div>
        
        <div className="md:col-span-3">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Health Metrics</h1>
            <p className="text-muted-foreground">
              Track and monitor your health metrics over time.
            </p>
          </div>
          
          {activeView === 'dashboard' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as MetricType)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="blood_pressure" className="flex gap-2 items-center">
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">Blood Pressure</span>
                      <span className="sm:hidden">BP</span>
                    </TabsTrigger>
                    <TabsTrigger value="glucose" className="flex gap-2 items-center">
                      <Droplets className="h-4 w-4" />
                      <span className="hidden sm:inline">Glucose</span>
                      <span className="sm:hidden">GL</span>
                    </TabsTrigger>
                    <TabsTrigger value="heart_rate" className="flex gap-2 items-center">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Heart Rate</span>
                      <span className="sm:hidden">HR</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="space-y-6">
                    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                      <DialogTrigger asChild>
                        <Button className="mb-4">
                          <Plus className="mr-2 h-4 w-4" /> Add Reading
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Add {formatMetricType(activeTab)} Reading</DialogTitle>
                        <DialogDescription>
                          Enter your latest {formatMetricType(activeTab.toLowerCase())} measurement.
                        </DialogDescription>
                        <MetricForm
                          type={activeTab}
                          onSuccess={() => {
                            setShowAddForm(false);
                            fetchMetrics();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    
                    {isLoading ? (
                      <div className="flex justify-center p-8">
                        <div className="animate-pulse h-4 w-4 bg-primary rounded-full"></div>
                        <div className="animate-pulse h-4 w-4 bg-primary rounded-full ml-1" style={{ animationDelay: '0.2s' }}></div>
                        <div className="animate-pulse h-4 w-4 bg-primary rounded-full ml-1" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    ) : metrics.length === 0 ? (
                      <Card className="health-card border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="rounded-full p-3 bg-muted mb-4">
                            {getMetricCardIcon(activeTab)}
                          </div>
                          <CardTitle className="mb-2 text-lg">No {formatMetricType(activeTab)} Readings</CardTitle>
                          <CardDescription className="mb-4">
                            Start tracking your {activeTab.replace('_', ' ')} to see trends and insights.
                          </CardDescription>
                          <Button onClick={() => setShowAddForm(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add First Reading
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <Card className="health-card">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg font-medium">Latest Reading</CardTitle>
                              <CardDescription>
                                {format(new Date(metrics[0].recorded_at), 'PPP p')}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {(() => {
                                const summary = getMetricSummary();
                                if (!summary) return null;
                                
                                return (
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <span className="text-3xl font-bold">{summary.value}</span>
                                        <span className="text-muted-foreground ml-2">{summary.unit}</span>
                                      </div>
                                      <Badge className={summary.status.color}>
                                        {summary.status.label}
                                      </Badge>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="text-sm text-muted-foreground flex justify-between">
                                        <span>Status</span>
                                        <span>{summary.status.label}</span>
                                      </div>
                                      <Progress value={summary.progress} className="h-2" />
                                    </div>
                                  </div>
                                );
                              })()}
                            </CardContent>
                          </Card>
                          
                          <Card className="health-card">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg font-medium">Quick Stats</CardTitle>
                              <CardDescription>
                                Based on your last {metrics.length} readings
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {activeTab === 'blood_pressure' ? (
                                  <>
                                    <div className="flex justify-between">
                                      <div className="text-sm text-muted-foreground">Average Systolic</div>
                                      <div className="font-medium">
                                        {Math.round(metrics.reduce((sum, m) => sum + (m.value as any).systolic, 0) / metrics.length)} mmHg
                                      </div>
                                    </div>
                                    <div className="flex justify-between">
                                      <div className="text-sm text-muted-foreground">Average Diastolic</div>
                                      <div className="font-medium">
                                        {Math.round(metrics.reduce((sum, m) => sum + (m.value as any).diastolic, 0) / metrics.length)} mmHg
                                      </div>
                                    </div>
                                  </>
                                ) : activeTab === 'glucose' ? (
                                  <div className="flex justify-between">
                                    <div className="text-sm text-muted-foreground">Average Glucose</div>
                                    <div className="font-medium">
                                      {Math.round(metrics.reduce((sum, m) => sum + (m.value as any).level, 0) / metrics.length)} mg/dL
                                    </div>
                                  </div>
                                ) : activeTab === 'heart_rate' ? (
                                  <div className="flex justify-between">
                                    <div className="text-sm text-muted-foreground">Average Heart Rate</div>
                                    <div className="font-medium">
                                      {Math.round(metrics.reduce((sum, m) => sum + (m.value as any).bpm, 0) / metrics.length)} bpm
                                    </div>
                                  </div>
                                ) : null}
                                <div className="flex justify-between">
                                  <div className="text-sm text-muted-foreground">Readings Taken</div>
                                  <div className="font-medium">{metrics.length}</div>
                                </div>
                                <div className="flex justify-between">
                                  <div className="text-sm text-muted-foreground">Last Updated</div>
                                  <div className="font-medium">{format(new Date(metrics[0].recorded_at), 'PP')}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <Card className="health-card mb-6">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium">Trends</CardTitle>
                            <CardDescription>
                              Your {formatMetricType(activeTab)} over time
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {renderChart()}
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              
              <Card className="health-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Recent Entries</CardTitle>
                  <CardDescription>Your latest health measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentEntries.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No recent entries found. Start tracking your health metrics.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {recentEntries.map((entry) => (
                        <li key={entry.id} className="flex items-center p-2 rounded-md hover:bg-muted">
                          <div className="rounded-full p-2 bg-muted mr-3">
                            {getMetricCardIcon(entry.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{formatMetricType(entry.type)}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(entry.recorded_at), 'PPp')}
                            </div>
                          </div>
                          <div className="font-semibold">{getMetricValue(entry)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full" onClick={() => setActiveView('history')}>
                    <Clock className="mr-2 h-4 w-4" /> View All History
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Card className="health-card">
              <CardHeader>
                <CardTitle>Measurement History</CardTitle>
                <CardDescription>All your health measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="blood_pressure">Blood Pressure</TabsTrigger>
                    <TabsTrigger value="glucose">Glucose</TabsTrigger>
                    <TabsTrigger value="heart_rate">Heart Rate</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="pt-4">
                    <HistoryList metrics={recentEntries} getMetricCardIcon={getMetricCardIcon} getMetricValue={getMetricValue} formatMetricType={formatMetricType} />
                  </TabsContent>
                  <TabsContent value="blood_pressure" className="pt-4">
                    <HistoryList metrics={bloodPressureMetrics} getMetricCardIcon={getMetricCardIcon} getMetricValue={getMetricValue} formatMetricType={formatMetricType} />
                  </TabsContent>
                  <TabsContent value="glucose" className="pt-4">
                    <HistoryList metrics={glucoseMetrics} getMetricCardIcon={getMetricCardIcon} getMetricValue={getMetricValue} formatMetricType={formatMetricType} />
                  </TabsContent>
                  <TabsContent value="heart_rate" className="pt-4">
                    <HistoryList metrics={heartRateMetrics} getMetricCardIcon={getMetricCardIcon} getMetricValue={getMetricValue} formatMetricType={formatMetricType} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

// Helper component for rendering history lists
const HistoryList = ({ 
  metrics, 
  getMetricCardIcon, 
  getMetricValue, 
  formatMetricType 
}: { 
  metrics: HealthMetric[],
  getMetricCardIcon: (type: MetricType) => React.ReactNode,
  getMetricValue: (metric: HealthMetric) => string,
  formatMetricType: (type: string) => string
}) => {
  if (metrics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No entries found.
      </div>
    );
  }
  
  return (
    <ul className="space-y-3">
      {metrics.map((entry) => (
        <li key={entry.id} className="flex items-center p-3 rounded-md hover:bg-muted border border-border">
          <div className="rounded-full p-2 bg-muted mr-3">
            {getMetricCardIcon(entry.type)}
          </div>
          <div className="flex-1">
            <div className="font-medium">{formatMetricType(entry.type)}</div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(entry.recorded_at), 'PPp')}
            </div>
            {entry.notes && (
              <div className="text-sm mt-1 text-muted-foreground">
                Note: {entry.notes}
              </div>
            )}
          </div>
          <div className="font-semibold">{getMetricValue(entry)}</div>
        </li>
      ))}
    </ul>
  );
};

export default MetricsPage;
