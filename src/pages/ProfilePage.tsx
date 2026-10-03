import { Save, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { LoadingState, PageHeader, Panel, StatusMessage } from "../components/ui";
import { api } from "../lib/api";
import type { Profile } from "../types";

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Profile>("/v1/users/me/profile").then(setProfile).catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load profile."));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setSaving(true); setError(""); setStatus("");
    try {
      const updated = await api<Profile>("/v1/users/me/profile", { method: "PATCH", body: {
        age_range: profile.age_range || null,
        wellness_focus: profile.wellness_focus || null,
        health_context: profile.health_context || null,
        context_enabled: profile.context_enabled,
      }});
      setProfile({ ...profile, ...updated });
      setStatus("Profile settings saved.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save profile."); }
    finally { setSaving(false); }
  };

  if (!profile && !error) return <LoadingState label="Loading your profile" />;

  return (
    <div className="page-stack narrow-page">
      <PageHeader eyebrow="Personal context" title="Your profile" description="Add only what is useful. You can switch context use off at any time." />
      {error && <StatusMessage onClose={() => setError("")}>{error}</StatusMessage>}
      {status && <StatusMessage type="success" onClose={() => setStatus("")}>{status}</StatusMessage>}
      {profile && <form className="profile-grid" onSubmit={submit}>
        <Panel>
          <div className="profile-card-heading"><span className="row-icon"><UserRound size={20} /></span><div><p className="eyebrow">Basic details</p><h2>Profile context</h2></div></div>
          <div className="stack-form">
            <label>Username<input value={profile.username || ""} disabled /><small>Usernames cannot be changed yet.</small></label>
            <label>Age range<input maxLength={30} value={profile.age_range || ""} onChange={(event) => setProfile({ ...profile, age_range: event.target.value })} placeholder="For example: 18 to 24" /></label>
            <label>Wellness focus<textarea rows={3} maxLength={300} value={profile.wellness_focus || ""} onChange={(event) => setProfile({ ...profile, wellness_focus: event.target.value })} placeholder="Better sleep, hydration, or a steadier daily routine" /></label>
            <label>Health context<textarea rows={4} maxLength={500} value={profile.health_context || ""} onChange={(event) => setProfile({ ...profile, health_context: event.target.value })} placeholder="Optional information you want HealthPulse to consider" /><small>Do not add information you are not comfortable storing.</small></label>
          </div>
        </Panel>
        <Panel>
          <div className="profile-card-heading"><span className="row-icon"><ShieldCheck size={20} /></span><div><p className="eyebrow">Consent control</p><h2>Use saved context</h2></div></div>
          <label className="toggle-card">
            <input type="checkbox" checked={profile.context_enabled} onChange={(event) => setProfile({ ...profile, context_enabled: event.target.checked })} />
            <span className="toggle-switch" />
            <span><strong>{profile.context_enabled ? "Context is enabled" : "Context is disabled"}</strong><small>When enabled, your profile and the six latest conversation messages can be included in a personalized request.</small></span>
          </label>
          <div className="context-explainer">
            <h3>What this controls</h3>
            <ul><li>Your age range and wellness focus</li><li>Your optional health context</li><li>Recent messages from the selected conversation</li></ul>
            <p>This does not make HealthPulse a medical record or diagnostic service.</p>
          </div>
          <button className="primary-button full-button" disabled={saving}><Save size={18} /> {saving ? "Saving..." : "Save profile"}</button>
        </Panel>
      </form>}
    </div>
  );
}
