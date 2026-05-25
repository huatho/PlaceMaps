"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { FormEvent } from "react";

interface PlaceIdFormProps {
  placeId: string;
  isLoading: boolean;
  error?: string;
  onPlaceIdChange: (value: string) => void;
  onSubmit: () => void;
}

export function PlaceIdForm({ placeId, isLoading, error, onPlaceIdChange, onSubmit }: PlaceIdFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Card as="form" onSubmit={handleSubmit} className="p-4 sm:p-5">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="sr-only" htmlFor="place-id">
          Google Place ID
        </label>
        <div className="relative flex-1">
          <Input
            id="place-id"
            value={placeId}
            onChange={(event) => onPlaceIdChange(event.target.value)}
            placeholder="Enter Google Place ID..."
            className="w-full pr-10"
            disabled={isLoading}
          />
          {placeId && !isLoading ? (
            <button
              type="button"
              aria-label="Clear Google Place ID"
              onClick={() => onPlaceIdChange("")}
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              &times;
            </button>
          ) : null}
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Fetching..." : "Fetch Reviews"}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
    </Card>
  );
}
