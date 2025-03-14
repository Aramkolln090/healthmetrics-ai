import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorDiastolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value, name) => [`${value} mmHg`, name === 'systolic' ? 'Systolic' : 'Diastolic']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area type="monotone" dataKey="systolic" stroke="#8884d8" fillOpacity={1} fill="url(#colorSystolic)" name="Systolic" />
              <Area type="monotone" dataKey="diastolic" stroke="#82ca9d" fillOpacity={1} fill="url(#colorDiastolic)" name="Diastolic" />
            </AreaChart>
          ) : (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value) => [
                  `${value} ${activeTab === 'glucose' ? 'mg/dL' : activeTab === 'heart_rate' ? 'bpm' : ''}`,
                  activeTab === 'glucose' ? 'Glucose' : activeTab === 'heart_rate' ? 'Heart Rate' : activeTab
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
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
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'glucose':
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'heart_rate':
        return <Activity className="h-5 w-5 text-purple-500" />;
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
          ? { label: 'Normal', color: 'bg-green-500' }
          : systolic < 130 && diastolic < 85
          ? { label: 'Elevated', color: 'bg-yellow-500' }
          : { label: 'High', color: 'bg-red-500' };

        return {
          value: `${systolic}/${diastolic}`,
          unit: 'mmHg',
          status: bpStatus,
          progress: Math.min(100, (systolic / 160) * 100)
        };
        
      case 'glucose':
        const glucose = (latestMetric.value as any).level;
        const glucoseStatus = glucose < 100 
          ? { label: 'Normal', color: 'bg-green-500' }
          : glucose < 125
          ? { label: 'Pre-diabetic', color: 'bg-yellow-500' }
          : { label: 'Diabetic', color: 'bg-red-500' };

        return {
          value: glucose,
          unit: (latestMetric.value as any).unit || 'mg/dL',
          status: glucoseStatus,
          progress: Math.min(100, (glucose / 200) * 100)
        };
        
      case 'heart_rate':
        const heartRate = (latestMetric.value as any).bpm;
        const hrStatus = heartRate < 60 
          ? { label: 'Low', color: 'bg-blue-500' }
          : heartRate <= 100
          ? { label: 'Normal', color: 'bg-green-500' }
          : { label: 'Elevated', color: 'bg-red-500' };

        return {
          value: heartRate,
          unit: 'bpm',
          status: hrStatus,
          progress: Math.min(100, (heartRate / 150) * 100)
        };
        
      default:
        return null;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-blue-100"></div>
          <div className="h-4 w-32 mx-auto rounded bg-blue-100"></div>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view your health metrics</p>
            <Button asChild>
              <a href="/">Go to Homepage</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const summary = getMetricSummary();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] fixed pt-6">
          <div className="px-6 mb-6">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{user?.email?.split('@')[0] || 'User'}</h3>
                <p className="text-xs text-muted-foreground">Health Dashboard</p>
              </div>
            </div>
          </div>
          <div className="space-y-1 px-2">
            {getSidebarItems().map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-md text-sm transition-colors
                  ${activeView === item.label.toLowerCase() 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-gray-100'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-auto p-6">
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <LineChart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Track Your Metrics</h4>
                    <p className="text-xs text-muted-foreground mb-2">Add regular readings to see trends</p>
                    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="text-xs w-full">
                          <Plus className="mr-1 h-3 w-3" /> Add Reading
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
                            fetchMetrics();
                          }}
                          onCancel={() => setShowAddForm(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-6">
          {activeView === 'dashboard' ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Health Dashboard</h1>
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
                        fetchMetrics();
                      }}
                      onCancel={() => setShowAddForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Metrics Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground font-medium">
                      <div className="flex items-center">
                        <Heart className="mr-2 h-4 w-4 text-red-500" />
                        Blood Pressure
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bloodPressureMetrics.length > 0 ? (
                      <>
                        <div className="flex items-end mb-2">
                          <span className="text-3xl font-bold">
                            {(bloodPressureMetrics[0].value as any).systolic}/
                            {(bloodPressureMetrics[0].value as any).diastolic}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1 mb-1">mmHg</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                            Latest Reading
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-2">
                            {format(new Date(bloodPressureMetrics[0].recorded_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground text-sm">No data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground font-medium">
                      <div className="flex items-center">
                        <Droplets className="mr-2 h-4 w-4 text-blue-500" />
                        Glucose
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {glucoseMetrics.length > 0 ? (
                      <>
                        <div className="flex items-end mb-2">
                          <span className="text-3xl font-bold">
                            {(glucoseMetrics[0].value as any).level}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1 mb-1">
                            {(glucoseMetrics[0].value as any).unit || 'mg/dL'}
                          </span>
                        </div>
                        <div className="flex items-center mb-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                            Latest Reading
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-2">
                            {format(new Date(glucoseMetrics[0].recorded_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground text-sm">No data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground font-medium">
                      <div className="flex items-center">
                        <Activity className="mr-2 h-4 w-4 text-purple-500" />
                        Heart Rate
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {heartRateMetrics.length > 0 ? (
                      <>
                        <div className="flex items-end mb-2">
                          <span className="text-3xl font-bold">
                            {(heartRateMetrics[0].value as any).bpm}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1 mb-1">bpm</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                            Latest Reading
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-2">
                            {format(new Date(heartRateMetrics[0].recorded_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground text-sm">No data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Metrics Chart */}
              <div className="grid grid-cols-1 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Trend Analysis</CardTitle>
                        <CardDescription>View your health metrics over time</CardDescription>
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
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-[300px]">
                        <div className="animate-pulse text-center">
                          <div className="h-4 w-32 mx-auto rounded bg-blue-100"></div>
                        </div>
                      </div>
                    ) : metrics.length > 0 ? (
                      renderChart()
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <p className="text-muted-foreground mb-4">No data available for {activeTab.replace('_', ' ')}</p>
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
                                fetchMetrics();
                              }}
                              onCancel={() => setShowAddForm(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your most recent health readings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentEntries.length > 0 ? (
                      <div className="space-y-4">
                        {recentEntries.map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center">
                              <div className="mr-3 p-2 rounded-full bg-primary/10">
                                {getMetricCardIcon(entry.type)}
                              </div>
                              <div>
                                <p className="font-medium">{formatMetricType(entry.type)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(entry.recorded_at), 'MMM dd, yyyy HH:mm')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="text-right">
                                <p className="font-bold">{getMetricValue(entry)}</p>
                                {entry.notes && <p className="text-xs text-muted-foreground">Note: {entry.notes}</p>}
                              </div>
                              <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-muted-foreground mb-4">No recent activity</p>
                        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                          <DialogTrigger asChild>
                            <Button onClick={() => setShowAddForm(true)}>
                              <Plus className="mr-2 h-4 w-4" /> Add Your First Reading
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            // History View
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Metrics History</h1>
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
                </Tabs>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{formatMetricType(activeTab)} History</CardTitle>
                      <CardDescription>All your recorded {activeTab.replace('_', ' ')} readings</CardDescription>
                    </div>
                    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                      <DialogTrigger asChild>
                        <Button size="sm">
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
                            fetchMetrics();
                          }}
                          onCancel={() => setShowAddForm(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-20">
                      <div className="animate-pulse text-center">
                        <div className="h-4 w-32 mx-auto rounded bg-blue-100"></div>
                      </div>
                    </div>
                  ) : metrics.length > 0 ? (
                    <div className="space-y-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 text-left font-medium text-muted-foreground">Date & Time</th>
                            <th className="py-3 text-left font-medium text-muted-foreground">Reading</th>
                            <th className="py-3 text-left font-medium text-muted-foreground">Status</th>
                            <th className="py-3 text-left font-medium text-muted-foreground">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.map((metric, idx) => {
                            // Determine status based on metric type and value
                            let status = { label: 'Normal', color: 'bg-green-500' };
                            
                            if (metric.type === 'blood_pressure') {
                              const systolic = (metric.value as any).systolic;
                              const diastolic = (metric.value as any).diastolic;
                              
                              if (systolic >= 140 || diastolic >= 90) {
                                status = { label: 'High', color: 'bg-red-500' };
                              } else if (systolic >= 130 || diastolic >= 85) {
                                status = { label: 'Elevated', color: 'bg-yellow-500' };
                              }
                            } else if (metric.type === 'glucose') {
                              const glucose = (metric.value as any).level;
                              
                              if (glucose >= 126) {
                                status = { label: 'High', color: 'bg-red-500' };
                              } else if (glucose >= 100) {
                                status = { label: 'Elevated', color: 'bg-yellow-500' };
                              }
                            } else if (metric.type === 'heart_rate') {
                              const hr = (metric.value as any).bpm;
                              
                              if (hr > 100) {
                                status = { label: 'High', color: 'bg-red-500' };
                              } else if (hr < 60) {
                                status = { label: 'Low', color: 'bg-blue-500' };
                              }
                            }
                            
                            return (
                              <tr key={idx} className="border-b last:border-0">
                                <td className="py-3">
                                  <div>
                                    <p className="font-medium">{format(new Date(metric.recorded_at), 'MMM dd, yyyy')}</p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(metric.recorded_at), 'HH:mm')}</p>
                                  </div>
                                </td>
                                <td className="py-3 font-medium">{getMetricValue(metric)}</td>
                                <td className="py-3">
                                  <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full ${status.color} mr-2`}></div>
                                    <span className="text-sm">{status.label}</span>
                                  </div>
                                </td>
                                <td className="py-3 text-sm text-muted-foreground">{metric.notes || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground mb-4">No {activeTab.replace('_', ' ')} metrics recorded</p>
                      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                        <DialogTrigger asChild>
                          <Button onClick={() => setShowAddForm(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Your First Reading
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
