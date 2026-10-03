import { Download, Eraser, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { PageHeader, Panel, StatusMessage } from "../components/ui";
import { api } from "../lib/api";

export function PrivacyPage() {
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const exportData = async () => {
    try {
      const data = await api<object>("/v1/users/me/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `healthpulse-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("Your data export was downloaded.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to export data."); }
  };

  const clearData = async () => {
    if (!window.confirm("Clear all saved health data while keeping your account?")) return;
    try { await api("/v1/users/me/data", { method: "DELETE" }); setStatus("Your saved health data was cleared."); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to clear data."); }
  };

  const deleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    try { await api("/v1/users/me/account", { method: "DELETE" }); logout(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to delete account."); }
  };

  return (
    <div className="page-stack narrow-page">
      <PageHeader eyebrow="Data controls" title="Privacy and account" description="Download your information, clear saved wellness data, or permanently remove your account." />
      {error && <StatusMessage onClose={() => setError("")}>{error}</StatusMessage>}
      {status && <StatusMessage type="success" onClose={() => setStatus("")}>{status}</StatusMessage>}
      <div className="privacy-grid">
        <Panel className="privacy-card"><span className="privacy-icon"><Download size={21} /></span><div><h2>Export your data</h2><p>Download your profile, conversations, messages, metrics, and goals as a JSON file.</p><button className="secondary-button" onClick={exportData}>Download export</button></div></Panel>
        <Panel className="privacy-card"><span className="privacy-icon"><Eraser size={21} /></span><div><h2>Clear health data</h2><p>Delete conversations, messages, metrics, and goals. Your username and account remain active.</p><button className="secondary-button" onClick={clearData}>Clear saved data</button></div></Panel>
        <Panel className="privacy-card privacy-information"><span className="privacy-icon"><ShieldCheck size={21} /></span><div><h2>How your data is handled</h2><p>Passwords remain in Supabase Auth. HealthPulse stores only data you submit and anonymous provider usage events.</p><ul><li>Saved context can be disabled</li><li>Search sources stay with saved answers</li><li>Analytics contain no health text</li></ul></div></Panel>
        <Panel className="privacy-card privacy-information"><span className="privacy-icon"><KeyRound size={21} /></span><div><h2>Session security</h2><p>Your access token is used to authorize private API requests. Sign out on shared devices when you finish.</p><button className="text-button" onClick={logout}>Sign out now</button></div></Panel>
      </div>
      <Panel className="danger-zone">
        <div className="danger-zone-heading"><Trash2 size={21} /><div><p className="eyebrow">Permanent action</p><h2>Delete account</h2></div></div>
        <p>This removes your Supabase Auth account and all associated HealthPulse data. It cannot be undone.</p>
        <label>Type DELETE to confirm<input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} placeholder="DELETE" /></label>
        <button className="danger-button" disabled={confirmText !== "DELETE"} onClick={deleteAccount}>Permanently delete account</button>
      </Panel>
    </div>
  );
}
