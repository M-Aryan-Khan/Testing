import { Activity, Droplets, Moon, Plus, Trash2, Weight } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { EmptyState, LoadingState, PageHeader, Panel, StatusMessage } from "../components/ui";
import { api, formatDate } from "../lib/api";
import type { HealthMetric } from "../types";

const emptyForm = { recorded_on: "", sleep_hours: "", water_liters: "", weight_kg: "", activity_minutes: "", mood: "", notes: "" };

export function MetricsPage() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      setMetrics(await api<HealthMetric[]>("/v1/users/me/metrics"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load metrics.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const optionalNumber = (value: string) => value === "" ? null : Number(value);
    try {
      await api("/v1/users/me/metrics", { method: "POST", body: {
        recorded_on: form.recorded_on || null,
        sleep_hours: optionalNumber(form.sleep_hours),
        water_liters: optionalNumber(form.water_liters),
        weight_kg: optionalNumber(form.weight_kg),
        activity_minutes: optionalNumber(form.activity_minutes),
        mood: form.mood || null,
        notes: form.notes || null,
      }});
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save metric.");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this metric entry?")) return;
    try { await api(`/v1/users/me/metrics/${id}`, { method: "DELETE" }); load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to delete metric."); }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Wellness diary" title="Health metrics" description="Record simple daily observations. Every field is optional." action={<button className="primary-button" onClick={() => setShowForm((value) => !value)}><Plus size={18} /> Add check-in</button>} />
      {error && <StatusMessage onClose={() => setError("")}>{error}</StatusMessage>}
      {showForm && <Panel><form className="stack-form metric-form" onSubmit={submit}>
        <div className="panel-heading"><div><p className="eyebrow">New entry</p><h2>Daily check-in</h2></div></div>
        <div className="field-grid three-columns">
          <label>Date<input type="date" value={form.recorded_on} onChange={(event) => setForm({ ...form, recorded_on: event.target.value })} /></label>
          <label>Sleep hours<input type="number" step="0.5" min="0" max="24" value={form.sleep_hours} onChange={(event) => setForm({ ...form, sleep_hours: event.target.value })} /></label>
          <label>Water, litres<input type="number" step="0.1" min="0" max="20" value={form.water_liters} onChange={(event) => setForm({ ...form, water_liters: event.target.value })} /></label>
          <label>Weight, kg<input type="number" step="0.1" min="1" max="500" value={form.weight_kg} onChange={(event) => setForm({ ...form, weight_kg: event.target.value })} /></label>
          <label>Activity minutes<input type="number" min="0" max="1440" value={form.activity_minutes} onChange={(event) => setForm({ ...form, activity_minutes: event.target.value })} /></label>
          <label>Mood<input maxLength={40} value={form.mood} onChange={(event) => setForm({ ...form, mood: event.target.value })} placeholder="Calm, low, energised" /></label>
        </div>
        <label>Notes<textarea rows={3} maxLength={300} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Anything you want to remember about today" /></label>
        <div className="form-actions"><button className="primary-button">Save check-in</button><button type="button" className="text-button" onClick={() => setShowForm(false)}>Cancel</button></div>
      </form></Panel>}

      {isLoading ? <Panel><LoadingState label="Loading health metrics" /></Panel> : metrics.length ? <div className="metric-card-grid">{metrics.map((metric) => (
        <Panel className="metric-card" key={metric.id}>
          <div className="metric-card-head"><span>{formatDate(metric.recorded_on)}</span><button className="danger-icon" onClick={() => remove(metric.id)} aria-label="Delete metric"><Trash2 size={17} /></button></div>
          <div className="metric-line"><Moon size={18} /><span><strong>{metric.sleep_hours ?? "Not set"}</strong> sleep hours</span></div>
          <div className="metric-line"><Droplets size={18} /><span><strong>{metric.water_liters ?? "Not set"}</strong> litres water</span></div>
          <div className="metric-line"><Activity size={18} /><span><strong>{metric.activity_minutes ?? "Not set"}</strong> active minutes</span></div>
          <div className="metric-line"><Weight size={18} /><span><strong>{metric.weight_kg ?? "Not set"}</strong> kg</span></div>
          {metric.mood && <span className="mood-tag">Mood: {metric.mood}</span>}
          {metric.notes && <p className="soft-note">{metric.notes}</p>}
        </Panel>
      ))}</div> : <Panel><EmptyState icon={<Activity size={25} />} title="No metrics recorded" description="Add a check-in when you want to track sleep, water, activity, weight, or mood." /></Panel>}
    </div>
  );
}
