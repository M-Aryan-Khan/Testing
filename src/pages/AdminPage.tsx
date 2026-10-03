import { BarChart3, Database, Server, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { PageHeader, Panel, StatusMessage } from "../components/ui";
import { api } from "../lib/api";
import type { AnalyticsSummary } from "../types";

export function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("healthpulse_admin_key") || "");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const data = await api<AnalyticsSummary>("/v1/admin/analytics/summary", { auth: false, headers: { "X-Admin-Key": adminKey } });
      sessionStorage.setItem("healthpulse_admin_key", adminKey);
      setSummary(data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load analytics."); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Private administration" title="Usage analytics" description="Aggregate request and provider counts only. No user identity or health text is included." />
      <Panel className="admin-key-panel">
        <form className="inline-form" onSubmit={load}><label>Admin API key<input type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} required placeholder="Enter ADMIN_API_KEY" /></label><button className="primary-button" disabled={loading}>{loading ? "Loading..." : "View analytics"}</button></form>
      </Panel>
      {error && <StatusMessage onClose={() => setError("")}>{error}</StatusMessage>}
      {summary ? <>
        <section className="stat-grid three-stat-grid">
          <Panel className="stat-card stat-primary"><Database size={21} /><div><strong>{summary.event_count}</strong><span>Total events</span></div></Panel>
          <Panel className="stat-card"><BarChart3 size={21} /><div><strong>{Object.keys(summary.by_event_type).length}</strong><span>Event types</span></div></Panel>
          <Panel className="stat-card"><Server size={21} /><div><strong>{Object.keys(summary.by_provider).length}</strong><span>Providers used</span></div></Panel>
        </section>
        <div className="dashboard-grid">
          <Panel><div className="panel-heading"><div><p className="eyebrow">Requests</p><h2>By event type</h2></div></div><CountList values={summary.by_event_type} /></Panel>
          <Panel><div className="panel-heading"><div><p className="eyebrow">Model routing</p><h2>By provider</h2></div></div><CountList values={summary.by_provider} /></Panel>
        </div>
        <Panel className="safety-note"><span className="row-icon"><ShieldCheck size={20} /></span><div><strong>Privacy design</strong><p>{summary.privacy_note}</p></div></Panel>
      </> : <Panel className="admin-empty"><BarChart3 size={27} /><h2>Analytics are locked</h2><p>Enter the server-side admin key to view aggregate usage.</p></Panel>}
    </div>
  );
}

function CountList({ values }: { values: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(values));
  return <div className="count-list">{Object.entries(values).map(([label, value]) => <div className="count-row" key={label}><div><span>{label.replaceAll("-", " ")}</span><strong>{value}</strong></div><div className="count-track"><span style={{ width: `${(value / max) * 100}%` }} /></div></div>)}</div>;
}
