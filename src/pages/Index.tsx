import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar1 } from "@/components/blocks/shadcnblocks-com-navbar1";
import HeroSection from "@/components/hero/HeroSection";
import FeatureCard from "@/components/features/FeatureCard";
import { FeatureSection } from "@/components/features/FeatureSection";
import AIPreview from "@/components/ai/AIPreview";
import MetricsPreview from "@/components/metrics/MetricsPreview";
import DisplayCards from "@/components/ui/display-cards";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { 
  Brain, 
  Activity, 
  Heart, 
  Bell, 
  LineChart, 
  ShieldCheck,
  Pill,
  Clock,
  CalendarDays,
  Smartphone,
  BarChart,
  Stethoscope,
  Users,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowButton } from "@/components/ui/glow-button";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Make content area have a max-height to prevent scrolling beyond footer
  useEffect(() => {
    const setContentHeight = () => {
      const footer = document.querySelector('footer');
      if (footer) {
        const footerHeight = footer.offsetHeight;
        document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
      }
    };
    
    setContentHeight();
    window.addEventListener('resize', setContentHeight);
    return () => window.removeEventListener('resize', setContentHeight);
  }, []);

  const medicationCards = [
    {
      icon: <Pill className="size-4 text-healthStatus-alert" />,
      title: "Medication Alert",
      description: "Time to take Lisinopril",
      date: "Just now",
      iconClassName: "text-healthStatus-alert",
      titleClassName: "text-healthStatus-alert",
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Clock className="size-4 text-primary" />,
      title: "Reminder",
      description: "Blood Pressure Check Due",
      date: "30 mins ago",
      iconClassName: "text-primary",
      titleClassName: "text-primary",
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <CalendarDays className="size-4 text-secondary" />,
      title: "Upcoming",
      description: "Doctor Appointment Tomorrow",
      date: "Today",
      iconClassName: "text-secondary",
      titleClassName: "text-secondary",
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  // Feature section steps
  const featureSteps = [
    {
      title: "Track Your Metrics",
      description: "Record your vital health metrics including blood pressure, glucose levels, and heart rate in a few simple taps.",
      icon: <Activity className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1050&q=80"
    },
    {
      title: "Visualize Your Health",
      description: "See your health trends with beautiful charts and graphs that make understanding your data simple and intuitive.",
      icon: <BarChart className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1050&q=80"
    },
    {
      title: "Get Smart Insights",
      description: "Receive personalized health insights and recommendations based on your metrics and health history.",
      icon: <Brain className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1050&q=80"
    },
    {
      title: "Share With Your Doctor",
      description: "Easily share your health metrics and insights with your healthcare provider for better informed care.",
      icon: <Stethoscope className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1050&q=80"
    },
    {
      title: "Set Health Goals",
      description: "Set personalized health goals and track your progress with motivating visualizations and achievements.",
      icon: <Target className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1050&q=80"
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar1 />
      </div>

      <div className="pt-24 max-h-[calc(100vh-var(--footer-height,80px))] overflow-y-auto">
        <HeroSection />
        
        {/* New Animated Feature Section */}
        <FeatureSection 
          steps={featureSteps}
          title="Take control of your health"
          subtitle="Our platform makes it easy to monitor, understand, and improve your health with these simple steps"
          className="bg-gradient-to-b from-white to-accent/30 dark:from-card dark:to-background"
        />
        
        <section id="features" className="py-24 px-4 relative">
          <div className="container mx-auto text-center mb-16">
            <span className="text-sm font-medium text-primary">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Your complete health companion
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track your vital health metrics and get personalized AI-powered insights,
              all in one beautifully designed platform.
            </p>
          </div>
          
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="AI Health Assistant"
              description="Get personalized health insights and recommendations based on your metrics."
              icon={<Brain className="h-5 w-5" />}
              index={0}
            />
            <FeatureCard
              title="Comprehensive Metrics"
              description="Track blood pressure, glucose levels, weight, sleep, and more."
              icon={<Activity className="h-5 w-5" />}
              index={1}
            />
            <FeatureCard
              title="Heart Health"
              description="Monitor cardiovascular health with detailed analysis and trends."
              icon={<Heart className="h-5 w-5" />}
              index={2}
            />
            <FeatureCard
              title="Medication Reminders"
              description="Never miss a dose with customizable reminders and tracking."
              icon={<Bell className="h-5 w-5" />}
              index={3}
            />
            <FeatureCard
              title="Data Visualization"
              description="View your health journey with beautiful charts and insightful reports."
              icon={<LineChart className="h-5 w-5" />}
              index={4}
            />
            <FeatureCard
              title="Privacy Focused"
              description="Your health data is encrypted and secure, giving you peace of mind."
              icon={<ShieldCheck className="h-5 w-5" />}
              index={5}
            />
          </div>
        </section>
        
        <section id="reminders" className="py-24 px-4 bg-gradient-to-b from-accent/30 to-white dark:from-background dark:to-card">
          <div className="container mx-auto text-center mb-16">
            <span className="text-sm font-medium text-primary">Reminders</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Stay on top of your health
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get timely reminders for medications, appointments, and health checks
              to maintain your wellness routine.
            </p>
          </div>
          
          <div className="flex min-h-[350px] w-full items-center justify-center">
            <div className="w-full max-w-3xl">
              <DisplayCards cards={medicationCards} />
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              onClick={() => navigate('/metrics')} 
              className="rounded-full px-8"
            >
              View All Reminders
            </Button>
          </div>
        </section>
        
        <section id="metrics" className="py-24 px-4 bg-gradient-to-b from-white to-accent/30 dark:from-card dark:to-background">
          <div className="container mx-auto text-center mb-16">
            <span className="text-sm font-medium text-primary">Metrics</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Track what matters
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Monitor all your vital health metrics in one place with beautiful
              visualizations and actionable insights.
            </p>
          </div>
          
          <MetricsPreview />
          
          <div className="mt-12 text-center">
            <Button 
              onClick={() => navigate('/metrics')} 
              className="rounded-full px-8"
            >
              View Detailed Metrics
            </Button>
          </div>
        </section>
        
        <section id="ai-assistant" className="py-24 px-4">
          <div className="container mx-auto text-center mb-16">
            <span className="text-sm font-medium text-primary">AI Assistant</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Your personal health guide
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get personalized health recommendations and insights from our
              AI-powered assistant, trained on the latest medical research.
            </p>
          </div>
          
          <AIPreview />
          
          <div className="mt-12 text-center">
            <Button 
              onClick={() => navigate('/chat')} 
              className="rounded-full px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Talk to Your AI Assistant
            </Button>
          </div>
        </section>
        
        <footer className="py-12 px-4 border-t">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <p className="text-xl font-bold">HealthyAI</p>
                <p className="text-sm text-muted-foreground">
                  Your complete health companion
                </p>
              </div>
              <div className="flex flex-wrap gap-6 justify-center">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary hover-underline">About</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary hover-underline">Features</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary hover-underline">Pricing</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary hover-underline">Blog</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary hover-underline">Contact</a>
              </div>
              <div className="mt-6 md:mt-0">
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} HealthyAI. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
