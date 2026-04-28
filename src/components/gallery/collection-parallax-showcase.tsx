"use client";

import Image from "next/image";
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import type { GalleryShowcaseCollection } from "@/content/gallery-content";
import styles from "./collection-parallax-showcase.module.css";

type CollectionParallaxShowcaseProps = {
	collections: GalleryShowcaseCollection[];
};

const SCROLL_LOOPS = 5;
const TRACK_BUFFER_CYCLES = 2;
const FOREGROUND_INERTIA = 0.1;
const INTERNAL_SCROLL_LOOPS = 28;
const RECENTER_MIN_RATIO = 0.22;
const RECENTER_MAX_RATIO = 0.78;
const DESKTOP_SCROLL_FACTOR = 1.06;
const MOBILE_SCROLL_FACTOR = 0.9;
const TOTAL_TRACK_CYCLES = INTERNAL_SCROLL_LOOPS + TRACK_BUFFER_CYCLES * 2;

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function wrapProgress(value: number, count: number) {
	if (count <= 0) return 0;
	return ((value % count) + count) % count;
}

export function CollectionParallaxShowcase({
	collections,
}: CollectionParallaxShowcaseProps) {
	const scrollViewportRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const coverViewportRef = useRef<HTMLDivElement>(null);
	const [progress, setProgress] = useState(0);
	const [foregroundProgress, setForegroundProgress] = useState(0);
	const foregroundTargetRef = useRef(0);
	const applyProgressRef = useRef<(rawProgress: number) => void>(() => {});
	const hoverTweenFrameRef = useRef<number | null>(null);
	const virtualProgressRef = useRef(0);
	const lastScrollTopRef = useRef(0);
	const initializedRef = useRef(false);

	const collectionCount = collections.length;
	const loopSpan = Math.max(
		collectionCount * INTERNAL_SCROLL_LOOPS,
		collectionCount,
	);
	const foregroundCycleProgress =
		wrapProgress(foregroundProgress, collectionCount);
	const activeIndex =
		collectionCount > 0
			? Math.round(foregroundCycleProgress) % collectionCount
			: 0;
	const trackStartIndex = collectionCount * TRACK_BUFFER_CYCLES;
	const backgroundTrackProgress = trackStartIndex + progress;
	const coverTrackProgress = trackStartIndex + foregroundProgress;
	const activeTrackIndex = Math.round(coverTrackProgress);

	const trackCollections = useMemo(() => {
		if (collectionCount === 0) {
			return [] as GalleryShowcaseCollection[];
		}

		const stacked: GalleryShowcaseCollection[] = [];
		for (let i = 0; i < TOTAL_TRACK_CYCLES; i += 1) {
			stacked.push(...collections);
		}
		return stacked;
	}, [collectionCount, collections]);

	const activeCollection = collections[activeIndex] ?? collections[0];

	const tweenToCollection = (targetIndex: number) => {
		if (collectionCount <= 0) return;

		const current = virtualProgressRef.current;
		const step = collectionCount;
		const base = ((targetIndex % step) + step) % step;
		const centered = base + Math.round((current - base) / step) * step;

		const localCandidates = [centered - step, centered, centered + step];
		let closest = localCandidates[0];
		for (const candidate of localCandidates) {
			if (Math.abs(candidate - current) < Math.abs(closest - current)) {
				closest = candidate;
			}
		}

		let bounded = closest;
		while (bounded < 0) bounded += step;
		while (bounded >= loopSpan) bounded -= step;

		const wrapCandidates = [bounded, bounded + loopSpan, bounded - loopSpan];
		let target = wrapCandidates[0];
		for (const candidate of wrapCandidates) {
			if (Math.abs(candidate - current) < Math.abs(target - current)) {
				target = candidate;
			}
		}

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReducedMotion) {
			applyProgressRef.current(target);
			return;
		}

		const travelDistance = Math.abs(target - current);
		const durationMs = clamp(520 + travelDistance * 260, 520, 1040);
		const startedAt = performance.now();

		if (hoverTweenFrameRef.current !== null) {
			window.cancelAnimationFrame(hoverTweenFrameRef.current);
		}

		const animate = (timestamp: number) => {
			const elapsed = timestamp - startedAt;
			const t = clamp(elapsed / durationMs, 0, 1);
			const eased = t * t * (3 - 2 * t);
			const nextProgress = current + (target - current) * eased;
			applyProgressRef.current(nextProgress);

			if (t < 1) {
				hoverTweenFrameRef.current = window.requestAnimationFrame(animate);
			} else {
				hoverTweenFrameRef.current = null;
			}
		};

		hoverTweenFrameRef.current = window.requestAnimationFrame(animate);
	};

	useEffect(() => {
		let frameId = 0;

		const tick = () => {
			setForegroundProgress(current => {
				const target = foregroundTargetRef.current;
				const eased = current + (target - current) * FOREGROUND_INERTIA;
				return Math.abs(target - eased) < 0.0008 ? target : eased;
			});
			frameId = window.requestAnimationFrame(tick);
		};

		frameId = window.requestAnimationFrame(tick);
		return () => window.cancelAnimationFrame(frameId);
	}, []);

	useEffect(() => {
		let ticking = false;
		let resizeRaf = 0;
		const viewport = scrollViewportRef.current;

		if (!viewport || collectionCount <= 0) return;

		const applyProgress = (rawProgress: number) => {
			const nextProgress = wrapProgress(rawProgress, loopSpan);
			virtualProgressRef.current = nextProgress;
			const progressBase = Math.floor(nextProgress);
			const progressFraction = nextProgress - progressBase;

			let mappedForegroundProgress = nextProgress;
			const stageRect = stageRef.current?.getBoundingClientRect();
			const coverRect = coverViewportRef.current?.getBoundingClientRect();

			if (stageRect && coverRect && coverRect.height > 0) {
				const stageHeight = stageRect.height;
				const coverTop = coverRect.top - stageRect.top;
				const coverBottom = coverTop + coverRect.height;
				const dividerY = (1 - progressFraction) * stageHeight;

				let revealWithinCover = 0;
				if (dividerY <= coverTop) {
					revealWithinCover = 1;
				} else if (dividerY < coverBottom) {
					revealWithinCover = clamp(
						(coverBottom - dividerY) / coverRect.height,
						0,
						1,
					);
				}

				mappedForegroundProgress = progressBase + revealWithinCover;
			}
			mappedForegroundProgress = wrapProgress(
				mappedForegroundProgress,
				loopSpan,
			);

			setProgress(current =>
				Math.abs(current - nextProgress) > 0.001 ? nextProgress : current,
			);
			foregroundTargetRef.current = mappedForegroundProgress;
		};
		applyProgressRef.current = applyProgress;

		const initializeScroller = () => {
			const maxTop = Math.max(viewport.scrollHeight - viewport.clientHeight, 1);
			const center = maxTop * 0.5;
			viewport.scrollTop = center;
			lastScrollTopRef.current = center;
			virtualProgressRef.current = wrapProgress(
				virtualProgressRef.current,
				loopSpan,
			);
			initializedRef.current = true;
		};

		const updateInternal = () => {
			if (!initializedRef.current) {
				initializeScroller();
				return;
			}

			const maxTop = Math.max(viewport.scrollHeight - viewport.clientHeight, 1);
			const currentTop = viewport.scrollTop;
			const delta = currentTop - lastScrollTopRef.current;
			lastScrollTopRef.current = currentTop;
			if (Math.abs(delta) < 0.001) return;

			const isDesktop = window.innerWidth >= 1024;
			const pixelsPerCollection = Math.max(
				viewport.clientHeight *
					(isDesktop ? DESKTOP_SCROLL_FACTOR : MOBILE_SCROLL_FACTOR),
				170,
			);
			virtualProgressRef.current += delta / pixelsPerCollection;
			applyProgress(virtualProgressRef.current);
			window.dispatchEvent(
				new CustomEvent("be:virtual-scroll", {
					detail: { deltaY: delta },
				}),
			);

			const shouldRecenter = window.innerWidth >= 1024;
			if (
				(shouldRecenter && currentTop < maxTop * RECENTER_MIN_RATIO) ||
				(shouldRecenter && currentTop > maxTop * RECENTER_MAX_RATIO)
			) {
				const center = maxTop * 0.5;
				viewport.scrollTop = center;
				lastScrollTopRef.current = center;
			}
		};

		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(() => {
				ticking = false;
				updateInternal();
			});
		};

		initializeScroller();
		viewport.addEventListener("scroll", onScroll, { passive: true });
		const onResize = () => {
			if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
			resizeRaf = window.requestAnimationFrame(() => {
				initializeScroller();
			});
		};
		window.addEventListener("resize", onResize);

		return () => {
			viewport.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
			if (hoverTweenFrameRef.current !== null) {
				window.cancelAnimationFrame(hoverTweenFrameRef.current);
			}
			hoverTweenFrameRef.current = null;
			applyProgressRef.current = () => {};
		};
	}, [collectionCount, loopSpan]);

	if (collections.length === 0 || !activeCollection) {
		return null;
	}

	return (
		<div
			className={styles.root}
			style={
				{
					"--collection-count": String(Math.max(collections.length, 1)),
					"--scroll-loops": String(SCROLL_LOOPS),
					"--internal-scroll-loops": String(INTERNAL_SCROLL_LOOPS),
					"--background-progress": String(backgroundTrackProgress),
					"--cover-progress": String(coverTrackProgress),
				} as CSSProperties
			}
		>
			<div ref={scrollViewportRef} className={styles.scrollViewport}>
				<div className={styles.scrollRail}>
					<div ref={stageRef} className={styles.stickyStage}>
						<div className={styles.backgroundViewport} aria-hidden="true">
							<div className={styles.backgroundTrack}>
								{trackCollections.map((collection, index) => (
									<div
										key={`${collection.id}-bg-${index}`}
										className={styles.backgroundSlot}
									>
										<Image
											src={collection.cover.localPath}
											alt=""
											fill
											sizes="100vw"
											className={styles.backgroundImage}
										/>
									</div>
								))}
							</div>
						</div>

						<div className={styles.stageContent}>
							<div className={styles.coverPane}>
								<div
									ref={coverViewportRef}
									className={styles.coverViewport}
								>
									<div className={styles.coverTrack}>
										{trackCollections.map((collection, index) => {
											const isTrackActive =
												index === activeTrackIndex;

											return (
												<div
													key={`${collection.id}-cover-${index}`}
													className={styles.coverSlot}
												>
													<article
														className={`${styles.centerCard} ${isTrackActive ? styles.centerCardActive : ""}`}
													>
														<a
															href={collection.collectionHref}
															target="_blank"
															rel="noreferrer"
															aria-label={`View ${collection.name} collection`}
															className={styles.cardLink}
														>
															<div className={styles.cardMedia}>
																<Image
																	src={collection.cover.localPath}
																	alt={collection.cover.alt}
																	fill
																	sizes="(min-width: 1024px) 24rem, 68vw"
																	className={styles.mediaAsset}
																/>
															</div>
														</a>
													</article>
												</div>
											);
										})}
									</div>
								</div>
								<div className={styles.mobileNowNext}>
									<p className={styles.mobileNowNextKicker}>
										Collection
									</p>
									<a
										href={activeCollection.collectionHref}
										target="_blank"
										rel="noreferrer"
										className={styles.mobileNowNextLink}
										aria-label={`View ${activeCollection.name} collection`}
									>
										<p className={styles.mobileNowNextTitle}>
											{activeCollection.name}
										</p>
										<p className={styles.mobileNowNextMeta}>
											{activeCollection.descriptor}
										</p>
										<p className={styles.mobileNowNextSummary}>
											{activeCollection.summary}
										</p>
									</a>
								</div>
							</div>

							<aside
								className={styles.collectionRail}
								aria-label="Collections"
							>
								<ol className={styles.collectionList}>
									{collections.map((collection, index) => {
										const directDistance = Math.abs(
											index - foregroundCycleProgress,
										);
										const wrappedDistance = Math.abs(
											collectionCount - directDistance,
										);
										const distance = Math.min(
											directDistance,
											wrappedDistance,
										);
										const opacity = clamp(
											1 - distance * 0.48,
											0.22,
											1,
										);
										const shift = clamp(
											(index - foregroundCycleProgress) *
												5.4,
											-14,
											14,
										);

										return (
											<li
												key={collection.id}
												className={`${styles.collectionItem} ${index === activeIndex ? styles.collectionItemActive : ""}`}
												onMouseEnter={() =>
													tweenToCollection(index)
												}
												onFocus={() =>
													tweenToCollection(index)
												}
												style={
													{
														opacity,
														transform: `translateX(${-shift}px)`,
													} as CSSProperties
												}
											>
												<a
													href={collection.collectionHref}
													target="_blank"
													rel="noreferrer"
													className={styles.collectionTextLink}
													aria-label={`View ${collection.name} collection`}
												>
													<p
														className={
															styles.collectionDescriptor
														}
													>
														{collection.descriptor}
													</p>
													<h2
														className={
															styles.collectionName
														}
													>
														{collection.name}
													</h2>
													<p
														className={
															styles.collectionSummary
														}
													>
														{collection.summary}
													</p>
												</a>
											</li>
										);
									})}
								</ol>
							</aside>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
