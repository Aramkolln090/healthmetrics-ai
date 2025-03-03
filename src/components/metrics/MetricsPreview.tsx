
import React, { useRef, useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data
const bloodPressureData = [
  { date: "Jan", systolic: 120, diastolic: 80 },
  { date: "Feb", systolic: 122, diastolic: 82 },
  { date: "Mar", systolic: 130, diastolic: 85 },
  { date: "Apr", systolic: 125, diastolic: 83 },
  { date: "May", systolic: 135, diastolic: 88 },
  { date: "Jun", systolic: 145, diastolic: 92 },
  { date: "Jul", systolic: 140, diastolic: 90 },
];

const MetricsPreview = () => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMetric, setActiveMetric] = useState("blood-pressure");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-4xl mx-auto glass-panel rounded-2xl p-4 md:p-6 transition-all duration-700 ${
        isInView ? "animate-blur-in" : "opacity-0"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Health Metrics</h3>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-full transition-all ${
              activeMetric === "blood-pressure"
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => setActiveMetric("blood-pressure")}
          >
            Blood Pressure
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full transition-all ${
              activeMetric === "glucose"
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => setActiveMetric("glucose")}
          >
            Glucose
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full transition-all ${
              activeMetric === "weight"
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => setActiveMetric("weight")}
          >
            Weight
          </button>
        </div>
      </div>

      <div className="bg-white/50 rounded-xl p-4 shadow-sm">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bloodPressureData}>
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
                isAnimationActive={isInView}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                isAnimationActive={isInView}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <MetricCard
          title="Blood Pressure"
          value="140/90"
          trend="↑ 5%"
          trendUp
          details="Last measured today"
        />
        <MetricCard
          title="Glucose"
          value="105 mg/dL"
          trend="↓ 3%"
          trendUp={false}
          details="Last measured yesterday"
        />
        <MetricCard
          title="Weight"
          value="165 lbs"
          trend="→ 0%"
          trendUp={null}
          details="Last measured 2 days ago"
        />
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean | null;
  details: string;
}

const MetricCard = ({ title, value, trend, trendUp, details }: MetricCardProps) => (
  <div className="bg-white/50 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md">
    <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
    <div className="flex items-end justify-between mt-1">
      <p className="text-2xl font-semibold">{value}</p>
      <span
        className={`text-sm ${
          trendUp === true
            ? "text-red-500"
            : trendUp === false
            ? "text-green-500"
            : "text-gray-500"
        }`}
      >
        {trend}
      </span>
    </div>
    <p className="text-xs text-muted-foreground mt-2">{details}</p>
  </div>
);

export default MetricsPreview;
