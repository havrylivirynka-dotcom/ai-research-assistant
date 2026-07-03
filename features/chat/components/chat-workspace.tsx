"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, PanelLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ChatSidebar } from "./chat-sidebar";
import { MessageBubble, type ChatMessage } from "./message-bubble";
import type { Database } from "@/types/database";

type Chat = Database["public"]["Tables"]["ai_chats"]["Row"];
type ChatMode = "research_assistant" | "man_expert";

const SUGGESTED_PROMPTS = [
  "Explain methodology",
  "Improve introduction",
  "Check bibliography",
  "Explain МАН rules",
];

export function ChatWorkspace({
  projectId,
  initialChats,
}: {
  projectId: string;
  initialChats: Chat[];
}) {
  const [chats, setChats] = useState(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    initialChats[0]?.id ?? null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ChatMode>("research_assistant");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    fetch(`/api/chat?chatId=${selectedChatId}`)
      .then((res) => res.json())
      .then((body) => {
        setMessages(
          (body.messages ?? []).map((m: ChatMessage & { citations: unknown }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: m.citations,
          })),
        );
      })
      .finally(() => setIsLoadingMessages(false));
  }, [selectedChatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function handleNewChat() {
    setSelectedChatId(null);
    setMessages([]);
  }

  async function handleDeleteChat(chatId: string) {
    const response = await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Could not delete this chat.");
      return;
    }
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
      setMessages([]);
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setInput("");
    setIsSending(true);

    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const assistantMessage: ChatMessage = {
      id: `temp-assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        chatId: selectedChatId,
        mode,
        message: trimmed,
      }),
    });

    if (!response.ok || !response.body) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? "The AI response failed.");
      setIsSending(false);
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let newChatId = selectedChatId;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);

        if (event.type === "delta") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: m.content + event.text }
                : m,
            ),
          );
        } else if (event.type === "done") {
          newChatId = event.chatId;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, id: event.messageId, citations: event.citations }
                : m,
            ),
          );
        } else if (event.type === "error") {
          toast.error(event.message);
        }
      }
    }

    setIsSending(false);

    if (newChatId && newChatId !== selectedChatId) {
      setSelectedChatId(newChatId);
      const refreshed = await fetch(`/api/chat?projectId=${projectId}`).then(
        (res) => res.json(),
      );
      setChats(refreshed.chats ?? []);
    }
  }

  function selectChat(chatId: string) {
    setSelectedChatId(chatId);
    setIsSidebarOpen(false);
  }

  function newChat() {
    handleNewChat();
    setIsSidebarOpen(false);
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border/60">
      <div className="hidden md:flex">
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onSelect={selectChat}
          onNew={newChat}
          onDelete={handleDeleteChat}
        />
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Conversations</SheetTitle>
          <ChatSidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onSelect={selectChat}
            onNew={newChat}
            onDelete={handleDeleteChat}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center border-b border-border/60 p-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Show conversations"
            onClick={() => setIsSidebarOpen(true)}
          >
            <PanelLeft className="size-4" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {isLoadingMessages ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-sm text-muted-foreground">
                Ask about methodology, structure, citations, or МАН rules.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-end gap-2 border-t border-border/60 p-3"
        >
          {!selectedChatId && (
            <Select value={mode} onValueChange={(v) => setMode(v as ChatMode)}>
              <SelectTrigger className="w-44 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="research_assistant">
                  Research Assistant
                </SelectItem>
                <SelectItem value="man_expert">МАН Expert</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask a question..."
            rows={1}
            className="max-h-32 min-h-10 flex-1 resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !input.trim()}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
