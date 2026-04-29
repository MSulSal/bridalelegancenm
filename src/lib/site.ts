export const siteConfig = {
	name: "Bridal Elegance Atelier",
	description:
		"Bridal Elegance is New Mexico's longest standing bridal boutique, located in Albuquerque's Sawmill District near Historic Old Town.",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	cityState: "Albuquerque, New Mexico",
	tagline:
		"New Mexico's longest standing bridal boutique.",
	appointmentLabel: "Book Appointment",
	appointmentHref: "/book-appointment",
	legacySiteUrl: "https://bridalelegancenm.com",
	phoneDisplay: "(505) 830-2110",
	phoneHref: "tel:+15058302110",
	addressLine1: "1301 Rio Grande NW",
	addressLine2: "Sawmill District, Near Historic Old Town Albuquerque, NM",
	mapsHref:
		"https://maps.google.com/?q=1301+Rio+Grande+NW,+Old+Town+Albuquerque,+NM",
	mapsEmbedSrc:
		"https://www.google.com/maps?q=1301+Rio+Grande+NW,+Albuquerque,+NM+87104&z=15&output=embed",
	instagramHref:
		"https://www.instagram.com/bridalelegancenm?igshid=1pbdf5fjo7xjw",
	instagramLabel: "@bridalelegancenm",
	showroomUpdate:
		"Now welcoming appointments in Albuquerque's Sawmill District near Historic Old Town.",
} as const;
