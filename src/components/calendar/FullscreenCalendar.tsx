import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, isWeekend } from "date-fns";
import { HealthMetric } from "@/lib/db/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DayWithMetrics = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  metrics: HealthMetric[];
};

interface FullscreenCalendarProps {
  metrics: Record<string, HealthMetric[]>;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

export function FullscreenCalendar({ metrics, onSelectDate, selectedDate }: FullscreenCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const navigateToToday = () => {
    setCurrentMonth(new Date());
    onSelectDate(new Date());
  };

  const navigateToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const navigateToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // Get day names for the header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Prepare the calendar grid with the correct days
  const startDate = startOfMonth(currentMonth);
  const startWeekDay = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Include days from previous month
  const prevMonthDays = Array.from({ length: startWeekDay }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() - (startWeekDay - i));
    return {
      date,
      isCurrentMonth: false,
      isToday: isToday(date),
      metrics: getDayMetrics(date)
    };
  });
  
  // Add days from current month
  const currentMonthDays = daysInMonth.map(date => ({
    date,
    isCurrentMonth: true,
    isToday: isToday(date),
    metrics: getDayMetrics(date)
  }));
  
  // Calculate how many days from next month we need
  const totalDaysShown = 42; // 6 rows of 7 days
  const nextMonthDaysNeeded = totalDaysShown - (prevMonthDays.length + currentMonthDays.length);
  
  // Include days from next month
  const nextMonthDays = Array.from({ length: nextMonthDaysNeeded }, (_, i) => {
    const date = new Date(endOfMonth(currentMonth));
    date.setDate(date.getDate() + (i + 1));
    return {
      date,
      isCurrentMonth: false,
      isToday: isToday(date),
      metrics: getDayMetrics(date)
    };
  });
  
  // Combine all days
  const calendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  
  // Function to get metrics for a specific day
  function getDayMetrics(date: Date): HealthMetric[] {
    const dateKey = format(date, 'yyyy-MM-dd');
    return metrics[dateKey] || [];
  }

  // Group the days into weeks
  const weeks: DayWithMetrics[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <CardTitle className="text-xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={navigateToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={navigateToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={navigateToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full">
          {/* Calendar header with weekday names */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={cn(
                  "py-2 text-center text-sm font-medium",
                  (index === 0 || index === 6) && "text-muted-foreground"
                )}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 border-collapse">
            {calendarDays.map((day, index) => {
              const hasMetrics = day.metrics.length > 0;
              const isSelected = selectedDate && isSameDay(day.date, selectedDate);
              const isWeekendDay = isWeekend(day.date);
              
              // Get unique metric types for this day
              const metricTypes = Array.from(new Set(day.metrics.map(m => m.type)));
              
              return (
                <button
                  key={index}
                  onClick={() => onSelectDate(day.date)}
                  className={cn(
                    "relative h-24 p-1 border text-left flex flex-col transition-colors",
                    !day.isCurrentMonth && "bg-gray-50 text-muted-foreground",
                    day.isToday && "bg-blue-50",
                    isSelected && "ring-2 ring-primary",
                    isWeekendDay && "bg-gray-50/50",
                    !day.isCurrentMonth && isWeekendDay && "bg-gray-50/80"
                  )}
                >
                  <span className={cn(
                    "inline-flex items-center justify-center h-6 w-6 rounded-full text-sm",
                    day.isToday && "bg-primary text-white font-medium",
                    !day.isToday && "font-medium"
                  )}>
                    {format(day.date, 'd')}
                  </span>
                  
                  {/* Metric indicators */}
                  {hasMetrics && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {metricTypes.map((type, i) => (
                        <span 
                          key={i} 
                          className={cn(
                            "h-2 w-2 rounded-full",
                            type === 'blood_pressure' ? 'bg-red-500' : 
                            type === 'glucose' ? 'bg-blue-500' : 'bg-purple-500'
                          )}
                          title={`${type.replace('_', ' ')} (${day.metrics.filter(m => m.type === type).length})`}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Show count of metrics */}
                  {hasMetrics && (
                    <div className="mt-auto text-xs text-muted-foreground">
                      {day.metrics.length} {day.metrics.length === 1 ? 'reading' : 'readings'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 