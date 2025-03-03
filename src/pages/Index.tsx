
import React, { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import FeatureCard from "@/components/features/FeatureCard";
import AIPreview from "@/components/ai/AIPreview";
import MetricsPreview from "@/components/metrics/MetricsPreview";
import { 
  Brain, 
  Activity, 
  Heart, 
  Bell, 
  LineChart, 
  ShieldCheck
} from "lucide-react";

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
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
      
      {/* Metrics Section */}
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
      </section>
      
      {/* AI Assistant Section */}
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
      </section>
      
      {/* Footer */}
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
  );
};

export default Index;
