import { OrganizerHeader } from "@/components/layout/organizer-header";

/**
 * Layout for organizer tools.
 * TODO: Gate this route group behind organizer sign-in once authentication exists.
 */
export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OrganizerHeader />
      <main className="flex-1 pb-[72px]">{children}</main>
    </>
  );
}
