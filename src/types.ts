export type Urgency = "emergency" | "urgent" | "routine" | "self-care";

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user_id: string;
  username: string;
}

export interface Profile {
  user_id: string;
  username?: string;
  age_range: string | null;
  wellness_focus: string | null;
  health_context: string | null;
  context_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface HealthResponse {
  summary: string;
  urgency_level: Urgency;
  recommended_actions: string[];
  red_flags: string[];
  disclaimer: string;
  provider_used: string;
  sources: Source[];
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  urgency_level: Urgency | null;
  provider_used: string | null;
  search_sources: Source[];
  created_at: string;
}

export interface HealthMetric {
  id: string;
  recorded_on: string;
  sleep_hours: number | null;
  water_liters: number | null;
  weight_kg: number | null;
  activity_minutes: number | null;
  mood: string | null;
  notes: string | null;
}

export interface WellnessGoal {
  id: string;
  title: string;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  target_date: string | null;
  status: "active" | "completed" | "paused";
  created_at: string;
}

export interface AnalyticsSummary {
  event_count: number;
  by_event_type: Record<string, number>;
  by_provider: Record<string, number>;
  privacy_note: string;
}
