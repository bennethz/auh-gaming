import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { ExternalButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DISCORD_INVITE_URL } from "@/lib/league/sample-data";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with AUH Gaming, Abu Dhabi’s Dota 2 community.",
};

export default function ContactPage() {
  return (
    <section aria-labelledby="contact-title" data-testid="contact-page">
      <Container className="flex flex-wrap items-start gap-x-12 gap-y-8 pt-12">
        <div className="flex flex-[1_1_360px] flex-col gap-4">
          <h1 id="contact-title" className="font-display text-[clamp(48px,7vw,92px)] leading-[0.88] font-semibold">
            Contact Us
          </h1>
          <p className="max-w-[46ch] text-lg leading-[1.55] text-auh-olive">
            Questions about Civil War, sponsorships or events? Send us a message. For the fastest reply, find an
            organizer on Discord.
          </p>
          <ExternalButtonLink
            href={DISCORD_INVITE_URL}
            variant="ghost"
            className="self-start"
            data-testid="contact-discord-link"
          >
            Message us on Discord
          </ExternalButtonLink>
        </div>
        <ContactForm />
      </Container>
    </section>
  );
}
