import type { Metadata } from "next";
import Image from "next/image";
import { galleryPageContent } from "@/content/gallery-content";
import { SiteShell } from "@/components/layout/site-shell";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
	title: galleryPageContent.metadata.title,
	description: galleryPageContent.metadata.description,
};

export default function GalleryPage() {
	const [leadImage, ...stripImages] = galleryPageContent.hero.images;

	return (
		<SiteShell>
			<section className={styles.heroSection}>
				<figure className={`be-card ${styles.heroFrame}`}>
					<div className={styles.heroViewport}>
						<Image
							src={leadImage.localPath}
							alt={leadImage.alt}
							fill
							priority
							quality={95}
							sizes="100vw"
							className={`object-cover ${styles.heroImage}`}
						/>
						<div className={styles.heroOverlay} />
						<figcaption className={styles.heroContent}>
							<p className="be-kicker !text-white/82">
								{galleryPageContent.hero.eyebrow}
							</p>
							<h1 className="mt-3 max-w-[14ch] font-[var(--font-display-serif)] text-[clamp(2.15rem,5.8vw,4.6rem)] leading-[0.97] text-white">
								{galleryPageContent.hero.title}
							</h1>
							<p
								className={`mt-4 text-sm leading-7 text-white/92 sm:text-base ${styles.heroDescription}`}
							>
								{galleryPageContent.hero.description}
							</p>

							<div className={styles.heroStrip}>
								{stripImages.map((image, index) => (
									<div
										key={`${image.localPath}-${index}`}
										className={styles.stripCard}
									>
										<Image
											src={image.localPath}
											alt={image.alt}
											width={800}
											height={520}
											sizes="(min-width: 1024px) 16vw, 29vw"
											className={styles.stripImage}
										/>
									</div>
								))}
							</div>
						</figcaption>
					</div>
				</figure>
			</section>

			{galleryPageContent.sections.map((section, sectionIndex) => (
				<ScrollReveal key={section.id} delayMs={70 + sectionIndex * 35}>
					<section id={section.id} className="be-section">
						<SectionHeading
							eyebrow={section.heading.eyebrow}
							title={section.heading.title}
							description={section.heading.description}
						/>

						<div className={styles.sectionGrid}>
							{section.items.map((item, itemIndex) => (
								<article
									key={`${section.id}-${item.localPath}-${itemIndex}`}
									className={`be-card ${styles.galleryCard} ${itemIndex === 0 ? styles.featuredCard : ""}`}
								>
									<div className={styles.imageWrap}>
										<Image
											src={item.localPath}
											alt={item.alt}
											width={1400}
											height={1800}
											sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
											className={styles.galleryImage}
										/>
									</div>

									<div className={styles.cardMeta}>
										<p className="be-kicker">{item.tag}</p>
										<h3 className={styles.cardTitle}>
											{item.title}
										</h3>
										{item.href ? (
											<a
												href={item.href}
												target="_blank"
												rel="noreferrer"
												className={styles.cardLink}
											>
												View Source
											</a>
										) : null}
									</div>
								</article>
							))}
						</div>
					</section>
				</ScrollReveal>
			))}

			<ScrollReveal delayMs={180}>
				<section className="be-section pt-0">
					<div className={`be-card ${styles.ctaPanel}`}>
						<SectionHeading
							eyebrow="Ready To Try On"
							title="Book Your Bridal Appointment"
							description="See your favorites in person with one-on-one boutique guidance."
						/>
						<div className="mt-7">
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
		</SiteShell>
	);
}
