import Image from "next/image";
import { BrandText } from "@/components/brand/brand-text";
import { homeContent } from "@/content/site-content";
import { SiteShell } from "@/components/layout/site-shell";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site";
import styles from "./home.module.css";

export default function HomePage() {
	const galleryStrip = homeContent.homeGallery.slice(1, 5);

	return (
		<SiteShell>
			<section className={styles.heroSection}>
				<figure className={`m-0 overflow-hidden ${styles.heroFrame}`}>
					<div className={styles.heroViewport}>
						<Image
							src="/hero-image-v6.png"
							alt="Bridal Elegance boutique hero image"
							fill
							priority
							sizes="(max-width: 639px) 320vw, (max-width: 1023px) 180vw, 100vw"
							quality={90}
							className={`object-cover ${styles.heroImage}`}
						/>

						<div className={styles.heroOverlay} />
						<figcaption className={styles.heroCaption}>
							<p className="be-kicker !text-white/80">
								{siteConfig.cityState}
							</p>
							<h1 className="mt-3 max-w-[14ch] font-[var(--font-display-serif)] text-[clamp(2.2rem,6vw,5rem)] leading-[0.95] text-white">
								<BrandText
									nm={
										<>
											Bridal Elegance{" "}
											<span className="relative -top-[0.08em] text-[0.58em] font-semibold tracking-[0.14em]">
												NM
											</span>
										</>
									}
									atelier="Bridal Elegance NM"
								/>
							</h1>
							<p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/85">
								{homeContent.hero.supportLine}
							</p>
						</figcaption>
					</div>
				</figure>
			</section>

			<ScrollReveal delayMs={70}>
				<section
					id="about-preview"
					className="be-section pt-8 md:pt-12"
				>
					<article
						className={`be-card p-5 sm:p-7 ${styles.sectionLift} ${styles.showroomCard}`}
					>
						<div className={styles.showroomCardCopy}>
							<p className="be-kicker">
								{homeContent.aboutPreview.kicker}
							</p>
							<p className="mt-3 text-sm leading-7 text-[color:var(--ink-700)]">
								{homeContent.aboutPreview.copy}
							</p>
							<p className="mt-4 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
								{siteConfig.showroomUpdate}
							</p>
							<p className="mt-3 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-900)]">
								<a
									href={siteConfig.smsHref}
									className="hover:text-[color:var(--ink-700)]"
								>
									{siteConfig.appointmentTextLine}
								</a>
							</p>
						</div>
						<div className={styles.showroomCardGallery}>
							{galleryStrip.map(image => (
								<figure
									key={image.localPath}
									className={`m-0 be-lookbook-frame ${styles.showroomCardTile}`}
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
					</article>
				</section>
			</ScrollReveal>

			<ScrollReveal delayMs={90}>
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
							<a
								key={item.title}
								href={item.href}
								target="_blank"
								rel="noreferrer"
								className={`be-card overflow-hidden ${styles.sectionLift} block`}
							>
								<div className="border-b border-[color:var(--line-subtle)]">
									<div className={styles.collectionImageFrame}>
										<Image
											src={item.image.localPath}
											alt={item.image.alt}
											fill
											sizes="(min-width: 768px) 30vw, 100vw"
											className={`object-cover ${styles.collectionImage}`}
											style={{
												objectPosition:
													item.homeImagePosition,
											}}
										/>
									</div>
								</div>
								<div className="p-6">
									<p className="be-kicker">{item.tag}</p>
									<h3 className="mt-3 text-2xl leading-tight">
										{item.title}
									</h3>
									<p className="mt-4 text-sm leading-7 text-[color:var(--ink-700)]">
										{item.copy}
									</p>
									<p className="mt-5 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-900)]">
										View Collection
									</p>
								</div>
							</a>
						))}
					</div>
				</section>
			</ScrollReveal>

			<ScrollReveal delayMs={110}>
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
						{homeContent.spotlightSection.items
							.filter(
								item =>
									(siteConfig.accessoriesEnabled ||
										item.href !== "/accessories") &&
									(siteConfig.appointmentsEnabled ||
										item.href !== "/book-appointment"),
							)
							.map(item => (
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
			</ScrollReveal>

			<ScrollReveal delayMs={130}>
				<section
					className="be-section"
					aria-labelledby="journey-heading"
				>
					<SectionHeading
						eyebrow={homeContent.journeySection.heading.eyebrow}
						title={homeContent.journeySection.heading.title}
						description={
							homeContent.journeySection.heading.description
						}
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
			</ScrollReveal>

			{siteConfig.appointmentsEnabled ? (
				<ScrollReveal delayMs={150}>
					<section id="appointment-intent" className="be-section">
						<div className="be-card p-6 sm:p-10">
							<SectionHeading
								eyebrow={
									homeContent.appointmentSection.heading.eyebrow
								}
								title={homeContent.appointmentSection.heading.title}
								description={
									homeContent.appointmentSection.heading
										.description
								}
							/>
							<ul className="mt-8 grid gap-4 sm:grid-cols-3">
								{homeContent.appointmentSection.promises.map(
									item => (
										<li
											key={item}
											className="bg-[color:var(--surface-soft)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-700)]"
										>
											{item}
										</li>
									),
								)}
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
				</ScrollReveal>
			) : null}
		</SiteShell>
	);
}
