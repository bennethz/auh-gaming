import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const PHOTO_SLOT_COUNT = 6;

/**
 * Grid of photos from past events.
 * TODO: Replace the slots with `next/image` tiles once event photos are supplied.
 */
export function EventPhotos() {
  return (
    <section aria-labelledby="event-photos-title" data-testid="event-photos">
      <Container className="pt-[72px] pb-6">
        <SectionHeading id="event-photos-title" title="From past events" />
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5">
          {Array.from({ length: PHOTO_SLOT_COUNT }, (_, index) => (
            <li
              key={index}
              role="img"
              aria-label="Event photo placeholder"
              className="notch flex aspect-[4/3] items-center justify-center bg-auh-ink text-sm text-auh-cream-dim"
              data-testid="event-photo"
            >
              Event photo
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
