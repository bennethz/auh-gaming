import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const PARTNER_SLOT_COUNT = 4;

/**
 * Partner and sponsor logos on light cards.
 * TODO: Replace the slots with partner and sponsor names, logos and links once supplied.
 */
export function Partners() {
  return (
    <section aria-labelledby="partners-title" data-testid="partners">
      <Container className="pt-[72px] pb-6">
        <SectionHeading id="partners-title" title="Partners and Sponsors" />
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5">
          {Array.from({ length: PARTNER_SLOT_COUNT }, (_, index) => (
            <li
              key={index}
              role="img"
              aria-label="Partner logo placeholder"
              className="notch flex h-[110px] items-center justify-center border-3 border-auh-ink bg-auh-paper text-sm font-semibold"
              data-testid="partner-logo"
            >
              Partner logo
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
