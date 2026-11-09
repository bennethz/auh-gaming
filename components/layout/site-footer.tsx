import { BrandLogo } from "@/components/ui/brand-logo";
import { COMMUNITY } from "@/lib/league/sample-data";

const COPYRIGHT_YEAR = 2026;

/** Navy footer with the logo, copyright and community tagline. */
export function SiteFooter() {
  return (
    <footer className="mt-[72px] bg-auh-ink text-sm text-auh-cream-dim" data-testid="site-footer">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-4 px-5 py-6">
        <BrandLogo size="footer" />
        <div className="flex flex-col gap-1">
          <p className="text-auh-cream" data-testid="footer-copyright">
            © {COPYRIGHT_YEAR} AUH Gaming
          </p>
          <p data-testid="footer-tagline">{COMMUNITY.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
