import Image from "next/image";
import { BrandText } from "@/components/brand/brand-text";
import { ShowroomGalleryLightbox } from "@/components/home/showroom-gallery-lightbox";
import { homeContent } from "@/content/site-content";
import { SiteShell } from "@/components/layout/site-shell";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site";
import styles from "./home.module.css";

export default function HomePage() {
	const galleryStrip = homeContent.showroomGallery;

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
											<span className="font-semibold tracking-[0.08em]">
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
							<p className="mt-3 text-sm leading-7 text-[color:var(--ink-700)]">
								<span>Accepting appointments 7 days a week.</span>
								<span className="block">
									Text{" "}
									<a
										href={siteConfig.smsHref}
										className="text-[color:var(--ink-900)] hover:text-[color:var(--ink-700)]"
									>
										{siteConfig.phoneDisplay}
									</a>{" "}
									to book your appointment.
								</span>
							</p>
						</div>
						<ShowroomGalleryLightbox images={galleryStrip} />
					</article>
				</section>
			</ScrollReveal>

			<ScrollReveal delayMs={80}>
				<section className="be-section py-8 md:py-10">
					<div className="border-y border-[color:var(--line-subtle)] py-7 sm:flex sm:items-center sm:justify-between sm:gap-8">
						<div>
							<p className="be-kicker">A Faster Timeline</p>
							<h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
								Quick Ship wedding dresses
							</h2>
							<p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--ink-700)]">
								Need a gown sooner? Ask us about Quick Ship options and
								current availability.
							</p>
						</div>
						<a
							href={siteConfig.quickShipHref}
							className="be-btn be-btn-ghost mt-5 shrink-0 sm:mt-0"
						>
							Explore Quick Ship
						</a>
					</div>
				</section>
			</ScrollReveal>

			<ScrollReveal delayMs={90}>
				<section id="collections-preview" className="be-section">
					<SectionHeading
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
												transform: item.homeImageScale
													? `scale(${item.homeImageScale})`
													: undefined,
											}}
										/>
									</div>
								</div>
								<div className="p-6">
									<h3 className="text-2xl leading-tight">
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
