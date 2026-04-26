import Image from "next/image";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site";

const collectionHighlights = [
	{
		title: "Romantic Classics",
		copy: "Timeless silhouettes with modern shaping for elegant bridal portraits.",
	},
	{
		title: "Contemporary Minimal",
		copy: "Sculptural gowns with clean lines and couture-level fabric movement.",
	},
	{
		title: "Statement Glamour",
		copy: "High-impact detailing for brides who want unforgettable entrance energy.",
	},
] as const;

const spotlightTeasers = [
	{
		title: "Silhouette Spotlight",
		copy: "How to choose a shape that complements venue, movement, and comfort.",
	},
	{
		title: "Fabric Spotlight",
		copy: "Texture, drape, and sheen explained in a bride-friendly editorial format.",
	},
	{
		title: "Styling Spotlight",
		copy: "How veil, accessories, and neckline decisions create a cohesive bridal look.",
	},
] as const;

const appointmentPromises = [
	"One-on-one boutique guidance from first try-on to final direction.",
	"Clear, calm appointment pacing that feels premium from minute one.",
	"Personalized recommendations aligned to style, timeline, and vision.",
] as const;

export default function HomePage() {
	return (
		<SiteShell>
			<section className="be-section pt-12 md:pt-20">
				<div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
					<div>
						<p className="be-kicker">{siteConfig.cityState}</p>
						<h1 className="be-display mt-3">
							Bridal Boutique Design That Feels Editorial,
							Personal, And Luxurious.
						</h1>
						<p className="be-body mt-5">
							Inspired by top bridal experiences without copying
							them, this direction prioritizes couture atmosphere,
							image-led storytelling, and strong appointment
							conversion.
						</p>
						<div className="mt-7 flex flex-wrap gap-3">
							<a
								href={siteConfig.appointmentHref}
								className="be-btn be-btn-primary"
							>
								{siteConfig.appointmentLabel}
							</a>
							<a
								href="#collections-preview"
								className="be-btn be-btn-ghost"
							>
								View Style Direction
							</a>
						</div>
					</div>

					<aside className="be-card p-5 sm:p-7" id="about-preview">
						<div className="border border-[color:var(--line-subtle)] bg-[color:var(--surface-soft)] p-6">
							<Image
								src="/logo-notext.png"
								alt=""
								width={84}
								height={84}
								className="h-16 w-16 border border-[color:var(--line-subtle)] bg-white p-2"
							/>
							<p className="be-kicker mt-6">
								Showroom Experience
							</p>
							<h2 className="mt-3 text-3xl leading-tight">
								Classy, Calm, Appointment-First Bridal Service
							</h2>
							<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
								Every digital touchpoint should make booking
								feel like the obvious next step, not an
								afterthought.
							</p>
						</div>
					</aside>
				</div>
			</section>

			<section id="collections-preview" className="be-section">
				<SectionHeading
					eyebrow="Collections Direction"
					title="A Premium Browsing Feel, Not A Generic Local Brochure"
					description="These category blocks establish the visual rhythm for future collection and designer pages."
				/>
				<div className="mt-9 grid gap-5 md:grid-cols-3">
					{collectionHighlights.map(item => (
						<article key={item.title} className="be-card p-6">
							<h3 className="text-2xl leading-tight">
								{item.title}
							</h3>
							<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
								{item.copy}
							</p>
						</article>
					))}
				</div>
			</section>

			<section id="spotlights-preview" className="be-section">
				<SectionHeading
					eyebrow="Editorial Strategy"
					title="Designer Spotlights Built For Bridal SEO + Storytelling"
					description="Content architecture mirrors premium bridal editorial patterns while staying fully original."
				/>
				<div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{spotlightTeasers.map(item => (
						<article key={item.title} className="be-card p-6">
							<p className="be-kicker">Spotlight</p>
							<h3 className="mt-3 text-2xl leading-tight">
								{item.title}
							</h3>
							<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
								{item.copy}
							</p>
						</article>
					))}
				</div>
			</section>

			<section id="appointment-intent" className="be-section">
				<div className="be-card p-6 sm:p-10">
					<SectionHeading
						eyebrow="Appointment Conversion"
						title="Make Booking Feel Premium From The First Click"
						description="Request-based booking now, with controlled slot-based booking to follow."
					/>
					<ul className="mt-8 grid gap-4 sm:grid-cols-3">
						{appointmentPromises.map(item => (
							<li
								key={item}
								className="bg-[color:var(--surface-soft)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-700)]"
							>
								{item}
							</li>
						))}
					</ul>
					<div className="mt-8">
						<a
							href={siteConfig.appointmentHref}
							className="be-btn be-btn-primary"
						>
							{siteConfig.appointmentLabel}
						</a>
					</div>
				</div>
			</section>
		</SiteShell>
	);
}
