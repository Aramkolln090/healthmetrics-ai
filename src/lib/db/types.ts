export type MetricType = 'blood_pressure' | 'glucose' | 'heart_rate' | 'weight' | 'temperature' | 'oxygen_saturation';

export interface BaseMetric {
  id: string;
  user_id: string;
  recorded_at: string;
  notes?: string;
}

export interface BloodPressureMetric extends BaseMetric {
  type: 'blood_pressure';
  value: {
    systolic: number;
    diastolic: number;
  };
}

export interface GlucoseMetric extends BaseMetric {
  type: 'glucose';
  value: {
    level: number;
    unit: 'mg/dL' | 'mmol/L';
  };
}

export interface HeartRateMetric extends BaseMetric {
  type: 'heart_rate';
  value: {
    bpm: number;
  };
}

export interface WeightMetric extends BaseMetric {
  type: 'weight';
  value: {
    weight: number;
    unit: 'kg' | 'lbs';
  };
}

export interface TemperatureMetric extends BaseMetric {
  type: 'temperature';
  value: {
    temperature: number;
    unit: 'celsius' | 'fahrenheit';
  };
}

export interface OxygenSaturationMetric extends BaseMetric {
  type: 'oxygen_saturation';
  value: {
    percentage: number;
  };
}

export type HealthMetric = 
  | BloodPressureMetric 
  | GlucoseMetric 
  | HeartRateMetric 
  | WeightMetric 
  | TemperatureMetric 
  | OxygenSaturationMetric;

export interface MetricPreferences {
  id: string;
  user_id: string;
  preferred_units: {
    weight: 'kg' | 'lbs';
    temperature: 'celsius' | 'fahrenheit';
    glucose: 'mg/dL' | 'mmol/L';
  };
  target_ranges: {
    blood_pressure?: {
      systolic: { min: number; max: number };
      diastolic: { min: number; max: number };
    };
    glucose?: { min: number; max: number };
    heart_rate?: { min: number; max: number };
    weight?: { min: number; max: number };
  };
  created_at: string;
  updated_at: string;
} 