"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { GalleryShowcaseCollection } from "@/content/gallery-content";
import styles from "./collection-parallax-showcase.module.css";

type CollectionParallaxShowcaseProps = {
	collections: GalleryShowcaseCollection[];
};

export function CollectionParallaxShowcase({
	collections,
}: CollectionParallaxShowcaseProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const markerRefs = useRef<Array<HTMLElement | null>>([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const [slideIndex, setSlideIndex] = useState(0);
	const [videoFailed, setVideoFailed] = useState(false);
	const [backgroundShift, setBackgroundShift] = useState(0);

	const activeCollection = collections[activeIndex] ?? collections[0];
	const canPlayVideo =
		Boolean(activeCollection?.hoverVideoSrc) && !videoFailed && isHovered;
	const hoverSlides = activeCollection?.hoverSlides ?? [];

	const activeFrame = useMemo(() => {
		if (!isHovered || hoverSlides.length === 0) {
			return activeCollection?.cover;
		}
		if (canPlayVideo) {
			return activeCollection?.cover;
		}
		return hoverSlides[slideIndex] ?? activeCollection?.cover;
	}, [activeCollection, canPlayVideo, hoverSlides, isHovered, slideIndex]);

	useEffect(() => {
		setSlideIndex(0);
		setVideoFailed(false);
	}, [activeIndex]);

	useEffect(() => {
		if (!isHovered || canPlayVideo || hoverSlides.length < 2) {
			return;
		}
		const intervalId = window.setInterval(() => {
			setSlideIndex(current => (current + 1) % hoverSlides.length);
		}, 1550);
		return () => window.clearInterval(intervalId);
	}, [canPlayVideo, hoverSlides, isHovered]);

	useEffect(() => {
		const markers = markerRefs.current.filter(
			(marker): marker is HTMLElement => marker !== null,
		);
		if (markers.length === 0) {
			return;
		}

		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (!entry.isIntersecting) return;
					const marker = entry.target as HTMLElement;
					const markerIndex = Number(marker.dataset.index ?? "0");
					if (Number.isNaN(markerIndex)) return;
					setActiveIndex(markerIndex);
				});
			},
			{
				root: null,
				rootMargin: "-42% 0px -42% 0px",
				threshold: 0.01,
			},
		);

		markers.forEach(marker => observer.observe(marker));
		return () => observer.disconnect();
	}, [collections.length]);

	useEffect(() => {
		let ticking = false;

		const updateShift = () => {
			ticking = false;
			if (!rootRef.current) return;
			const rect = rootRef.current.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const distance = (viewportHeight * 0.56 - rect.top) * 0.1;
			const clamped = Math.max(-36, Math.min(36, distance));
			setBackgroundShift(clamped);
		};

		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(updateShift);
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, []);

	if (collections.length === 0 || !activeCollection || !activeFrame) {
		return null;
	}

	return (
		<div ref={rootRef} className={styles.root}>
			<div className={styles.stickyStage}>
				<div className={styles.backgroundLayer} aria-hidden="true">
					{collections.map((collection, index) => (
						<Image
							key={collection.id}
							src={collection.cover.localPath}
							alt=""
							fill
							sizes="100vw"
							className={`${styles.backgroundImage} ${index === activeIndex ? styles.backgroundImageActive : ""}`}
							style={
								{
									"--bg-shift": `${backgroundShift}px`,
								} as CSSProperties
							}
						/>
					))}
					<div className={styles.backgroundVeil} />
				</div>

				<div className={styles.stageContent}>
					<div className={styles.centerCardWrap}>
						<article
							className={styles.centerCard}
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
							onFocusCapture={() => setIsHovered(true)}
							onBlurCapture={() => setIsHovered(false)}
						>
							<div className={styles.cardMedia}>
								{canPlayVideo ? (
									<video
										key={activeCollection.hoverVideoSrc}
										src={activeCollection.hoverVideoSrc}
										poster={activeCollection.cover.localPath}
										autoPlay
										loop
										muted
										playsInline
										className={styles.mediaAsset}
										onError={() => setVideoFailed(true)}
									/>
								) : (
									<Image
										key={`${activeCollection.id}-${activeFrame.localPath}-${slideIndex}`}
										src={activeFrame.localPath}
										alt={activeFrame.alt}
										fill
										sizes="(min-width: 1024px) 46vw, 88vw"
										className={`${styles.mediaAsset} ${styles.mediaImage}`}
									/>
								)}
							</div>
						</article>
					</div>

					<aside className={styles.collectionRail} aria-label="Collections">
						<ol className={styles.collectionList}>
							{collections.map((collection, index) => (
								<li
									key={collection.id}
									className={`${styles.collectionItem} ${index === activeIndex ? styles.collectionItemActive : ""}`}
								>
									<p className={styles.collectionDescriptor}>
										{collection.descriptor}
									</p>
									<h2 className={styles.collectionName}>
										{collection.name}
									</h2>
								</li>
							))}
						</ol>
					</aside>
				</div>
			</div>

			<div className={styles.scrollTrack} aria-hidden="true">
				{collections.map((collection, index) => (
					<section key={collection.id} className={styles.scrollStep}>
						<div
							ref={element => {
								markerRefs.current[index] = element;
							}}
							data-index={index}
							className={styles.scrollMarker}
						/>
					</section>
				))}
			</div>
		</div>
	);
}
