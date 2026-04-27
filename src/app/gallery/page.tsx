import type { Metadata } from "next";
import Image from "next/image";
import {
	galleryPageContent,
	galleryShowcaseCollections,
} from "@/content/gallery-content";
import { CollectionParallaxShowcase } from "@/components/gallery/collection-parallax-showcase";
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

			<ScrollReveal delayMs={80}>
				<section className="be-section pt-10">
					<SectionHeading
						eyebrow="Collection Stories"
						title="Scroll Through The Bridal Collection Stage"
						description="Large blurred atmosphere in motion, with a fixed center cover card and collection progression as you scroll."
					/>
					<CollectionParallaxShowcase
						collections={galleryShowcaseCollections}
					/>
				</section>
			</ScrollReveal>

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
