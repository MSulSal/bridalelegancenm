import Image from "next/image";
import { BrandText } from "@/components/brand/brand-text";
import { homeContent } from "@/content/site-content";
import { SiteShell } from "@/components/layout/site-shell";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
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
					className={`be-section pt-8 md:pt-12 ${styles.showroomSection}`}
				>
					<div className={styles.showroomFeature}>
						<div className={styles.showroomBackdropText} aria-hidden="true">
							<p className={styles.showroomBackdropKicker}>
								{homeContent.aboutPreview.kicker}
							</p>
							<p className={styles.showroomBackdropCopy}>
								{homeContent.aboutPreview.copy}
							</p>
							<p className={styles.showroomBackdropMeta}>
								{siteConfig.showroomUpdate}
							</p>
						</div>
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
					</div>
				</section>
			</ScrollReveal>
		</SiteShell>
	);
}
