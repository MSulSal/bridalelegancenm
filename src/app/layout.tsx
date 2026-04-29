import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { defaultTheme, themeIds, themeStorageKey } from "@/lib/theme";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const bodyFont = Manrope({
	subsets: ["latin"],
	variable: "--font-body-sans",
});

const displayFont = Cormorant_Garamond({
	subsets: ["latin"],
	variable: "--font-display-serif",
	weight: ["500", "600", "700"],
});

const metadataBase = (() => {
	try {
		return new URL(siteConfig.url);
	} catch {
		return new URL("http://localhost:3000");
	}
})();

const themeInitScript = `(() => {
	const key = ${JSON.stringify(themeStorageKey)};
	const fallback = ${JSON.stringify(defaultTheme)};
	const allowed = ${JSON.stringify(themeIds)};
	try {
		const stored = window.localStorage.getItem(key);
		const next = allowed.includes(stored ?? "") ? stored : fallback;
		document.documentElement.setAttribute("data-theme", next);
	} catch {
		document.documentElement.setAttribute("data-theme", fallback);
	}
})();`;

export const metadata: Metadata = {
	metadataBase,
	title: {
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			lang="en-US"
			data-theme={defaultTheme}
			suppressHydrationWarning
		>
			<head>
				{/* Prevent theme flash before React hydrates */}
				<script
					id="be-theme-init"
					dangerouslySetInnerHTML={{ __html: themeInitScript }}
				/>
			</head>
			<body
				className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
