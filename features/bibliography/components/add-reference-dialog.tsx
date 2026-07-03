"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddReferenceDialog({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceText, setReferenceText] = useState("");

  async function handleAdd() {
    setIsSubmitting(true);

    const response = await fetch("/api/bibliography", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, referenceText }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      toast.error(body?.error?.message ?? "Could not add reference.");
      return;
    }

    setOpen(false);
    setReferenceText("");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          Add reference
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>Add a reference</DialogTitle>
        </DialogHeader>
        <div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
          <Label htmlFor="referenceText">Reference</Label>
          <Textarea
            id="referenceText"
            rows={3}
            value={referenceText}
            onChange={(e) => setReferenceText(e.target.value)}
            placeholder="Smith, J. (2020). Title of the paper. Journal Name."
          />
        </div>
        <DialogFooter className="shrink-0 mx-0 mb-0 rounded-b-xl border-t bg-muted/50 px-6 py-4">
          <Button
            onClick={handleAdd}
            disabled={isSubmitting || referenceText.trim().length < 10}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
