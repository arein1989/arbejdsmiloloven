import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import {
  ArrowLeft,
  Download,
  Loader2,
  MessageSquarePlus,
  SendHorizontal,
  Trash2,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { takePendingPlanFile } from "@/lib/pending-plan-file";
import { BOTS, isBotId } from "@/lib/bots";
import {
  createThread,
  deleteThread,
  getThreadMessages,
  listThreads,
} from "@/lib/chat.functions";
import { getSessionId } from "@/lib/session";

export const Route = createFileRoute("/chat/$botId/$threadId")({
  component: ChatPage,
});

type ThreadRow = {
  id: string;
  title: string;
  created_at: string;
  expires_at: string;
  bot_id: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Filen kunne ikke læses"));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function ChatPage() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const botId = params.botId;
  const threadId = params.threadId;

  if (!isBotId(botId)) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Link to="/" className="text-primary underline">Tilbage til forsiden</Link>
      </div>
    );
  }
  const bot = BOTS[botId];

  const [sessionId, setSessionId] = useState<string>("");
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Bootstrap session + initial messages
  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    setInitialMessages(null);
    getThreadMessages({ data: { sessionId: sid, threadId } })
      .then((res) => {
        if (!res.thread) {
          navigate({ to: "/chat/$botId", params: { botId } });
          return;
        }
        const ui: UIMessage[] = res.messages.map((m) => ({
          id: m.id,
          role: m.role as UIMessage["role"],
          parts: [{ type: "text", text: m.content }],
        }));
        setInitialMessages(ui);
      })
      .catch((e) => {
        console.error(e);
        setInitialMessages([]);
      });
  }, [threadId, botId, navigate]);

  // Load thread list
  const refreshThreads = (sid: string) =>
    listThreads({ data: { sessionId: sid, botId } })
      .then((rows) => setThreads(rows as ThreadRow[]))
      .catch(console.error);
  useEffect(() => {
    if (sessionId) refreshThreads(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, botId, threadId]);

  if (initialMessages === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <ChatInner
      key={threadId}
      sessionId={sessionId}
      botId={botId}
      threadId={threadId}
      initialMessages={initialMessages}
      threads={threads}
      onThreadsChange={() => sessionId && refreshThreads(sessionId)}
      input={input}
      setInput={setInput}
      taRef={taRef}
      scrollRef={scrollRef}
      botName={bot.short}
      botTitle={bot.title}
    />
  );
}

function ChatInner({
  sessionId,
  botId,
  threadId,
  initialMessages,
  threads,
  onThreadsChange,
  input,
  setInput,
  taRef,
  scrollRef,
  botName,
  botTitle,
}: {
  sessionId: string;
  botId: "problem" | "regler" | "viden" | "plan";
  threadId: string;
  initialMessages: UIMessage[];
  threads: ThreadRow[];
  onThreadsChange: () => void;
  input: string;
  setInput: (s: string) => void;
  taRef: React.RefObject<HTMLTextAreaElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  botName: string;
  botTitle: string;
}) {
  const navigate = useNavigate();
  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { botId, threadId },
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const pendingFileHandled = useRef(false);

  useEffect(() => {
    if (botId !== "plan" || pendingFileHandled.current || messages.length > 0 || status !== "ready") return;
    pendingFileHandled.current = true;
    takePendingPlanFile(threadId)
      .then(async (file) => {
        if (!file) return;
        const url = await fileToDataUrl(file);
        await sendMessage({
          text: "Analysér den vedhæftede PDF og hjælp mig med at udarbejde en konkret handlingsplan.",
          files: [{ type: "file", mediaType: "application/pdf", filename: file.name, url }],
        });
      })
      .catch((uploadError) => console.error("PDF upload error", uploadError));
  }, [botId, messages.length, sendMessage, status, threadId]);

  // Auto-scroll & focus
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, scrollRef]);
  useEffect(() => {
    taRef.current?.focus();
  }, [threadId, taRef]);
  useEffect(() => {
    if (status === "ready") taRef.current?.focus();
  }, [status, taRef]);

  // Refresh thread list after assistant finishes (title updates)
  useEffect(() => {
    if (status === "ready" && messages.length > 0) onThreadsChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage({ text });
  };

  const handlePlanSubmit = ({ text }: PromptInputMessage) => {
    const message = text.trim();
    if (!message || isLoading) return;
    setInput("");
    sendMessage({ text: message });
  };

  const handleNewThread = async () => {
    const row = await createThread({ data: { sessionId, botId } });
    onThreadsChange();
    navigate({ to: "/chat/$botId/$threadId", params: { botId, threadId: row.id } });
  };

  const handleDelete = async (id: string) => {
    await deleteThread({ data: { sessionId, threadId: id } });
    if (id === threadId) {
      const next = threads.find((t) => t.id !== id);
      if (next) navigate({ to: "/chat/$botId/$threadId", params: { botId, threadId: next.id } });
      else navigate({ to: "/chat/$botId", params: { botId } });
    } else {
      onThreadsChange();
    }
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${botName} — samtale`, margin, y);
    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(new Date().toLocaleString("da-DK"), margin, y);
    y += 22;
    doc.setTextColor(20);

    for (const m of messages) {
      const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
      if (!text) continue;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const label = m.role === "user" ? "Du" : botName;
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(label, margin, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(text, width) as string[];
      for (const line of lines) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 14;
      }
      y += 8;
    }
    doc.save(`samtale-${botId}.pdf`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className={`mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6 sm:px-6 ${botId === "plan" ? "bg-gradient-to-b from-plan-top to-plan-bottom" : ""}`}>
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col md:flex">
          <Link
            to="/"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> Forside
          </Link>
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
            <button
              onClick={handleNewThread}
              className="flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              <MessageSquarePlus size={16} /> Ny samtale
            </button>
            <div className="mt-4 mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dine samtaler
            </div>
            <ul className="space-y-1">
              {threads.length === 0 && (
                <li className="px-2 py-2 text-xs text-muted-foreground">Ingen endnu</li>
              )}
              {threads.map((t) => {
                const active = t.id === threadId;
                return (
                  <li key={t.id} className="group flex items-center gap-1">
                    <Link
                      to="/chat/$botId/$threadId"
                      params={{ botId, threadId: t.id }}
                      className={`flex-1 truncate rounded-md px-2 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-muted"
                      }`}
                      title={t.title}
                    >
                      {t.title}
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id)}
                      aria-label="Slet samtale"
                      className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
              Samtaler slettes automatisk efter 1 time.
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className={`flex min-w-0 flex-1 flex-col rounded-2xl border border-border bg-card shadow-sm ${botId === "plan" ? "min-h-[720px] overflow-hidden" : ""}`}>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wider text-primary/80">
                {botName}
              </div>
              <h1 className="truncate font-display text-lg font-semibold">{botTitle}</h1>
            </div>
            <button
              onClick={downloadPdf}
              disabled={messages.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>

          {botId === "plan" ? (
            <Conversation className="min-h-0">
              <ConversationContent className="px-5 py-7 sm:px-8">
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    icon={<MessageSquarePlus className="h-6 w-6" />}
                    title="Gør din PDF klar"
                    description="Din fil bliver analyseret, og derefter kan du stille opfølgende spørgsmål."
                    className="min-h-72"
                  />
                ) : null}
                {messages.map((message) => {
                  const text = message.parts.map((part) => part.type === "text" ? part.text : "").join("");
                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                        <MessageResponse>{text}</MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                })}
                {status === "submitted" ? <Shimmer className="text-sm">Analyserer din handlingsplan…</Shimmer> : null}
                {error ? <p className="text-sm text-destructive">Der opstod en fejl. Prøv igen.</p> : null}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          ) : (
          <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8">
            {messages.length === 0 && (
              <div className="mx-auto max-w-md py-12 text-center">
                <div className="mb-3 inline-grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <MessageSquarePlus size={20} />
                </div>
                <h2 className="font-display text-xl font-semibold">Start samtalen</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Beskriv din situation eller dit spørgsmål nedenfor — assistenten svarer
                  med kilder og konkrete forslag.
                </p>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground shadow-sm">
                      {text}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className="flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    A
                  </div>
                  <div className="prose-chat min-w-0 flex-1 text-foreground">
                    {text ? (
                      <ReactMarkdown>{text}</ReactMarkdown>
                    ) : (
                      <span className="text-sm text-muted-foreground">…</span>
                    )}
                  </div>
                </div>
              );
            })}

            {status === "submitted" && (
              <div className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  A
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" /> Tænker…
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                Der opstod en fejl. Prøv igen.
              </div>
            )}
          </div>
          )}

          {botId === "plan" ? (
            <div className="border-t border-border bg-background/50 px-4 py-3 sm:px-6">
              <PromptInput onSubmit={handlePlanSubmit} className="rounded-xl border-primary/50 bg-card shadow-sm">
                <PromptInputTextarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Stil et opfølgende spørgsmål…"
                  disabled={isLoading}
                />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit status={status} disabled={!input.trim() || isLoading} />
                </PromptInputFooter>
              </PromptInput>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">Samtalen gemmes i 1 time</p>
            </div>
          ) : (
          <form
            onSubmit={handleSubmit}
            className="border-t border-border bg-background/50 px-4 py-3 sm:px-6"
          >
            <div className="flex items-end gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as FormEvent);
                  }
                }}
                rows={1}
                placeholder="Skriv dit spørgsmål…"
                className="max-h-40 flex-1 resize-none bg-transparent py-1 text-[15px] outline-none placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send"
                className="grid h-9 w-9 place-items-center rounded-lg bg-action text-action-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Tryk Enter for at sende · Shift+Enter for ny linje · Samtaler gemmes i 1 time
            </p>
          </form>
          )}
        </main>
      </div>
    </div>
  );
}
