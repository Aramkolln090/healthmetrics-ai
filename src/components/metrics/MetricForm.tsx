import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MetricType, HealthMetric } from '@/lib/db/types';
import { metricsService } from '@/lib/db/metrics';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Form schema for different metric types
const metricSchemas = {
  blood_pressure: z.object({
    type: z.literal('blood_pressure'),
    systolic: z.number().min(70).max(200),
    diastolic: z.number().min(40).max(130),
    recorded_at: z.string(),
    notes: z.string().optional(),
  }),
  glucose: z.object({
    type: z.literal('glucose'),
    level: z.number().min(20).max(600),
    unit: z.enum(['mg/dL', 'mmol/L']),
    recorded_at: z.string(),
    notes: z.string().optional(),
  }),
  heart_rate: z.object({
    type: z.literal('heart_rate'),
    bpm: z.number().min(30).max(220),
    recorded_at: z.string(),
    notes: z.string().optional(),
  }),
  // Add other metric type schemas as needed
};

interface MetricFormProps {
  type: MetricType;
  initialData?: HealthMetric;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MetricForm({ type, initialData, onSuccess, onCancel }: MetricFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const schema = metricSchemas[type as keyof typeof metricSchemas];
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type,
      recorded_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      ...(initialData?.value || {}),
      notes: initialData?.notes || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const metricData = {
        type,
        user_id: user.id,
        recorded_at: values.recorded_at,
        notes: values.notes,
        value: {
          ...(type === 'blood_pressure' 
            ? { systolic: values.systolic, diastolic: values.diastolic }
            : type === 'glucose'
            ? { level: values.level, unit: values.unit }
            : type === 'heart_rate'
            ? { bpm: values.bpm }
            : {}),
        },
      };

      if (initialData?.id) {
        await metricsService.updateMetric(initialData.id, metricData);
        toast({ title: 'Metric updated successfully' });
      } else {
        await metricsService.createMetric(metricData);
        toast({ title: 'Metric added successfully' });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving metric:', error);
      toast({ 
        title: 'Error saving metric', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'blood_pressure':
        return (
          <>
            <FormField
              control={form.control}
              name="systolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic (mmHg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diastolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diastolic (mmHg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'glucose':
        return (
          <>
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glucose Level</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mg/dL">mg/dL</SelectItem>
                      <SelectItem value="mmol/L">mmol/L</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'heart_rate':
        return (
          <FormField
            control={form.control}
            name="bpm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heart Rate (BPM)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      // Add other metric type fields as needed
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit' : 'Add'} {type.replace('_', ' ')} Reading</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderFields()}
            
            <FormField
              control={form.control}
              name="recorded_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pb-0">
              <Button type="submit" className="mr-2">
                {initialData ? 'Update' : 'Add'} Reading
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 