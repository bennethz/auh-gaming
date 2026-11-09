"use client";

import { type FormEvent, type ReactNode, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormPanel, INPUT_CLASS_NAME } from "@/components/ui/form-panel";

/**
 * Static organizer access code.
 * NOT real security: it ships in the client bundle and anyone can read it.
 * TODO: Replace with organizer sign-in once authentication exists.
 */
const ORGANIZER_ACCESS_CODE = "tomato";

const STORAGE_KEY = "auh-organizer-unlocked";

/** In-memory fallback for when sessionStorage is blocked (private mode, disabled site data). */
let isUnlockedInMemory = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readIsUnlocked(): boolean {
  if (isUnlockedInMemory) return true;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function unlock(): void {
  isUnlockedInMemory = true;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Storage unavailable: the in-memory flag keeps the page unlocked until reload.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Hides organizer tools behind a static access code.
 * Stays unlocked for the browser tab session after the correct code is entered.
 */
export function AccessCodeGate({ children }: { children: ReactNode }) {
  const isUnlocked = useSyncExternalStore(subscribe, readIsUnlocked, () => false);
  const [error, setError] = useState<string | null>(null);

  if (isUnlocked) return children;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("accessCode") ?? "").trim().toLowerCase();

    if (code !== ORGANIZER_ACCESS_CODE) {
      setError("That code isn’t right. Ask a league organizer for the access code.");
      return;
    }
    setError(null);
    unlock();
  };

  return (
    <FormPanel
      title="Organizer access"
      noValidate
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[420px]"
      data-testid="access-code-form"
    >
      <p className="text-[15px] text-auh-cream-dim">Enter the access code to manage the league.</p>
      <Field label="Access code">
        <input
          type="password"
          name="accessCode"
          autoComplete="off"
          autoFocus
          aria-invalid={error ? true : undefined}
          className={INPUT_CLASS_NAME}
          data-testid="access-code-input"
        />
      </Field>
      {error ? (
        <p role="alert" className="text-[13px] text-auh-orange" data-testid="access-code-error">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" className="mt-1 w-full" data-testid="access-code-submit">
        Unlock
      </Button>
    </FormPanel>
  );
}
