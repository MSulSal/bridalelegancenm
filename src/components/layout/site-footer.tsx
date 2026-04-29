import { siteConfig } from "@/lib/site";
import { BrandText } from "@/components/brand/brand-text";

const footerLinks = [
	{ href: "/collections", label: "Collections" },
	{ href: "/mother-of-the-bride", label: "Mother of the Bride" },
	{ href: "/accessories", label: "Accessories" },
	{ href: "/#spotlights-preview", label: "Designer Spotlights" },
	{ href: "/#about-preview", label: "About" },
	{ href: siteConfig.appointmentHref, label: siteConfig.appointmentLabel },
] as const;

export function SiteFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className="be-footer">
			<div className="be-container pt-12 pb-[calc(6.75rem+env(safe-area-inset-bottom))] md:py-12">
				<div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
					<div className="space-y-4">
						<p className="be-kicker">
							<BrandText
								nm="Bridal Elegance NM"
								atelier="Bridal Elegance Atelier"
							/>
						</p>
						<p className="max-w-xl text-base leading-8 text-[color:var(--ink-700)]">
							<BrandText
								nm={`${siteConfig.tagline} Located in Albuquerque's Sawmill District near Historic Old Town.`}
								atelier={siteConfig.tagline}
							/>
						</p>
					</div>

					<ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-[color:var(--ink-700)]">
						{footerLinks.map(link => (
							<li key={link.href}>
								<a
									href={link.href}
									className="hover:text-[color:var(--ink-900)]"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>

					<div className="space-y-3 text-sm text-[color:var(--ink-700)]">
						<p className="be-kicker">Contact</p>
						<p>{siteConfig.showroomUpdate}</p>
						<p>
							<a
								href={siteConfig.mapsHref}
								target="_blank"
								rel="noreferrer"
								className="hover:text-[color:var(--ink-900)]"
							>
								{siteConfig.addressLine1}
								<br />
								{siteConfig.addressLine2}
							</a>
						</p>
						<p>
							<a
								href={siteConfig.phoneHref}
								className="hover:text-[color:var(--ink-900)]"
							>
								{siteConfig.phoneDisplay}
							</a>
						</p>
						<p>
							<a
								href={siteConfig.instagramHref}
								target="_blank"
								rel="noreferrer"
								className="hover:text-[color:var(--ink-900)]"
							>
								Instagram {siteConfig.instagramLabel}
							</a>
						</p>
					</div>
				</div>

				<div className="mt-10 flex flex-col gap-2 border-t border-[color:var(--line-subtle)] pt-5 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)] sm:flex-row sm:items-center sm:justify-between">
					<p>New Mexico Bridal Boutique</p>
					<p>
						(c) {year}{" "}
						<BrandText
							nm="Bridal Elegance NM"
							atelier="Bridal Elegance Atelier"
						/>
						. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
