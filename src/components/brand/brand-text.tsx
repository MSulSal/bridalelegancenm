"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { defaultBrand, readBrand, subscribeBrand, type BrandId } from "@/lib/brand";

type BrandTextProps = {
	nm: ReactNode;
	atelier: ReactNode;
};

function getServerBrandSnapshot(): BrandId {
	return defaultBrand;
}

export function BrandText({ nm, atelier }: BrandTextProps) {
	const activeBrand = useSyncExternalStore(
		subscribeBrand,
		readBrand,
		getServerBrandSnapshot,
	);

	return <>{activeBrand === "nm" ? nm : atelier}</>;
}
