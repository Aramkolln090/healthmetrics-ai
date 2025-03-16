import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { metricsService } from "@/lib/db/metrics";
import { MetricType, HealthMetric } from "@/lib/db/types";
import Navbar from "@/components/layout/Navbar";
import {
  Settings,
  BarChart3,
  Home,
  Calendar as CalendarMenu,
  Heart,
  Droplets,
  Activity,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FullscreenCalendar } from "@/components/calendar/FullscreenCalendar";
import { SharedSidebar } from "@/components/ui/shared-sidebar";

// Icons for each metric type
const metricIcons = {
  'blood_pressure': Heart,
  'glucose': Droplets,
  'heart_rate': Activity
};

// Colors for each metric type
const metricColors = {
  'blood_pressure': 'bg-red-100 text-red-700 border-red-200',
  'glucose': 'bg-blue-100 text-blue-700 border-blue-200',
  'heart_rate': 'bg-purple-100 text-purple-700 border-purple-200'
};

const CalendarPage = () => {
  const { user, session, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateMetrics, setDateMetrics] = useState<Record<string, HealthMetric[]>>({});

  // Fetch metrics data
  const fetchMetrics = async () => {
    if (!user || !session) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch all metric types
      const [bloodPressure, glucose, heartRate] = await Promise.all([
        metricsService.getMetrics(user.id, 'blood_pressure'),
        metricsService.getMetrics(user.id, 'glucose'),
        metricsService.getMetrics(user.id, 'heart_rate')
      ]);
      
      // Combine all metrics
      const allMetrics = [...bloodPressure, ...glucose, ...heartRate];
      
      // Group metrics by date for calendar display
      const groupedByDate: Record<string, HealthMetric[]> = {};
      allMetrics.forEach(metric => {
        const dateKey = format(new Date(metric.recorded_at), 'yyyy-MM-dd');
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(metric);
      });
      
      setDateMetrics(groupedByDate);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: 'Error fetching metrics',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format the metric value for display
  const formatMetricValue = (metric: HealthMetric) => {
    switch (metric.type) {
      case 'blood_pressure':
        return `${metric.value.systolic}/${metric.value.diastolic} mmHg`;
      case 'glucose':
        return `${metric.value} mg/dL`;
      case 'heart_rate':
        return `${metric.value} BPM`;
      default:
        return String(metric.value);
    }
  };

  // Get sidebar navigation items
  const getSidebarItems = () => {
    return [
      { icon: <Home className="h-5 w-5" />, label: 'Dashboard', onClick: () => navigate('/metrics') },
      { icon: <BarChart3 className="h-5 w-5" />, label: 'History', onClick: () => navigate('/metrics') },
      { icon: <CalendarMenu className="h-5 w-5" />, label: 'Calendar', onClick: () => {} },
      { icon: <Settings className="h-5 w-5" />, label: 'Settings', onClick: () => navigate('/settings') },
    ];
  };

  // Load metrics when user/session changes
  useEffect(() => {
    if (!isAuthLoading) {
      fetchMetrics();
    }
  }, [user, session, isAuthLoading]);

  // Handle day selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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
            <p className="text-muted-foreground mb-6">Please sign in to view your health metrics calendar</p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex pt-16">
        {/* Use the shared sidebar component */}
        <SharedSidebar />
        
        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Health Metrics Calendar</h1>
            <Button variant="outline" onClick={() => navigate('/metrics')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fullscreen Calendar */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="h-[500px] flex items-center justify-center">
                  <div className="animate-pulse text-center">
                    <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-blue-100"></div>
                    <div className="h-4 w-32 mx-auto rounded bg-blue-100"></div>
                  </div>
                </div>
              ) : (
                <FullscreenCalendar 
                  metrics={dateMetrics}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                />
              )}
            </div>

            {/* Selected Day Metrics */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Metrics Recorded
                        </h3>
                        
                        {dateMetrics[format(selectedDate, 'yyyy-MM-dd')]?.length > 0 ? (
                          <div className="space-y-3">
                            {dateMetrics[format(selectedDate, 'yyyy-MM-dd')]?.map((metric, index) => {
                              const MetricIcon = metricIcons[metric.type as keyof typeof metricIcons];
                              return (
                                <div 
                                  key={index} 
                                  className={`flex items-center p-3 rounded-lg border ${metricColors[metric.type as keyof typeof metricColors]}`}
                                >
                                  <div className="mr-3">
                                    <MetricIcon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="font-medium capitalize">
                                      {metric.type.replace('_', ' ')}
                                    </div>
                                    <div className="text-sm">
                                      {formatMetricValue(metric)}
                                    </div>
                                  </div>
                                  <div className="ml-auto text-xs text-muted-foreground">
                                    {format(new Date(metric.recorded_at), 'h:mm a')}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <CalendarIcon className="mx-auto h-10 w-10 mb-2 opacity-20" />
                            <p>No metrics recorded for this day</p>
                            <Button 
                              variant="link" 
                              className="mt-2"
                              onClick={() => navigate('/metrics')}
                            >
                              Add a measurement
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <CalendarIcon className="mx-auto h-10 w-10 mb-2 opacity-20" />
                      <p>Select a date to view metrics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
