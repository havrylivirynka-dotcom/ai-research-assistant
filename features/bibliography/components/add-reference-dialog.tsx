"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("addReferenceDialog");
  const tCommon = useTranslations("common");
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
      toast.error(body?.error?.message ?? t("errorFallback"));
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
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
          <Label htmlFor="referenceText">{t("referenceLabel")}</Label>
          <Textarea
            id="referenceText"
            rows={3}
            value={referenceText}
            onChange={(e) => setReferenceText(e.target.value)}
            placeholder={t("referencePlaceholder")}
          />
        </div>
        <DialogFooter className="shrink-0 mx-0 mb-0 rounded-b-xl border-t bg-muted/50 px-6 py-4">
          <Button
            onClick={handleAdd}
            disabled={isSubmitting || referenceText.trim().length < 10}
          >
            {isSubmitting ? tCommon("adding") : tCommon("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
