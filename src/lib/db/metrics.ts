import { supabase } from '../supabase';
import { HealthMetric, MetricType, MetricPreferences } from './types';

export const metricsService = {
  // Create a new health metric entry
  async createMetric(metric: Omit<HealthMetric, 'id'>): Promise<HealthMetric> {
    const { data, error } = await supabase
      .from('health_metrics')
      .insert([metric])
      .select()
      .single();

    if (error) throw error;
    return data as HealthMetric;
  },

  // Get metrics by type and date range
  async getMetrics(
    userId: string,
    type: MetricType,
    startDate?: string,
    endDate?: string
  ): Promise<HealthMetric[]> {
    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type);

    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }
    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const { data, error } = await query.order('recorded_at', { ascending: false });

    if (error) throw error;
    return data as HealthMetric[];
  },

  // Update a metric entry
  async updateMetric(id: string, updates: Partial<HealthMetric>): Promise<HealthMetric> {
    const { data, error } = await supabase
      .from('health_metrics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as HealthMetric;
  },

  // Delete a metric entry
  async deleteMetric(id: string): Promise<void> {
    const { error } = await supabase
      .from('health_metrics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get user's metric preferences
  async getMetricPreferences(userId: string): Promise<MetricPreferences | null> {
    const { data, error } = await supabase
      .from('metric_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data as MetricPreferences | null;
  },

  // Update user's metric preferences
  async updateMetricPreferences(
    userId: string,
    preferences: Partial<MetricPreferences>
  ): Promise<MetricPreferences> {
    const { data: existing } = await supabase
      .from('metric_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('metric_preferences')
        .update(preferences)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as MetricPreferences;
    } else {
      const { data, error } = await supabase
        .from('metric_preferences')
        .insert([{ user_id: userId, ...preferences }])
        .select()
        .single();

      if (error) throw error;
      return data as MetricPreferences;
    }
  },

  // Get latest metric of a specific type
  async getLatestMetric(
    userId: string,
    type: MetricType
  ): Promise<HealthMetric | null> {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as HealthMetric | null;
  }
}; 