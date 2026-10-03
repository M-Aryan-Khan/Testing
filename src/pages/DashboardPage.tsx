import { Activity, ArrowRight, BookHeart, MessageSquareText, Plus, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { LoadingState, PageHeader, Panel, StatusMessage } from "../components/ui";
import { api, formatDate } from "../lib/api";
import type { Conversation, HealthMetric, Profile, WellnessGoal } from "../types";

export function DashboardPage() {
  const { username, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<Profile>("/v1/users/me/profile"),
      api<Conversation[]>("/v1/conversations"),
      api<HealthMetric[]>("/v1/users/me/metrics"),
      api<WellnessGoal[]>("/v1/users/me/goals"),
    ]).then(([profileData, conversationData, metricData, goalData]) => {
      setProfile(profileData);
      setConversations(conversationData);
      setMetrics(metricData);
      setGoals(goalData);
    }).catch((caught) => {
      if ((caught as { status?: number }).status === 401) logout();
      else setError(caught instanceof Error ? caught.message : "Unable to load your dashboard.");
    }).finally(() => setLoading(false));
  }, [logout]);

  if (loading) return <LoadingState label="Preparing your dashboard" />;

  const activeGoals = goals.filter((goal) => goal.status === "active");
  const latestMetric = metrics[0];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Today"
        title={`Good to see you, ${username}`}
        description="A simple view of your recent health activity and next steps."
        action={<Link className="primary-button" to="/health"><Plus size={18} /> Ask HealthPulse</Link>}
      />
      {error && <StatusMessage>{error}</StatusMessage>}

      <section className="stat-grid">
        <Panel className="stat-card stat-primary">
          <MessageSquareText size={21} />
          <div><strong>{conversations.length}</strong><span>Conversations</span></div>
          <Link to="/conversations" aria-label="View conversations"><ArrowRight size={18} /></Link>
        </Panel>
        <Panel className="stat-card">
          <Target size={21} />
          <div><strong>{activeGoals.length}</strong><span>Active goals</span></div>
          <Link to="/goals" aria-label="View goals"><ArrowRight size={18} /></Link>
        </Panel>
        <Panel className="stat-card">
          <Activity size={21} />
          <div><strong>{metrics.length}</strong><span>Metric entries</span></div>
          <Link to="/metrics" aria-label="View health metrics"><ArrowRight size={18} /></Link>
        </Panel>
        <Panel className="stat-card">
          <BookHeart size={21} />
          <div><strong>{profile?.context_enabled ? "On" : "Off"}</strong><span>Personal context</span></div>
          <Link to="/profile" aria-label="Open profile"><ArrowRight size={18} /></Link>
        </Panel>
      </section>

      <section className="dashboard-grid">
        <Panel>
          <div className="panel-heading">
            <div><p className="eyebrow">Recent activity</p><h2>Conversations</h2></div>
            <Link className="text-link" to="/conversations">View all</Link>
          </div>
          {conversations.length ? (
            <div className="activity-list">
              {conversations.slice(0, 4).map((conversation) => (
                <Link to="/conversations" className="activity-row" key={conversation.id}>
                  <span className="row-icon"><MessageSquareText size={18} /></span>
                  <span><strong>{conversation.title}</strong><small>Updated {formatDate(conversation.updated_at)}</small></span>
                  <ArrowRight size={17} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="compact-empty"><p>No conversations saved yet.</p><Link to="/health">Start your first question</Link></div>
          )}
        </Panel>

        <Panel>
          <div className="panel-heading">
            <div><p className="eyebrow">Daily picture</p><h2>Latest check-in</h2></div>
            <Link className="text-link" to="/metrics">Add entry</Link>
          </div>
          {latestMetric ? (
            <div className="metric-summary">
              <p className="metric-date">{formatDate(latestMetric.recorded_on)}</p>
              <div className="metric-values">
                <span><strong>{latestMetric.sleep_hours ?? "-"}</strong>Hours sleep</span>
                <span><strong>{latestMetric.water_liters ?? "-"}</strong>Litres water</span>
                <span><strong>{latestMetric.activity_minutes ?? "-"}</strong>Active minutes</span>
                <span><strong>{latestMetric.mood ?? "-"}</strong>Mood</span>
              </div>
              {latestMetric.notes && <p className="soft-note">{latestMetric.notes}</p>}
            </div>
          ) : (
            <div className="compact-empty"><p>Your latest wellness check-in will appear here.</p><Link to="/metrics">Record a metric</Link></div>
          )}
        </Panel>
      </section>

      <Panel className="safety-note">
        <span className="row-icon"><BookHeart size={20} /></span>
        <div><strong>A quick safety reminder</strong><p>HealthPulse gives educational guidance. For severe symptoms or an emergency, contact local emergency services immediately.</p></div>
      </Panel>
    </div>
  );
}
