import { ExternalLink, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, LoadingState, PageHeader, Panel, StatusMessage } from "../components/ui";
import { api, formatDate } from "../lib/api";
import type { Conversation, Message } from "../types";

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = () => {
    setLoading(true);
    api<Conversation[]>("/v1/conversations").then((data) => {
      setConversations(data);
      if (!selected && data[0]) setSelected(data[0].id);
    }).catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load conversations."))
      .finally(() => setLoading(false));
  };

  useEffect(loadConversations, []);
  useEffect(() => {
    if (!selected) { setMessages([]); return; }
    setMessageLoading(true);
    api<Message[]>(`/v1/conversations/${selected}/messages`).then(setMessages)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load messages."))
      .finally(() => setMessageLoading(false));
  }, [selected]);

  const createConversation = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const created = await api<Conversation>("/v1/conversations", { method: "POST", body: { title } });
      setTitle("");
      setShowCreate(false);
      setSelected(created.id);
      loadConversations();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create conversation.");
    }
  };

  const removeConversation = async (id: string) => {
    if (!window.confirm("Delete this conversation and all of its messages?")) return;
    try {
      await api(`/v1/conversations/${id}`, { method: "DELETE" });
      setSelected(null);
      setMessages([]);
      loadConversations();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete conversation.");
    }
  };

  return (
    <div className="page-stack conversation-page">
      <PageHeader eyebrow="History" title="Your conversations" description="Review saved questions, responses, warning signs, and source links." action={<button className="secondary-button" onClick={() => setShowCreate(true)}><Plus size={18} /> New conversation</button>} />
      {error && <StatusMessage onClose={() => setError("")}>{error}</StatusMessage>}
      {showCreate && <Panel><form className="inline-form" onSubmit={createConversation}><label>Conversation title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} minLength={1} maxLength={120} required placeholder="Sleep routine questions" /></label><button className="primary-button">Create</button><button type="button" className="text-button" onClick={() => setShowCreate(false)}>Cancel</button></form></Panel>}

      <div className="conversation-layout">
        <Panel className="conversation-list-panel">
          {loading ? <LoadingState label="Loading conversations" /> : conversations.length ? (
            <div className="conversation-list">
              {conversations.map((conversation) => (
                <button key={conversation.id} className={selected === conversation.id ? "selected" : ""} onClick={() => setSelected(conversation.id)}>
                  <span className="row-icon"><MessageSquareText size={18} /></span>
                  <span><strong>{conversation.title}</strong><small>{formatDate(conversation.updated_at)}</small></span>
                </button>
              ))}
            </div>
          ) : <EmptyState icon={<MessageSquareText size={24} />} title="No saved conversations" description="Questions saved from Health tools will appear here." action={<Link className="text-link" to="/health">Ask a health question</Link>} />}
        </Panel>

        <Panel className="message-panel">
          {messageLoading ? <LoadingState label="Loading messages" /> : selected ? (
            <>
              <div className="message-panel-head"><div><p className="eyebrow">Conversation record</p><h2>{conversations.find((item) => item.id === selected)?.title}</h2></div><button className="danger-icon" onClick={() => removeConversation(selected)} aria-label="Delete conversation"><Trash2 size={18} /></button></div>
              {messages.length ? <div className="message-list">{messages.map((message) => <MessageBubble message={message} key={message.id} />)}</div> : <div className="compact-empty"><p>This conversation has no messages yet.</p><Link to="/health">Continue it in Health tools</Link></div>}
            </>
          ) : <EmptyState icon={<MessageSquareText size={24} />} title="Select a conversation" description="Choose a conversation to review its messages." />}
        </Panel>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <article className={`message-bubble ${message.role}`}>
      <div className="message-meta"><strong>{message.role === "user" ? "You" : "HealthPulse"}</strong><span>{formatDate(message.created_at)}</span></div>
      <p>{message.content}</p>
      {message.urgency_level && <span className={`urgency-pill small urgency-label-${message.urgency_level}`}>{message.urgency_level.replace("-", " ")}</span>}
      {message.search_sources?.length > 0 && <div className="message-sources">{message.search_sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.title}<ExternalLink size={13} /></a>)}</div>}
    </article>
  );
}
