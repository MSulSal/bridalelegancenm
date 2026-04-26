export const siteConfig = {
	name: "Bridal Elegance NM",
	description:
		"Bridal Elegance NM is a New Mexico bridal boutique with an editorial feel and appointment-first bridal experience.",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	cityState: "New Mexico",
	appointmentLabel: "Book Appointment",
} as const;
