import { supabase } from '../supabase';
import { metricsService } from './metrics';

export async function testSupabaseConnection(email: string, password: string) {
  try {
    // Sign in with provided credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Error signing in:', authError.message);
      return false;
    }

    console.log('Successfully signed in as:', authData.user?.email);

    // Test basic connection
    const { data: tableInfo, error: tableError } = await supabase
      .from('health_metrics')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error accessing health_metrics table:', tableError.message);
      return false;
    }

    console.log('Successfully connected to health_metrics table');

    // Test preferences table
    const { data: prefInfo, error: prefError } = await supabase
      .from('metric_preferences')
      .select('*')
      .limit(1);

    if (prefError) {
      console.error('Error accessing metric_preferences table:', prefError.message);
      return false;
    }

    console.log('Successfully connected to metric_preferences table');

    // Test inserting sample data
    const sampleMetric = {
      type: 'blood_pressure' as const,
      user_id: authData.user!.id,
      recorded_at: new Date().toISOString(),
      value: {
        systolic: 120,
        diastolic: 80
      },
      notes: 'Test reading'
    };

    try {
      await metricsService.createMetric(sampleMetric);
      console.log('Successfully inserted sample metric');

      // Clean up test data
      const { error: deleteError } = await supabase
        .from('health_metrics')
        .delete()
        .eq('user_id', authData.user!.id);

      if (deleteError) {
        console.error('Error cleaning up test data:', deleteError.message);
      } else {
        console.log('Successfully cleaned up test data');
      }
    } catch (error) {
      console.error('Error testing metric creation:', error);
      return false;
    }

    // Sign out after testing
    await supabase.auth.signOut();
    console.log('Successfully signed out');

    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
} 