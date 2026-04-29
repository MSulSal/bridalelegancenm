"use client";

import { useSyncExternalStore } from "react";
import {
	applyBrand,
	brandOptions,
	defaultBrand,
	readBrand,
	subscribeBrand,
	type BrandId,
} from "@/lib/brand";
import styles from "./brand-toggle.module.css";

type BrandToggleProps = {
	size?: "default" | "compact";
};

function getServerBrandSnapshot(): BrandId {
	return defaultBrand;
}

export function BrandToggle({ size = "default" }: BrandToggleProps) {
	const activeBrand = useSyncExternalStore(
		subscribeBrand,
		readBrand,
		getServerBrandSnapshot,
	);

	return (
		<div
			className={`${styles.root} ${size === "compact" ? styles.rootCompact : ""}`}
			role="group"
			aria-label="Brand mode"
		>
			{brandOptions.map(option => {
				const isActive = option.id === activeBrand;

				return (
					<button
						key={option.id}
						type="button"
						className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
						onClick={() => applyBrand(option.id)}
						aria-pressed={isActive}
						aria-label={`Use ${option.siteName}`}
					>
						{option.name}
					</button>
				);
			})}
		</div>
	);
}
