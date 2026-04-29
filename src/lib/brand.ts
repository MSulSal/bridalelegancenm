export const brandStorageKey = "be-brand";
export const brandChangeEvent = "be-brand-change";
export const defaultBrand = "atelier" as const;

export const brandOptions = [
	{
		id: "atelier",
		name: "Atelier",
		siteName: "Bridal Elegance Atelier",
	},
	{
		id: "nm",
		name: "NM",
		siteName: "Bridal Elegance NM",
	},
] as const;

export type BrandId = (typeof brandOptions)[number]["id"];

export const brandIds: BrandId[] = ["atelier", "nm"];

export function isBrandId(value: unknown): value is BrandId {
	return typeof value === "string" && brandIds.includes(value as BrandId);
}

export function readBrand(): BrandId {
	if (typeof document !== "undefined") {
		const fromDom = document.documentElement.getAttribute("data-brand");
		if (isBrandId(fromDom)) {
			return fromDom;
		}
	}

	if (typeof window !== "undefined") {
		try {
			const fromStorage = window.localStorage.getItem(brandStorageKey);
			if (isBrandId(fromStorage)) {
				return fromStorage;
			}
		} catch {
			// localStorage may be unavailable in restricted contexts.
		}
	}

	return defaultBrand;
}

export function applyBrand(nextBrand: BrandId) {
	const currentBrand = readBrand();

	if (typeof document !== "undefined") {
		document.documentElement.setAttribute("data-brand", nextBrand);
	}

	if (typeof window !== "undefined") {
		try {
			window.localStorage.setItem(brandStorageKey, nextBrand);
		} catch {
			// localStorage may be unavailable in restricted contexts.
		}

		if (currentBrand !== nextBrand) {
			window.dispatchEvent(
				new CustomEvent<BrandId>(brandChangeEvent, {
					detail: nextBrand,
				}),
			);
		}
	}
}

export function subscribeBrand(listener: () => void) {
	if (typeof window === "undefined") {
		return () => {};
	}

	const onBrandChanged = () => {
		listener();
	};

	const onStorage = (event: StorageEvent) => {
		if (event.key === brandStorageKey) {
			listener();
		}
	};

	window.addEventListener(brandChangeEvent, onBrandChanged);
	window.addEventListener("storage", onStorage);

	return () => {
		window.removeEventListener(brandChangeEvent, onBrandChanged);
		window.removeEventListener("storage", onStorage);
	};
}
