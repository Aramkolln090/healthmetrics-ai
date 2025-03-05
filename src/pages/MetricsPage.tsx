
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Heart, 
  Bell, 
  LineChart, 
  Plus,
  Calendar,
  Clock,
  Droplets,
  Dumbbell,
  User,
  Pill
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data for the charts
const bloodPressureData = [
  { date: "Mon", systolic: 120, diastolic: 80 },
  { date: "Tue", systolic: 122, diastolic: 82 },
  { date: "Wed", systolic: 130, diastolic: 85 },
  { date: "Thu", systolic: 125, diastolic: 83 },
  { date: "Fri", systolic: 135, diastolic: 88 },
  { date: "Sat", systolic: 145, diastolic: 92 },
  { date: "Sun", systolic: 140, diastolic: 90 },
];

const glucoseData = [
  { date: "Mon", value: 95 },
  { date: "Tue", value: 110 },
  { date: "Wed", value: 105 },
  { date: "Thu", value: 98 },
  { date: "Fri", value: 120 },
  { date: "Sat", value: 112 },
  { date: "Sun", value: 100 },
];

const heartRateData = [
  { date: "Mon", value: 65 },
  { date: "Tue", value: 72 },
  { date: "Wed", value: 68 },
  { date: "Thu", value: 90 },
  { date: "Fri", value: 75 },
  { date: "Sat", value: 80 },
  { date: "Sun", value: 73 },
];

const medications = [
  { id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Once daily", time: "8:00 AM", icon: <Pill className="h-5 w-5 text-blue-500" /> },
  { id: 2, name: "Metformin", dosage: "500mg", frequency: "Twice daily", time: "9:00 AM, 9:00 PM", icon: <Pill className="h-5 w-5 text-green-500" /> },
  { id: 3, name: "Aspirin", dosage: "81mg", frequency: "Once daily", time: "8:00 AM", icon: <Pill className="h-5 w-5 text-red-500" /> },
  { id: 4, name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", time: "9:00 PM", icon: <Pill className="h-5 w-5 text-purple-500" /> },
];

const MetricsPage: React.FC = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <h1 className="text-3xl font-bold mb-2">Your Health Metrics</h1>
        <p className="text-muted-foreground">
          Track, visualize, and understand your health data
        </p>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 pb-16">
        <Tabs defaultValue="comprehensive" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="comprehensive" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Comprehensive</span>
            </TabsTrigger>
            <TabsTrigger value="heart" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Heart Health</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Medications</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Visualization</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Comprehensive Metrics Tab */}
          <TabsContent value="comprehensive" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard 
                title="Blood Pressure" 
                value="140/90 mmHg" 
                trend="↑ 5%" 
                trendDirection="up"
                icon={<Activity className="h-5 w-5" />} 
                lastUpdated="Today, 9:30 AM"
              />
              <MetricCard 
                title="Glucose" 
                value="105 mg/dL" 
                trend="↓ 3%" 
                trendDirection="down"
                icon={<Droplets className="h-5 w-5" />} 
                lastUpdated="Yesterday, 8:15 PM"
              />
              <MetricCard 
                title="Weight" 
                value="165 lbs" 
                trend="→ 0%" 
                trendDirection="neutral"
                icon={<User className="h-5 w-5" />} 
                lastUpdated="2 days ago, 7:00 AM"
              />
              <MetricCard 
                title="Heart Rate" 
                value="72 bpm" 
                trend="↓ 2%" 
                trendDirection="down"
                icon={<Heart className="h-5 w-5" />} 
                lastUpdated="Today, 10:30 AM"
              />
              <MetricCard 
                title="Sleep" 
                value="7h 15m" 
                trend="↑ 8%" 
                trendDirection="up"
                icon={<Clock className="h-5 w-5" />} 
                lastUpdated="Today, 6:45 AM"
              />
              <MetricCard 
                title="Activity" 
                value="8,500 steps" 
                trend="↓ 10%" 
                trendDirection="down"
                icon={<Dumbbell className="h-5 w-5" />} 
                lastUpdated="Yesterday, 11:30 PM"
              />
            </div>
            
            <Button className="w-full sm:w-auto mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add New Metric
            </Button>
          </TabsContent>
          
          {/* Heart Health Tab */}
          <TabsContent value="heart" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Heart Rate History</CardTitle>
                  <CardDescription>Your heart rate trends over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={heartRateData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: 'none'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }} 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Heart Health Summary</CardTitle>
                  <CardDescription>Your cardiovascular metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <div className="font-medium">Resting Heart Rate</div>
                      <div>72 bpm</div>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <div className="font-medium">Blood Pressure</div>
                      <div>140/90 mmHg</div>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <div className="font-medium">Cholesterol (LDL)</div>
                      <div>110 mg/dL</div>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <div className="font-medium">Cholesterol (HDL)</div>
                      <div>45 mg/dL</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Recovery Time</div>
                      <div>1m 45s</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Medication Schedule</CardTitle>
                  <CardDescription>Track your daily medication intake</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Medication
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-6">
                    {medications.map((med) => (
                      <Card key={med.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-2 rounded-full">
                              {med.icon}
                            </div>
                            <div>
                              <h3 className="font-medium">{med.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {med.dosage} • {med.frequency}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-medium">{med.time}</div>
                            <div className="flex mt-1 gap-2">
                              <button className="text-xs bg-muted rounded-full px-2 py-1">Taken</button>
                              <button className="text-xs bg-muted rounded-full px-2 py-1">Skip</button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div 
                      className="flex items-center justify-center p-4 cursor-pointer hover:bg-muted rounded-lg transition-colors"
                      onClick={() => navigate('/calendar')}
                    >
                      <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">View Full Calendar</span>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Data Visualization Tab */}
          <TabsContent value="visualization" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure Trends</CardTitle>
                <CardDescription>Systolic and diastolic readings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={bloodPressureData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          border: 'none'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="systolic" 
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="diastolic" 
                        stroke="#60a5fa"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Glucose Monitoring</CardTitle>
                <CardDescription>Blood glucose levels over the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={glucoseData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" />
                      <YAxis stroke="#888" domain={['dataMin - 10', 'dataMax + 10']} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          border: 'none'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                        activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }} 
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  icon: React.ReactNode;
  lastUpdated: string;
}

const MetricCard = ({ title, value, trend, trendDirection, icon, lastUpdated }: MetricCardProps) => {
  const getTrendColor = () => {
    switch(trendDirection) {
      case "up":
        return "text-red-500";
      case "down":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-full">
              {icon}
            </div>
            {title}
          </CardTitle>
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {trend}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs text-muted-foreground">{lastUpdated}</div>
      </CardContent>
    </Card>
  );
};

export default MetricsPage;
