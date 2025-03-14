import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  BarChart3,
  Home,
  Calendar,
  LogOut,
  Check,
  Droplets,
  Heart,
  Activity,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { metricsService } from "@/lib/db/metrics";
import { MetricPreferences } from "@/lib/db/types";

const SettingsPage = () => {
  const { user, session, signOut, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<Partial<MetricPreferences>>({
    preferred_units: {
      weight: 'kg',
      temperature: 'celsius',
      glucose: 'mg/dL',
    },
    target_ranges: {
      blood_pressure: {
        systolic: { min: 90, max: 120 },
        diastolic: { min: 60, max: 80 },
      },
      glucose: { min: 70, max: 99 },
      heart_rate: { min: 60, max: 100 },
    }
  });
  
  const [notifications, setNotifications] = useState({
    email: {
      metrics: true,
      reports: false,
      reminders: true
    },
    push: {
      metrics: false,
      reports: true,
      reminders: true
    }
  });
  
  const fetchPreferences = async () => {
    if (!user || !session) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const prefs = await metricsService.getMetricPreferences(user.id);
      
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error loading preferences',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const savePreferences = async () => {
    if (!user || !session) {
      return;
    }

    try {
      setIsLoading(true);
      await metricsService.updateMetricPreferences(user.id, preferences);
      
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error saving preferences',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchPreferences();
    }
  }, [user, session, isAuthLoading]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getSidebarItems = () => {
    return [
      { icon: <Home className="h-5 w-5" />, label: 'Dashboard', onClick: () => navigate('/metrics') },
      { icon: <BarChart3 className="h-5 w-5" />, label: 'History', onClick: () => navigate('/metrics') },
      { icon: <Calendar className="h-5 w-5" />, label: 'Calendar', onClick: () => navigate('/calendar') },
      { icon: <SettingsIcon className="h-5 w-5" />, label: 'Settings', onClick: () => {} },
    ];
  }

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
            <p className="text-muted-foreground mb-6">Please sign in to access settings</p>
            <Button asChild>
              <a href="/">Go to Homepage</a>
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
                  ${item.label === 'Settings' 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-gray-100'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-auto p-6">
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-6">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
              <TabsTrigger value="account">
                <User className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="metrics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your account settings and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user?.email || ''} disabled />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" defaultValue={user?.user_metadata?.name || user?.email?.split('@')[0] || ''} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => toast({ title: "Account information updated" })}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Update your password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => toast({ title: "Password updated successfully" })}>
                    Update Password
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border-red-100">
                <CardHeader className="text-red-500">
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription className="text-red-400">
                    Permanently delete your account and all data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </p>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Unit Preferences</CardTitle>
                  <CardDescription>
                    Choose your preferred units for different metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="glucose-unit">Glucose</Label>
                      <Select 
                        value={preferences.preferred_units?.glucose || 'mg/dL'} 
                        onValueChange={(value) => setPreferences({
                          ...preferences,
                          preferred_units: {
                            ...preferences.preferred_units,
                            glucose: value as 'mg/dL' | 'mmol/L'
                          }
                        })}
                      >
                        <SelectTrigger id="glucose-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mg/dL">mg/dL</SelectItem>
                          <SelectItem value="mmol/L">mmol/L</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight-unit">Weight</Label>
                      <Select 
                        value={preferences.preferred_units?.weight || 'kg'} 
                        onValueChange={(value) => setPreferences({
                          ...preferences,
                          preferred_units: {
                            ...preferences.preferred_units,
                            weight: value as 'kg' | 'lbs'
                          }
                        })}
                      >
                        <SelectTrigger id="weight-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="temp-unit">Temperature</Label>
                      <Select 
                        value={preferences.preferred_units?.temperature || 'celsius'} 
                        onValueChange={(value) => setPreferences({
                          ...preferences,
                          preferred_units: {
                            ...preferences.preferred_units,
                            temperature: value as 'celsius' | 'fahrenheit'
                          }
                        })}
                      >
                        <SelectTrigger id="temp-unit">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="celsius">Celsius (°C)</SelectItem>
                          <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={savePreferences}>
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Target Ranges</CardTitle>
                  <CardDescription>
                    Set your target ranges for health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 text-red-500 mr-2" />
                      <h3 className="text-lg font-medium">Blood Pressure</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="systolic-min">Systolic (Min)</Label>
                        <Input 
                          id="systolic-min" 
                          type="number" 
                          value={preferences.target_ranges?.blood_pressure?.systolic.min || 90}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            target_ranges: {
                              ...preferences.target_ranges,
                              blood_pressure: {
                                ...preferences.target_ranges?.blood_pressure!,
                                systolic: {
                                  ...preferences.target_ranges?.blood_pressure?.systolic!,
                                  min: parseInt(e.target.value)
                                }
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="systolic-max">Systolic (Max)</Label>
                        <Input 
                          id="systolic-max" 
                          type="number" 
                          value={preferences.target_ranges?.blood_pressure?.systolic.max || 120}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            target_ranges: {
                              ...preferences.target_ranges,
                              blood_pressure: {
                                ...preferences.target_ranges?.blood_pressure!,
                                systolic: {
                                  ...preferences.target_ranges?.blood_pressure?.systolic!,
                                  max: parseInt(e.target.value)
                                }
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="diastolic-min">Diastolic (Min)</Label>
                        <Input 
                          id="diastolic-min" 
                          type="number" 
                          value={preferences.target_ranges?.blood_pressure?.diastolic.min || 60}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            target_ranges: {
                              ...preferences.target_ranges,
                              blood_pressure: {
                                ...preferences.target_ranges?.blood_pressure!,
                                diastolic: {
                                  ...preferences.target_ranges?.blood_pressure?.diastolic!,
                                  min: parseInt(e.target.value)
                                }
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="diastolic-max">Diastolic (Max)</Label>
                        <Input 
                          id="diastolic-max" 
                          type="number" 
                          value={preferences.target_ranges?.blood_pressure?.diastolic.max || 80}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            target_ranges: {
                              ...preferences.target_ranges,
                              blood_pressure: {
                                ...preferences.target_ranges?.blood_pressure!,
                                diastolic: {
                                  ...preferences.target_ranges?.blood_pressure?.diastolic!,
                                  max: parseInt(e.target.value)
                                }
                              }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Droplets className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="text-lg font-medium">Glucose</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="glucose-min">Minimum</Label>
                        <Input 
                          id="glucose-min" 
                          type="number" 
                          value={preferences.target_ranges?.glucose?.min || 70}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            target_ranges: {
                              ...preferences.target_ranges,
                              glucose: {
                                ...preferences.target_ranges?.glucose!,
                                min: parseInt(e.target.value)
                              }
                            }
                          })}
                        />
                        <p className="text-xs text-muted-foreground">
                          {preferences.preferred_units?.glucose || 'mg/dL'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="glucose-max">Maximum</Label>
                        <Input 
                          id="glucose-max" 
                          type="number" 
                          value={preferences.target_ranges?.glucose?.max || 99}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            target_ranges: {
                              ...preferences.target_ranges,
                              glucose: {
                                ...preferences.target_ranges?.glucose!,
                                max: parseInt(e.target.value)
                              }
                            }
                          })}
                        />
                        <p className="text-xs text-muted-foreground">
                          {preferences.preferred_units?.glucose || 'mg/dL'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 text-purple-500 mr-2" />
                      <h3 className="text-lg font-medium">Heart Rate</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hr-min">Minimum</Label>
                        <Input 
                          id="hr-min" 
                          type="number" 
                          value={preferences.target_ranges?.heart_rate?.min || 60}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            target_ranges: {
                              ...preferences.target_ranges,
                              heart_rate: {
                                ...preferences.target_ranges?.heart_rate!,
                                min: parseInt(e.target.value)
                              }
                            }
                          })}
                        />
                        <p className="text-xs text-muted-foreground">BPM</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hr-max">Maximum</Label>
                        <Input 
                          id="hr-max" 
                          type="number" 
                          value={preferences.target_ranges?.heart_rate?.max || 100}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            target_ranges: {
                              ...preferences.target_ranges,
                              heart_rate: {
                                ...preferences.target_ranges?.heart_rate!,
                                max: parseInt(e.target.value)
                              }
                            }
                          })}
                        />
                        <p className="text-xs text-muted-foreground">BPM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={savePreferences}>
                    Save Ranges
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Configure which emails you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-metrics">Metric Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly summaries of your health metrics
                      </p>
                    </div>
                    <Switch 
                      id="email-metrics" 
                      checked={notifications.email.metrics}
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        email: {
                          ...notifications.email,
                          metrics: checked
                        }
                      })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-reports">Health Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive monthly health reports and insights
                      </p>
                    </div>
                    <Switch 
                      id="email-reports" 
                      checked={notifications.email.reports}
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        email: {
                          ...notifications.email,
                          reports: checked
                        }
                      })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-reminders">Measurement Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders to take your measurements
                      </p>
                    </div>
                    <Switch 
                      id="email-reminders" 
                      checked={notifications.email.reminders}
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        email: {
                          ...notifications.email,
                          reminders: checked
                        }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>
                    Configure push notifications for the mobile app
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-metrics">Metric Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new metrics and trends
                      </p>
                    </div>
                    <Switch 
                      id="push-metrics" 
                      checked={notifications.push.metrics}
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        push: {
                          ...notifications.push,
                          metrics: checked
                        }
                      })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-reports">Health Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new health reports
                      </p>
                    </div>
                    <Switch 
                      id="push-reports" 
                      checked={notifications.push.reports}
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        push: {
                          ...notifications.push,
                          reports: checked
                        }
                      })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-reminders">Measurement Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders to take your measurements
                      </p>
                    </div>
                    <Switch 
                      id="push-reminders" 
                      checked={notifications.push.reminders}
                      onCheckedChange={(checked) => setNotifications({
                        ...notifications,
                        push: {
                          ...notifications.push,
                          reminders: checked
                        }
                      })}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => toast({ title: "Notification preferences saved" })}>
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 