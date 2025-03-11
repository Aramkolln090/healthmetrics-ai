import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar1 } from "@/components/blocks/shadcnblocks-com-navbar1";
import HeroSection from "@/components/hero/HeroSection";
import FeatureCard from "@/components/features/FeatureCard";
import AIPreview from "@/components/ai/AIPreview";
import MetricsPreview from "@/components/metrics/MetricsPreview";
import DisplayCards from "@/components/ui/display-cards";
import { 
  Brain, 
  Activity, 
  Heart, 
  Bell, 
  LineChart, 
  ShieldCheck,
  Pill,
  Clock,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowButton } from "@/components/ui/glow-button";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const medicationCards = [
    {
      icon: <Pill className="size-4 text-red-300" />,
      title: "Medication Alert",
      description: "Time to take Lisinopril",
      date: "Just now",
      iconClassName: "text-red-500",
      titleClassName: "text-red-500",
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Clock className="size-4 text-blue-300" />,
      title: "Reminder",
      description: "Blood Pressure Check Due",
      date: "30 mins ago",
      iconClassName: "text-blue-500",
      titleClassName: "text-blue-500",
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <CalendarDays className="size-4 text-green-300" />,
      title: "Upcoming",
      description: "Doctor Appointment Tomorrow",
      date: "Today",
      iconClassName: "text-green-500",
      titleClassName: "text-green-500",
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar1 />
      <div className="pt-24">
        <HeroSection />
        
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
        
        <section id="reminders" className="py-24 px-4 bg-gradient-to-b from-blue-50/50 to-white">
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
        
        <section id="metrics" className="py-24 px-4 bg-gradient-to-b from-white to-blue-50">
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
              className="rounded-full px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
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
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} HealthyAI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
