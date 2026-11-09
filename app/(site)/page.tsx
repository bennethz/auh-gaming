import { CurrentSeason } from "@/components/home/current-season";
import { EventPhotos } from "@/components/home/event-photos";
import { HomeHero } from "@/components/home/home-hero";
import { Partners } from "@/components/home/partners";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <CurrentSeason />
      <EventPhotos />
      <Partners />
    </>
  );
}
