import type { NextConfig } from "next";

const securityHeaders = [
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), payment=()",
	},
	{
		key: "X-Permitted-Cross-Domain-Policies",
		value: "none",
	},
];

const nextConfig: NextConfig = {
	poweredByHeader: false,
	images: {
		qualities: [75, 90],
	},
	turbopack: {
		root: process.cwd(),
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
