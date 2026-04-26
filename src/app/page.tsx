import Image from "next/image";
import { homeContent } from "@/content/site-content";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
	return (
		<SiteShell>
			<section className="be-section pt-12 md:pt-20">
				<div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
					<div>
						<p className="be-kicker">{siteConfig.cityState}</p>
						<h1 className="be-display mt-3">
							{homeContent.hero.title}
						</h1>
						<p className="be-body mt-5">
							{homeContent.hero.description}
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
								{homeContent.hero.secondaryCtaLabel}
							</a>
						</div>
					</div>

					<aside className="grid gap-4" id="about-preview">
						<article className="be-card p-5 sm:p-7">
							<div className="flex items-center gap-4">
								<Image
									src="/logo-notext.png"
									alt=""
									width={72}
									height={72}
									className="h-14 w-14 border border-[color:var(--line-subtle)] bg-white p-2"
								/>
								<div>
									<p className="be-kicker">
										{homeContent.aboutPreview.kicker}
									</p>
									<p className="mt-2 text-sm leading-7 text-[color:var(--ink-700)]">
										{homeContent.aboutPreview.copy}
									</p>
								</div>
							</div>
						</article>

						<div className="grid grid-cols-3 gap-3">
							<div className="be-lookbook-frame" />
							<div className="be-lookbook-frame" />
							<div className="be-lookbook-frame" />
						</div>
					</aside>
				</div>
			</section>

			<section id="collections-preview" className="be-section">
				<SectionHeading
					eyebrow={homeContent.collectionSection.heading.eyebrow}
					title={homeContent.collectionSection.heading.title}
					description={
						homeContent.collectionSection.heading.description
					}
				/>
				<div className="mt-9 grid gap-5 md:grid-cols-3">
					{homeContent.collectionSection.items.map(item => (
						<article key={item.title} className="be-card p-6">
							<p className="be-kicker">{item.tag}</p>
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

			<section
				id="spotlights-preview"
				className="be-section border-y border-[color:var(--line-subtle)]"
			>
				<SectionHeading
					eyebrow={homeContent.spotlightSection.heading.eyebrow}
					title={homeContent.spotlightSection.heading.title}
					description={
						homeContent.spotlightSection.heading.description
					}
				/>
				<div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{homeContent.spotlightSection.items.map(item => (
						<article key={item.title} className="be-card p-6">
							<p className="be-kicker">Spotlight</p>
							<h3 className="mt-3 text-2xl leading-tight">
								{item.title}
							</h3>
							<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
								{item.copy}
							</p>
							<a
								href={siteConfig.appointmentHref}
								className="mt-5 inline-block text-xs uppercase tracking-[0.14em] text-[color:var(--ink-900)]"
							>
								{homeContent.spotlightSection.ctaLabel}
							</a>
						</article>
					))}
				</div>
			</section>

			<section className="be-section" aria-labelledby="journey-heading">
				<SectionHeading
					eyebrow={homeContent.journeySection.heading.eyebrow}
					title={homeContent.journeySection.heading.title}
					description={homeContent.journeySection.heading.description}
				/>
				<ol className="mt-9 grid gap-4 md:grid-cols-2">
					{homeContent.journeySection.steps.map(item => (
						<li key={item.step} className="be-card p-6">
							<p className="text-xs uppercase tracking-[0.16em] text-[color:var(--ink-500)]">
								Step {item.step}
							</p>
							<h3 className="mt-3 text-2xl leading-tight">
								{item.title}
							</h3>
							<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
								{item.body}
							</p>
						</li>
					))}
				</ol>
			</section>

			<section id="appointment-intent" className="be-section">
				<div className="be-card p-6 sm:p-10">
					<SectionHeading
						eyebrow={homeContent.appointmentSection.heading.eyebrow}
						title={homeContent.appointmentSection.heading.title}
						description={
							homeContent.appointmentSection.heading.description
						}
					/>
					<ul className="mt-8 grid gap-4 sm:grid-cols-3">
						{homeContent.appointmentSection.promises.map(item => (
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
