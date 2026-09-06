import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
	title: "Quick Ship Wedding Dresses in Albuquerque",
	description:
		"Need a wedding dress on a shorter timeline? Bridal Elegance NM offers Quick Ship wedding dress options in Albuquerque. Text (505) 830-2110 for availability.",
	alternates: {
		canonical: "/quick-ship-wedding-dresses",
	},
};

const quickShipJsonLd = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: [
		{
			"@type": "Question",
			name: "Does Bridal Elegance NM offer Quick Ship wedding dresses?",
			acceptedAnswer: {
				"@type": "Answer",
				text: "Yes. Bridal Elegance NM offers Quick Ship wedding dress options. Text (505) 830-2110 to ask about current availability, sizing, styles, and timing.",
			},
		},
		{
			"@type": "Question",
			name: "How do I ask about Quick Ship wedding dresses in Albuquerque?",
			acceptedAnswer: {
				"@type": "Answer",
				text: "Text Bridal Elegance NM at (505) 830-2110. The boutique will help you understand current Quick Ship options for your wedding date and style direction.",
			},
		},
	],
};

export default function QuickShipWeddingDressesPage() {
	return (
		<SiteShell>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(quickShipJsonLd).replace(
						/</g,
						"\\u003c",
					),
				}}
			/>
			<section className="be-section">
				<SectionHeading
					eyebrow="Bridal Elegance NM | Albuquerque, New Mexico"
					title="Quick Ship Wedding Dresses"
					description="For brides working with a shorter timeline, Bridal Elegance NM offers Quick Ship wedding dress options."
				/>

				<div className="mt-10 grid gap-10 border-t border-[color:var(--line-subtle)] pt-8 md:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.65fr)] md:gap-16">
					<div className="space-y-5 text-[color:var(--ink-700)]">
						<p className="be-body">
							Wedding timelines can move quickly. If you are looking for a
							faster gown option, text our Albuquerque bridal boutique to
							ask about Quick Ship dresses.
						</p>
						<p className="be-body">
							Quick Ship availability, sizing, styles, and timing can vary
							by gown. We will help you understand the current options for
							your wedding date and style direction.
						</p>
					</div>

					<aside className="border-l-2 border-[color:var(--accent-500)] pl-6">
						<p className="be-kicker">Ask About Availability</p>
						<p className="mt-3 text-xl leading-snug">
							Text us to discuss Quick Ship wedding dress options.
						</p>
						<a
							href={siteConfig.smsHref}
							className="be-btn be-btn-primary mt-6"
						>
							Text {siteConfig.phoneDisplay}
						</a>
					</aside>
				</div>
			</section>
		</SiteShell>
	);
}
