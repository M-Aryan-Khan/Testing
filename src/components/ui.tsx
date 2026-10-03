import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, action }: {
  eyebrow?: string; title: string; description: string; action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="page-action">{action}</div>}
    </header>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

export function StatusMessage({ type = "error", children, onClose }: {
  type?: "error" | "success" | "info"; children: ReactNode; onClose?: () => void;
}) {
  return (
    <div className={`status-message status-${type}`} role={type === "error" ? "alert" : "status"}>
      {type === "success" ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
      <span>{children}</span>
      {onClose && <button onClick={onClose} aria-label="Dismiss"><X size={17} /></button>}
    </div>
  );
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <div className="loading-state"><LoaderCircle className="spin" size={22} /> {label}</div>;
}

export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode; title: string; description: string; action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
