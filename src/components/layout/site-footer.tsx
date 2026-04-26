import { siteConfig } from "@/lib/site";

const footerLinks = [
	{ href: "#collections-preview", label: "Collections" },
	{ href: "#spotlights-preview", label: "Designer Spotlights" },
	{ href: "#about-preview", label: "About" },
	{ href: "#appointment-intent", label: "Book Appointment" },
] as const;

export function SiteFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className="be-footer">
			<div className="be-container py-10">
				<div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
					<div>
						<p className="be-kicker">Bridal Elegance NM</p>
						<p className="mt-3 max-w-xl text-lg text-[color:var(--ink-700)]">
							{siteConfig.tagline}
						</p>
					</div>

					<ul className="grid grid-cols-2 gap-3 text-sm text-[color:var(--ink-700)]">
						{footerLinks.map(link => (
							<li key={link.href}>
								<a
									href={link.href}
									className="hover:text-[color:var(--accent-600)]"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</div>

				<div className="mt-8 flex flex-col gap-2 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)] sm:flex-row sm:items-center sm:justify-between">
					<p>New Mexico Bridal Boutique</p>
					<p>
						(c) {year} {siteConfig.name}. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}

