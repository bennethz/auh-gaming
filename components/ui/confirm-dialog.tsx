"use client";

import type { ReactNode, Ref } from "react";
import { Button } from "./button";

interface ConfirmDialogProps {
  ref: Ref<HTMLDialogElement>;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  "data-testid"?: string;
}

/**
 * Modal asking the user to confirm an action that can't be easily undone.
 * Uses the native `<dialog>`: the parent opens it with `showModal()`; Escape or Cancel closes it.
 * Focus starts on Cancel so a stray Enter doesn't confirm.
 */
export function ConfirmDialog({ ref, title, children, confirmLabel, onConfirm, ...rest }: ConfirmDialogProps) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      className="notch m-auto w-[calc(100%-32px)] max-w-[460px] bg-auh-ink p-0 text-auh-cream backdrop:bg-auh-ink/70"
      data-testid={rest["data-testid"]}
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id="confirm-dialog-title" className="font-display text-[32px] leading-none text-auh-yellow">
          {title}
        </h2>
        <div className="flex flex-col gap-2 text-[15px] leading-[1.5]">{children}</div>
        <div className="mt-1 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={(event) => event.currentTarget.closest("dialog")?.close()}
            className="min-h-11 border-2 border-auh-cream-dim px-4 font-display text-xl leading-none focus-visible:outline-3 focus-visible:outline-auh-orange"
            data-testid="confirm-cancel"
          >
            Cancel
          </button>
          <Button variant="primary" onClick={onConfirm} data-testid="confirm-accept">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
