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
				<figure
					className={`m-0 be-card overflow-hidden ${styles.heroFrame}`}
				>
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
					<div
						className={`${styles.sectionLift} ${styles.showroomFeature}`}
					>
						<div className={styles.showroomGalleryBackdrop}>
							{galleryStrip.map(image => (
								<figure
									key={image.localPath}
									className={`m-0 ${styles.homeGalleryTile}`}
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
						<div className={styles.showroomFeatureOverlay} />
						<div className={styles.showroomFeatureContent}>
							<p className="be-kicker">
								{homeContent.aboutPreview.kicker}
							</p>
							<p className={styles.showroomFeatureCopy}>
								{homeContent.aboutPreview.copy}
							</p>
							<p className={styles.showroomFeatureMeta}>
								{siteConfig.showroomUpdate}
							</p>
							<p className={styles.showroomFeatureAction}>
								<a
									href={siteConfig.smsHref}
									className="hover:text-[color:var(--ink-700)]"
								>
									{siteConfig.appointmentTextLine}
								</a>
							</p>
						</div>
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
