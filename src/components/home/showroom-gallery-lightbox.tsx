"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import styles from "@/app/home.module.css";

type ShowroomImage = {
	localPath: string;
	alt: string;
};

type ShowroomGalleryLightboxProps = {
	images: readonly ShowroomImage[];
};

export function ShowroomGalleryLightbox({
	images,
}: ShowroomGalleryLightboxProps) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (activeIndex === null) {
			return;
		}

		const previousHtmlOverflow = document.documentElement.style.overflow;
		const previousBodyOverflow = document.body.style.overflow;

		document.documentElement.style.overflow = "hidden";
		document.body.style.overflow = "hidden";

		return () => {
			document.documentElement.style.overflow = previousHtmlOverflow;
			document.body.style.overflow = previousBodyOverflow;
		};
	}, [activeIndex]);

	useEffect(() => {
		if (activeIndex === null) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setActiveIndex(null);
				return;
			}

			if (event.key === "ArrowLeft") {
				setActiveIndex(current =>
					current === null
						? 0
						: (current - 1 + images.length) % images.length,
				);
				return;
			}

			if (event.key === "ArrowRight") {
				setActiveIndex(current =>
					current === null ? 0 : (current + 1) % images.length,
				);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeIndex, images.length]);

	const showPrevious = () => {
		setActiveIndex(current =>
			current === null ? 0 : (current - 1 + images.length) % images.length,
		);
	};

	const showNext = () => {
		setActiveIndex(current =>
			current === null ? 0 : (current + 1) % images.length,
		);
	};

	const lightbox =
		isMounted && activeIndex !== null
			? createPortal(
					<div
						className={styles.showroomLightbox}
						role="dialog"
						aria-modal="true"
						aria-label="Showroom photo preview"
						onClick={() => setActiveIndex(null)}
					>
						<div
							className={styles.showroomLightboxPanel}
							onClick={event => event.stopPropagation()}
						>
							<button
								type="button"
								className={styles.showroomLightboxClose}
								onClick={() => setActiveIndex(null)}
								aria-label="Close showroom photo preview"
							>
								Close
							</button>
							<button
								type="button"
								className={`${styles.showroomLightboxNav} ${styles.showroomLightboxNavPrev}`}
								onClick={showPrevious}
								aria-label="Show previous showroom photo"
							>
								{"<"}
							</button>
							<div className={styles.showroomLightboxFrame}>
								<Image
									src={images[activeIndex].localPath}
									alt={images[activeIndex].alt}
									fill
									sizes="100vw"
									className="object-contain"
									priority
								/>
							</div>
							<button
								type="button"
								className={`${styles.showroomLightboxNav} ${styles.showroomLightboxNavNext}`}
								onClick={showNext}
								aria-label="Show next showroom photo"
							>
								{">"}
							</button>
							<p className={styles.showroomLightboxCount}>
								{activeIndex + 1} / {images.length}
							</p>
						</div>
					</div>,
					document.body,
				)
			: null;

	return (
		<>
			<div className={styles.showroomCardGallery}>
				{images.map((image, index) => (
					<button
						key={image.localPath}
						type="button"
						className={`${styles.showroomCardTile} be-lookbook-frame`}
						onClick={() => setActiveIndex(index)}
						aria-label={`Open larger view of showroom photo ${index + 1}`}
					>
						<Image
							src={image.localPath}
							alt={image.alt}
							fill
							sizes="(min-width: 640px) 22vw, 46vw"
							className="object-cover"
						/>
					</button>
				))}
			</div>
			{lightbox}
		</>
	);
}
