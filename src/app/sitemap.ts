import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const appointmentRoutes: Array<{
	path: string;
	priority: number;
	changeFrequency: NonNullable<
		MetadataRoute.Sitemap[number]["changeFrequency"]
	>;
}> = siteConfig.appointmentsEnabled
	? [{ path: "/book-appointment", priority: 0.9, changeFrequency: "weekly" }]
	: [];

const accessoryRoutes: Array<{
	path: string;
	priority: number;
	changeFrequency: NonNullable<
		MetadataRoute.Sitemap[number]["changeFrequency"]
	>;
}> = siteConfig.accessoriesEnabled
	? [{ path: "/accessories", priority: 0.8, changeFrequency: "monthly" }]
	: [];

const routes = [
	{ path: "", priority: 1, changeFrequency: "weekly" },
	{ path: "/collections", priority: 0.9, changeFrequency: "weekly" },
	{
		path: "/quick-ship-wedding-dresses",
		priority: 0.9,
		changeFrequency: "weekly",
	},
	...accessoryRoutes,
	...appointmentRoutes,
] as const satisfies Array<{
	path: string;
	priority: number;
	changeFrequency: NonNullable<
		MetadataRoute.Sitemap[number]["changeFrequency"]
	>;
}>;

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date("2026-09-06T00:00:00.000Z");

	return routes.map(route => ({
		url: `${siteConfig.url}${route.path}`,
		lastModified,
		changeFrequency: route.changeFrequency,
		priority: route.priority,
	}));
}
