import { BookOpenCheck, ExternalLink, HeartPulse, ListChecks, Search, Server, ShieldAlert, Stethoscope } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { EmptyState, PageHeader, Panel, StatusMessage } from "../components/ui";
import { api } from "../lib/api";
import type { Conversation, HealthResponse } from "../types";

type Mode = "guide" | "triage" | "wellness";

export function HealthToolsPage() {
  const [mode, setMode] = useState<Mode>("guide");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [saveHistory, setSaveHistory] = useState(true);
  const [webSearch, setWebSearch] = useState(false);
  const [question, setQuestion] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [age, setAge] = useState("");
  const [context, setContext] = useState("");
  const [goal, setGoal] = useState("");
  const [preferences, setPreferences] = useState("");
  const [result, setResult] = useState<HealthResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Conversation[]>("/v1/conversations").then(setConversations).catch(() => undefined);
  }, [result]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const shared = {
        conversation_id: conversationId || null,
        save_to_history: saveHistory,
      };
      if (mode === "guide") {
        setResult(await api<HealthResponse>("/v1/me/health/guide", {
          method: "POST",
          body: { ...shared, question, age: age ? Number(age) : null, context: context || null, use_web_search: webSearch },
        }));
      } else if (mode === "triage") {
        const symptomList = symptoms.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
        setResult(await api<HealthResponse>("/v1/me/health/triage", {
          method: "POST",
          body: { ...shared, symptoms: symptomList, duration: duration || null, age: age ? Number(age) : null, use_web_search: webSearch },
        }));
      } else {
        setResult(await api<HealthResponse>("/v1/me/health/wellness-plan", {
          method: "POST",
          body: { ...shared, goal, preferences: preferences || null },
        }));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to get guidance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Health tools" title="Ask with context, decide with care" description="Choose the kind of support you need. Saved context is optional and controlled from your profile." />
      <div className="tool-layout">
        <Panel className="tool-form-panel">
          <div className="segmented-control tool-tabs" role="tablist" aria-label="Health tool">
            <button type="button" className={mode === "guide" ? "active" : ""} onClick={() => { setMode("guide"); setResult(null); }}><HeartPulse size={17} /> General guide</button>
            <button type="button" className={mode === "triage" ? "active" : ""} onClick={() => { setMode("triage"); setResult(null); }}><Stethoscope size={17} /> Symptom triage</button>
            <button type="button" className={mode === "wellness" ? "active" : ""} onClick={() => { setMode("wellness"); setResult(null); }}><ListChecks size={17} /> Wellness plan</button>
          </div>

          <form className="stack-form" onSubmit={submit}>
            {mode === "guide" && (
              <>
                <label>What would you like guidance about?<textarea value={question} onChange={(event) => setQuestion(event.target.value)} minLength={5} maxLength={1000} required placeholder="For example: How can I improve my sleep routine?" rows={5} /></label>
                <div className="field-grid two-columns">
                  <label>Age, optional<input type="number" min="1" max="120" value={age} onChange={(event) => setAge(event.target.value)} placeholder="24" /></label>
                  <label>Extra context, optional<input value={context} onChange={(event) => setContext(event.target.value)} maxLength={1000} placeholder="Work schedule, routines, preferences" /></label>
                </div>
              </>
            )}
            {mode === "triage" && (
              <>
                <label>Symptoms<textarea value={symptoms} onChange={(event) => setSymptoms(event.target.value)} required placeholder="Enter symptoms separated by commas or new lines" rows={5} /></label>
                <div className="field-grid two-columns">
                  <label>How long?<input value={duration} onChange={(event) => setDuration(event.target.value)} maxLength={200} placeholder="For example: 2 days" /></label>
                  <label>Age, optional<input type="number" min="1" max="120" value={age} onChange={(event) => setAge(event.target.value)} placeholder="24" /></label>
                </div>
              </>
            )}
            {mode === "wellness" && (
              <>
                <label>Your wellness goal<textarea value={goal} onChange={(event) => setGoal(event.target.value)} minLength={3} maxLength={300} required placeholder="For example: Improve my daily energy" rows={4} /></label>
                <label>Preferences, optional<textarea value={preferences} onChange={(event) => setPreferences(event.target.value)} maxLength={600} placeholder="Schedule, foods, activities, or limitations to consider" rows={3} /></label>
              </>
            )}

            <label>Continue a conversation, optional
              <select value={conversationId} onChange={(event) => setConversationId(event.target.value)}>
                <option value="">Start a new conversation</option>
                {conversations.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
              </select>
            </label>

            <div className="option-row">
              <label className="check-option"><input type="checkbox" checked={saveHistory} onChange={(event) => setSaveHistory(event.target.checked)} /><span><strong>Save to history</strong><small>Keep this question and answer in your account.</small></span></label>
              {mode !== "wellness" && <label className="check-option"><input type="checkbox" checked={webSearch} onChange={(event) => setWebSearch(event.target.checked)} /><span><strong>Use trusted web sources</strong><small>Search WHO, CDC, NHS, and MedlinePlus.</small></span></label>}
            </div>
            {error && <StatusMessage>{error}</StatusMessage>}
            <button className="primary-button submit-button" disabled={loading}>{loading ? "Preparing guidance..." : "Get guidance"}</button>
          </form>
        </Panel>

        <div className="result-column">
          {result ? <HealthResult result={result} /> : (
            <Panel className="result-placeholder">
              <EmptyState icon={<BookOpenCheck size={25} />} title="Your guidance will appear here" description="HealthPulse returns a summary, practical next steps, warning signs, and sources when search is enabled." />
            </Panel>
          )}
          <div className="clinical-warning"><ShieldAlert size={19} /><p><strong>For emergencies</strong> Call local emergency services immediately for severe breathing difficulty, chest pain, major bleeding, unconsciousness, or other life-threatening symptoms.</p></div>
        </div>
      </div>
    </div>
  );
}

function HealthResult({ result }: { result: HealthResponse }) {
  return (
    <Panel className={`health-result urgency-${result.urgency_level}`}>
      <div className="result-topline">
        <span className="urgency-pill">{result.urgency_level.replace("-", " ")}</span>
        <span className="provider-note"><Server size={15} /> {result.provider_used}</span>
      </div>
      <div><p className="eyebrow">Guidance summary</p><h2>{result.summary}</h2></div>
      <div className="result-section">
        <h3><ListChecks size={18} /> Recommended actions</h3>
        <ol>{result.recommended_actions.map((action) => <li key={action}>{action}</li>)}</ol>
      </div>
      {result.red_flags.length > 0 && <div className="result-section red-flags"><h3><ShieldAlert size={18} /> Watch for these signs</h3><ul>{result.red_flags.map((flag) => <li key={flag}>{flag}</li>)}</ul></div>}
      {result.sources.length > 0 && <div className="result-section"><h3><Search size={18} /> Sources</h3><div className="source-list">{result.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.title}<ExternalLink size={15} /></a>)}</div></div>}
      <p className="result-disclaimer">{result.disclaimer}</p>
    </Panel>
  );
}
