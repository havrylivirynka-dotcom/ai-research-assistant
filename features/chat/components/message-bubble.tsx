"use client";

import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ChatCitation = { documentTitle: string; sectionRef: string | null };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: ChatCitation[] | null;
};

export function MessageBubble({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function handleCopy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "group max-w-2xl space-y-2 rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">
          {message.content || "…"}
        </p>

        {message.citations && message.citations.length > 0 && (
          <div className="space-y-1 border-t border-border/40 pt-2">
            {message.citations.map((citation, index) => (
              <p
                key={index}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <FileText className="size-3 shrink-0" />
                {citation.documentTitle}
                {citation.sectionRef ? ` — Section ${citation.sectionRef}` : ""}
              </p>
            ))}
          </div>
        )}

        {!isUser && message.content && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Copy response"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
