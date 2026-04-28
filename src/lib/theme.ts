export const themeStorageKey = "be-theme";
export const themeChangeEvent = "be-theme-change";
export const defaultTheme = "monochrome" as const;

export const themeOptions = [
	{
		// Keep id "blue" for localStorage compatibility from older sessions.
		id: "blue",
		name: "Sage Atelier",
		swatch: "#5E766A",
	},
	{
		id: "blush",
		name: "Blush",
		swatch: "#E4AFA9",
	},
	{
		id: "turquoise",
		name: "Turquoise",
		swatch: "#1E8A83",
	},
	{
		id: "sand",
		name: "Sand",
		swatch: "#B8905A",
	},
	{
		id: "red-rock",
		name: "Red Rock",
		swatch: "#B5523E",
	},
	{
		id: "brown",
		name: "Brown",
		swatch: "#7A5338",
	},
	{
		id: "lilac",
		name: "Lilac",
		swatch: "#8C6FB2",
	},
	{
		id: "lavender",
		name: "Lavender",
		swatch: "#A07ACB",
	},
	{
		id: "monochrome",
		name: "Monochrome",
		swatch: "#111111",
	},
] as const;

export type ThemeId = (typeof themeOptions)[number]["id"];

export const themeIds: ThemeId[] = [
	"blue",
	"blush",
	"turquoise",
	"sand",
	"red-rock",
	"brown",
	"lilac",
	"lavender",
	"monochrome",
];

export function isThemeId(value: unknown): value is ThemeId {
	return typeof value === "string" && themeIds.includes(value as ThemeId);
}

export function readTheme(): ThemeId {
	if (typeof document !== "undefined") {
		const fromDom = document.documentElement.getAttribute("data-theme");
		if (isThemeId(fromDom)) {
			return fromDom;
		}
	}

	if (typeof window !== "undefined") {
		try {
			const fromStorage = window.localStorage.getItem(themeStorageKey);
			if (isThemeId(fromStorage)) {
				return fromStorage;
			}
		} catch {
			// localStorage may be unavailable in restricted contexts.
		}
	}

	return defaultTheme;
}

export function applyTheme(nextTheme: ThemeId) {
	const currentTheme = readTheme();

	if (typeof document !== "undefined") {
		document.documentElement.setAttribute("data-theme", nextTheme);
	}

	if (typeof window !== "undefined") {
		try {
			window.localStorage.setItem(themeStorageKey, nextTheme);
		} catch {
			// localStorage may be unavailable in restricted contexts.
		}

		if (currentTheme !== nextTheme) {
			window.dispatchEvent(
				new CustomEvent<ThemeId>(themeChangeEvent, {
					detail: nextTheme,
				}),
			);
		}
	}
}

export function subscribeTheme(listener: () => void) {
	if (typeof window === "undefined") {
		return () => {};
	}

	const onThemeChanged = () => {
		listener();
	};

	const onStorage = (event: StorageEvent) => {
		if (event.key === themeStorageKey) {
			listener();
		}
	};

	window.addEventListener(themeChangeEvent, onThemeChanged);
	window.addEventListener("storage", onStorage);

	return () => {
		window.removeEventListener(themeChangeEvent, onThemeChanged);
		window.removeEventListener("storage", onStorage);
	};
}
