export const siteConfig = {
	name: "Bridal Elegance NM",
	description:
		"Bridal Elegance NM is a New Mexico bridal boutique with an editorial feel and appointment-first bridal experience.",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	cityState: "New Mexico",
	tagline:
		"Family-owned bridal boutique with appointment-first, personalized styling support.",
	appointmentLabel: "Book Appointment",
	appointmentHref: "/book-appointment",
	legacySiteUrl: "https://bridalelegancenm.com",
	phoneDisplay: "(505) 830-2110",
	phoneHref: "tel:+15058302110",
	instagramHref:
		"https://www.instagram.com/bridalelegancenm?igshid=1pbdf5fjo7xjw",
	instagramLabel: "@bridalelegancenm",
	showroomUpdate:
		"Showroom relocation in progress. New address announcement coming soon.",
} as const;
