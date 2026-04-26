import Image from "next/image";
import { homeContent } from "@/content/site-content";
import { SiteShell } from "@/components/layout/site-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site";
import styles from "./home.module.css";

export default function HomePage() {
	const galleryStrip = homeContent.homeGallery.slice(1, 5);

	return (
		<SiteShell>
			<section
				className={`${styles.heroSection} ${styles.reveal} ${styles.delay0}`}
			>
				<figure
					className={`m-0 be-card overflow-hidden ${styles.heroFrame}`}
				>
					<div className={styles.heroViewport}>
						<Image
							src="/hero-image.png"
							alt="Bridal Elegance boutique hero image"
							fill
							priority
							sizes="100vw"
							className={`object-cover ${styles.heroImage}`}
						/>
						<div className={styles.heroOverlay} />
						<figcaption className={styles.heroCaption}>
							<p className="be-kicker !text-white/80">
								{siteConfig.cityState}
							</p>
							<h1 className="mt-3 max-w-[14ch] font-[var(--font-display-serif)] text-[clamp(2.2rem,6vw,5rem)] leading-[0.95] text-white">
								{homeContent.hero.title}
							</h1>
							<p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/85">
								{homeContent.hero.supportLine}
							</p>
							<p
								className={`mt-5 text-sm leading-7 text-white/92 sm:text-base ${styles.heroDescription}`}
							>
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
									className={`be-btn ${styles.heroGhostButton}`}
								>
									{homeContent.hero.secondaryCtaLabel}
								</a>
							</div>
						</figcaption>
					</div>
				</figure>
			</section>

			<section
				id="about-preview"
				className={`be-section pt-8 md:pt-12 ${styles.reveal} ${styles.delay1}`}
			>
				<div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
					<article
						className={`be-card p-5 sm:p-7 ${styles.sectionLift}`}
					>
						<p className="be-kicker">
							{homeContent.aboutPreview.kicker}
						</p>
						<p className="mt-3 text-sm leading-7 text-[color:var(--ink-700)]">
							{homeContent.aboutPreview.copy}
						</p>
						<p className="mt-4 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
							{siteConfig.showroomUpdate}
						</p>
					</article>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						{galleryStrip.map(image => (
							<figure
								key={image.localPath}
								className={`m-0 be-lookbook-frame ${styles.sectionLift}`}
							>
								<Image
									src={image.localPath}
									alt={image.alt}
									fill
									sizes="(min-width: 640px) 22vw, 46vw"
									className="object-cover"
								/>
							</figure>
						))}
					</div>
				</div>
			</section>

			<section
				id="collections-preview"
				className={`be-section ${styles.reveal} ${styles.delay2}`}
			>
				<SectionHeading
					eyebrow={homeContent.collectionSection.heading.eyebrow}
					title={homeContent.collectionSection.heading.title}
					description={
						homeContent.collectionSection.heading.description
					}
				/>
				<div className="mt-9 grid gap-5 md:grid-cols-3">
					{homeContent.collectionSection.items.map(item => (
						<article
							key={item.title}
							className={`be-card overflow-hidden ${styles.sectionLift}`}
						>
							<div className="border-b border-[color:var(--line-subtle)]">
								<Image
									src={item.image.localPath}
									alt={item.image.alt}
									width={1200}
									height={1800}
									sizes="(min-width: 768px) 30vw, 100vw"
									className="block h-auto w-full"
								/>
							</div>
							<div className="p-6">
								<p className="be-kicker">{item.tag}</p>
								<h3 className="mt-3 text-2xl leading-tight">
									{item.title}
								</h3>
								<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
									{item.copy}
								</p>
								<a
									href={item.href}
									target="_blank"
									rel="noreferrer"
									className="mt-5 inline-block text-xs uppercase tracking-[0.14em] text-[color:var(--ink-900)]"
								>
									Find out more
								</a>
							</div>
						</article>
					))}
				</div>
			</section>

			<section
				id="spotlights-preview"
				className={`be-section border-y border-[color:var(--line-subtle)] ${styles.reveal} ${styles.delay3}`}
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
						<article
							key={item.title}
							className={`be-card overflow-hidden ${styles.sectionLift}`}
						>
							<div className="border-b border-[color:var(--line-subtle)]">
								<Image
									src={item.image.localPath}
									alt={item.image.alt}
									width={1200}
									height={1800}
									sizes="(min-width: 768px) 30vw, 100vw"
									className="block h-auto w-full"
								/>
							</div>
							<div className="p-6">
								<p className="be-kicker">Category</p>
								<h3 className="mt-3 text-2xl leading-tight">
									{item.title}
								</h3>
								<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
									{item.copy}
								</p>
								<a
									href={item.href}
									target={
										item.href.startsWith("http")
											? "_blank"
											: undefined
									}
									rel={
										item.href.startsWith("http")
											? "noreferrer"
											: undefined
									}
									className="mt-5 inline-block text-xs uppercase tracking-[0.14em] text-[color:var(--ink-900)]"
								>
									{item.ctaLabel}
								</a>
							</div>
						</article>
					))}
				</div>
			</section>

			<section
				className={`be-section ${styles.reveal} ${styles.delay4}`}
				aria-labelledby="journey-heading"
			>
				<SectionHeading
					eyebrow={homeContent.journeySection.heading.eyebrow}
					title={homeContent.journeySection.heading.title}
					description={homeContent.journeySection.heading.description}
				/>
				<ol className="mt-9 grid gap-4 md:grid-cols-2">
					{homeContent.journeySection.steps.map(item => (
						<li
							key={item.step}
							className={`be-card p-6 ${styles.sectionLift}`}
						>
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

			<section
				id="appointment-intent"
				className={`be-section ${styles.reveal} ${styles.delay5}`}
			>
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
