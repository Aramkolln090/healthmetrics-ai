
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { FullScreenCalendar } from "@/components/ui/fullscreen-calendar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Sample medication data converted to calendar events
const medicationEvents = [
  {
    day: new Date(),
    events: [
      {
        id: 1,
        name: "Lisinopril",
        time: "8:00 AM",
        datetime: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Metformin",
        time: "9:00 AM",
        datetime: new Date().toISOString(),
      },
    ],
  },
  {
    day: new Date(new Date().setDate(new Date().getDate() + 1)),
    events: [
      {
        id: 3,
        name: "Metformin",
        time: "9:00 AM",
        datetime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      },
      {
        id: 4,
        name: "Aspirin",
        time: "8:00 AM",
        datetime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
      },
    ],
  },
  {
    day: new Date(new Date().setDate(new Date().getDate() + 3)),
    events: [
      {
        id: 5,
        name: "Atorvastatin",
        time: "9:00 PM",
        datetime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
      },
    ],
  },
  {
    day: new Date(new Date().setDate(new Date().getDate() + 7)),
    events: [
      {
        id: 6,
        name: "Doctor Appointment",
        time: "10:00 AM",
        datetime: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      },
      {
        id: 7,
        name: "Blood Test",
        time: "11:00 AM",
        datetime: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      },
    ],
  },
  {
    day: new Date(new Date().setDate(new Date().getDate() + 14)),
    events: [
      {
        id: 8,
        name: "Follow-up Visit",
        time: "2:00 PM",
        datetime: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
      },
    ],
  },
];

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-6 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/metrics')}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Metrics</span>
          </Button>
          <h1 className="text-3xl font-bold">Medication Calendar</h1>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm">
          <FullScreenCalendar data={medicationEvents} />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
