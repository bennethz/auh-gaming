"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormPanel, INPUT_CLASS_NAME } from "@/components/ui/form-panel";
import { Toast, useToast } from "@/components/ui/toast";

/**
 * Contact form panel.
 * Static for now: validates input and confirms locally, but does not send anything.
 * TODO: Submit through a Server Action once email delivery is set up.
 */
export function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const { message, showToast } = useToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const body = String(formData.get("message") ?? "").trim();

    if (!name || !email || !body) {
      setError("Fill in your name, email and message so we can reply.");
      return;
    }

    setError(null);
    showToast("The contact form isn’t connected yet. Message us on Discord for now.");
  };

  return (
    <>
      <FormPanel
        title="Send us a message"
        titleAs="h2"
        noValidate
        onSubmit={handleSubmit}
        className="flex-[0_1_420px]"
        data-testid="contact-form"
      >
        <Field label="Name">
          <input name="name" type="text" autoComplete="name" className={INPUT_CLASS_NAME} data-testid="contact-name" />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={INPUT_CLASS_NAME}
            data-testid="contact-email"
          />
        </Field>
        <Field label="Message">
          <textarea name="message" rows={6} className={`${INPUT_CLASS_NAME} resize-y`} data-testid="contact-message" />
        </Field>
        {error ? (
          <p role="alert" className="text-[13px] text-auh-orange" data-testid="contact-error">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="primary" className="self-start" data-testid="contact-submit">
          Send message
        </Button>
      </FormPanel>
      <Toast message={message} />
    </>
  );
}
