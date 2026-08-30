"use client";

import { useEffect, useState } from "react";
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

	useEffect(() => {
		if (activeIndex === null) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setActiveIndex(null);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeIndex]);

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

			{activeIndex !== null ? (
				<div
					className={styles.showroomLightbox}
					role="dialog"
					aria-modal="true"
					aria-label="Showroom photo preview"
					onClick={() => setActiveIndex(null)}
				>
					<button
						type="button"
						className={styles.showroomLightboxClose}
						onClick={() => setActiveIndex(null)}
						aria-label="Close showroom photo preview"
					>
						Close
					</button>
					<div
						className={styles.showroomLightboxFrame}
						onClick={event => event.stopPropagation()}
					>
						<Image
							src={images[activeIndex].localPath}
							alt={images[activeIndex].alt}
							fill
							sizes="100vw"
							className="object-contain"
							priority
						/>
					</div>
				</div>
			) : null}
		</>
	);
}
