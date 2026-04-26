import { siteConfig } from "@/lib/site";

const footerLinks = [
	{ href: "/gallery", label: "Gallery" },
	{ href: "/#collections-preview", label: "Collections" },
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
						<p className="be-kicker">Bridal Elegance NM</p>
						<p className="max-w-xl text-base leading-8 text-[color:var(--ink-700)]">
							{siteConfig.tagline}
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
						(c) {year} {siteConfig.name}. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
