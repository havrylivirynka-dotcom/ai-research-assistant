"use client";

import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SearchFilters as SearchFiltersState } from "@/types/search";

type FiltersValue = Omit<SearchFiltersState, "query" | "page" | "pageSize">;

export function SearchFiltersPopover({
  value,
  onChange,
}: {
  value: FiltersValue;
  onChange: (next: FiltersValue) => void;
}) {
  const t = useTranslations("filters");
  const activeCount = Object.values(value).filter(
    (v) => v !== undefined && v !== "",
  ).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal className="size-4" />
          {t("trigger")}
          {activeCount > 0 && (
            <span className="ml-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4" align="end">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="yearFrom">{t("yearFrom")}</Label>
            <Input
              id="yearFrom"
              type="number"
              placeholder="2015"
              value={value.yearFrom ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  yearFrom: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yearTo">{t("yearTo")}</Label>
            <Input
              id="yearTo"
              type="number"
              placeholder="2026"
              value={value.yearTo ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  yearTo: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minCitations">{t("minCitations")}</Label>
          <Input
            id="minCitations"
            type="number"
            min={0}
            placeholder="0"
            value={value.minCitations ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                minCitations: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="language">{t("language")}</Label>
          <Input
            id="language"
            placeholder="en"
            value={value.language ?? ""}
            onChange={(e) =>
              onChange({ ...value, language: e.target.value || undefined })
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="openAccess"
            checked={value.openAccess ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...value, openAccess: checked === true })
            }
          />
          <Label htmlFor="openAccess" className="font-normal">
            {t("openAccessOnly")}
          </Label>
        </div>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => onChange({})}
          >
            {t("clear")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
