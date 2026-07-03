import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { BibliographyAnalysis } from "@/lib/ai/schemas";

type Client = SupabaseClient<Database>;

/**
 * Persists a BibliographyAnalysis result onto bibliography rows, matching
 * analysis.references[].index to rows by their position in `rowIds`.
 */
export async function applyBibliographyAnalysis(
  supabase: Client,
  rowIds: string[],
  analysis: BibliographyAnalysis,
) {
  await Promise.all(
    analysis.references.map((ref) => {
      const rowId = rowIds[ref.index];
      if (!rowId) return Promise.resolve();

      return supabase
        .from("bibliography")
        .update({
          source_type: ref.sourceType,
          ai_score: ref.score,
          recommendation: ref.recommendation,
          ai_analysis: {
            issues: ref.issues,
            isDuplicate: ref.isDuplicate,
            duplicateOfIndex: ref.duplicateOfIndex,
            languageDiversity: analysis.languageDiversity,
            internationalCoverage: analysis.internationalCoverage,
            overallSuggestions: analysis.overallSuggestions,
          },
        })
        .eq("id", rowId);
    }),
  );
}
