import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
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
		<html lang="en-US">
			<body
				className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
