"use client";

import { Plus, Trash2, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Chat = Database["public"]["Tables"]["ai_chats"]["Row"];

const MODE_LABELS: Record<string, string> = {
  research_assistant: "Research Assistant",
  man_expert: "МАН Expert",
};

export function ChatSidebar({
  chats,
  selectedChatId,
  onSelect,
  onNew,
  onDelete,
}: {
  chats: Chat[];
  selectedChatId: string | null;
  onSelect: (chatId: string) => void;
  onNew: () => void;
  onDelete: (chatId: string) => void;
}) {
  return (
    <div className="flex h-full w-full flex-col md:w-64 md:shrink-0 md:border-r md:border-border/60">
      <div className="p-3">
        <Button variant="outline" className="w-full" onClick={onNew}>
          <Plus className="size-4" />
          New chat
        </Button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <p className="p-3 text-center text-xs text-muted-foreground">
            No conversations yet.
          </p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg px-2 py-1.5",
                selectedChatId === chat.id ? "bg-accent" : "hover:bg-accent/60",
              )}
            >
              <button
                onClick={() => onSelect(chat.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <MessagesSquare className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">
                    {chat.title || "New conversation"}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {MODE_LABELS[chat.mode] ?? chat.mode}
                  </span>
                </span>
              </button>
              <button
                onClick={() => onDelete(chat.id)}
                aria-label="Delete chat"
                className="shrink-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
