import { Check, CirclePause, Plus, Target, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { EmptyState, LoadingState, PageHeader, Panel, StatusMessage } from "../components/ui";
import { api, formatDate } from "../lib/api";
import type { WellnessGoal } from "../types";

const emptyGoal = { title: "", target_value: "", current_value: "", unit: "", target_date: "" };

export function GoalsPage() {
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [form, setForm] = useState(emptyGoal);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      setGoals(await api<WellnessGoal[]>("/v1/users/me/goals"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load goals.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api("/v1/users/me/goals", { method: "POST", body: {
        title: form.title,
        target_value: form.target_value ? Number(form.target_value) : null,
        current_value: form.current_value ? Number(form.current_value) : null,
        unit: form.unit || null,
        target_date: form.target_date || null,
      }});
      setForm(emptyGoal); setShowForm(false); load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save goal."); }
  };

  const update = async (id: string, body: object) => {
    try { await api(`/v1/users/me/goals/${id}`, { method: "PATCH", body }); load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to update goal."); }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this wellness goal?")) return;
    try { await api(`/v1/users/me/goals/${id}`, { method: "DELETE" }); load(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to delete goal."); }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Progress" title="Wellness goals" description="Set practical goals and update them as your routine changes." action={<button className="primary-button" onClick={() => setShowForm((value) => !value)}><Plus size={18} /> New goal</button>} />
      {error && <StatusMessage onClose={() => setError("")}>{error}</StatusMessage>}
      {showForm && <Panel><form className="stack-form" onSubmit={submit}>
        <div><p className="eyebrow">New goal</p><h2>What are you working toward?</h2></div>
        <label>Goal title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} minLength={3} maxLength={120} required placeholder="Sleep 7 hours each night" /></label>
        <div className="field-grid two-columns">
          <label>Target value<input type="number" step="0.1" value={form.target_value} onChange={(event) => setForm({ ...form, target_value: event.target.value })} placeholder="7" /></label>
          <label>Current value<input type="number" step="0.1" value={form.current_value} onChange={(event) => setForm({ ...form, current_value: event.target.value })} placeholder="5" /></label>
          <label>Unit<input maxLength={30} value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="hours" /></label>
          <label>Target date<input type="date" value={form.target_date} onChange={(event) => setForm({ ...form, target_date: event.target.value })} /></label>
        </div>
        <div className="form-actions"><button className="primary-button">Save goal</button><button type="button" className="text-button" onClick={() => setShowForm(false)}>Cancel</button></div>
      </form></Panel>}

      {isLoading ? <Panel><LoadingState label="Loading wellness goals" /></Panel> : goals.length ? <div className="goal-list">{goals.map((goal) => {
        const progress = goal.target_value && goal.current_value !== null ? Math.min(100, Math.max(0, (goal.current_value / goal.target_value) * 100)) : null;
        return <Panel className={`goal-card goal-${goal.status}`} key={goal.id}>
          <div className="goal-status-icon">{goal.status === "completed" ? <Check size={21} /> : goal.status === "paused" ? <CirclePause size={21} /> : <Target size={21} />}</div>
          <div className="goal-content">
            <div className="goal-title-row"><div><span className="status-tag">{goal.status}</span><h3>{goal.title}</h3></div><button className="danger-icon" onClick={() => remove(goal.id)} aria-label="Delete goal"><Trash2 size={17} /></button></div>
            {progress !== null && <div className="progress-wrap"><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{goal.current_value} of {goal.target_value} {goal.unit || ""}</small></div>}
            <p className="goal-date">Target date: {formatDate(goal.target_date)}</p>
            <div className="goal-actions">
              {goal.status !== "completed" && <button className="small-button" onClick={() => update(goal.id, { status: "completed" })}>Mark complete</button>}
              {goal.status === "active" && <button className="small-button secondary" onClick={() => update(goal.id, { status: "paused" })}>Pause</button>}
              {goal.status !== "active" && <button className="small-button secondary" onClick={() => update(goal.id, { status: "active" })}>Set active</button>}
            </div>
          </div>
        </Panel>;
      })}</div> : <Panel><EmptyState icon={<Target size={25} />} title="No wellness goals" description="Create one realistic goal and give yourself room to adjust it." /></Panel>}
    </div>
  );
}
