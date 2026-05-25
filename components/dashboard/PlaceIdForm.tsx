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
        <Input
          id="place-id"
          value={placeId}
          onChange={(event) => onPlaceIdChange(event.target.value)}
          placeholder="Enter Google Place ID..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Fetching..." : "Fetch Reviews"}
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
    </Card>
  );
}
