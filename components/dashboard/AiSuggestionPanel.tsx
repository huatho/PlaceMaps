"use client";

import { Button } from "@/components/ui/Button";
import type { AiSuggestions, SuggestionTone } from "@/types/review";

interface AiSuggestionPanelProps {
  suggestions: AiSuggestions;
  selectedTone?: SuggestionTone;
  isApproved: boolean;
  onSelect: (tone: SuggestionTone) => void;
  onApprove: () => void;
}

const suggestionLabels: Record<SuggestionTone, string> = {
  standard: "Standard Reply",
  friendly: "Friendly Reply",
  recovery: "Recovery Reply"
};

export function AiSuggestionPanel({
  suggestions,
  selectedTone,
  isApproved,
  onSelect,
  onApprove
}: AiSuggestionPanelProps) {
  const tones = Object.keys(suggestionLabels) as SuggestionTone[];

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <div className="grid items-stretch gap-3 md:grid-cols-3 md:gap-4">
        {tones.map((tone) => {
          const selected = selectedTone === tone;

          return (
            <label
              key={tone}
              className={`flex min-h-36 cursor-pointer flex-col rounded-lg border p-4 text-left transition sm:min-h-44 sm:p-5 ${
                selected
                  ? "border-slate-900 bg-slate-50 ring-2 ring-slate-200"
                  : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
              } ${isApproved ? "cursor-default opacity-80" : ""}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="ai-suggestion"
                  value={tone}
                  checked={selected}
                  disabled={isApproved}
                  onChange={() => onSelect(tone)}
                  className="sr-only"
                />
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    selected ? "border-slate-900 bg-slate-900" : "border-slate-300 bg-white"
                  }`}
                  aria-hidden="true"
                >
                  {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                </span>
                <span className="text-sm font-semibold leading-6 text-slate-950 sm:text-base">
                  {suggestionLabels[tone]}
                </span>
              </div>
              <p className="mt-3 break-words text-sm leading-6 text-slate-700 sm:mt-4">{suggestions[tone]}</p>
            </label>
          );
        })}
      </div>
      <div className="mt-5 flex justify-stretch border-t border-slate-100 pt-4 sm:justify-end">
        <Button
          type="button"
          variant="success"
          onClick={onApprove}
          disabled={!selectedTone || isApproved}
          className="w-full sm:w-auto"
        >
          Approve
        </Button>
      </div>
    </div>
  );
}
