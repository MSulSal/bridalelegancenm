export const siteConfig = {
	name: "Bridal Elegance NM",
	description:
		"Bridal Elegance NM is New Mexico's longest-standing bridal boutique, located at 1301 Rio Grande NW, Suite 2 in Albuquerque, north of Sawmill District and Old Town.",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	cityState: "Albuquerque, New Mexico",
	tagline:
		"New Mexico's longest standing bridal boutique.",
	appointmentLabel: "Book Appointment",
	appointmentHref: "/book-appointment",
	legacySiteUrl: "https://bridalelegancenm.com",
	phoneDisplay: "(505) 830-2110",
	phoneHref: "tel:+15058302110",
	addressLine1: "1301 Rio Grande NW, Suite 2",
	addressLine2: "North of Sawmill District and Old Town, Albuquerque, NM",
	mapsHref:
		"https://maps.google.com/?q=1301+Rio+Grande+NW+Suite+2,+Albuquerque,+NM",
	mapsEmbedSrc:
		"https://www.google.com/maps?q=1301+Rio+Grande+NW+Suite+2,+Albuquerque,+NM+87104&z=15&output=embed",
	instagramHref:
		"https://www.instagram.com/bridalelegancenm?igshid=1pbdf5fjo7xjw",
	instagramLabel: "@bridalelegancenm",
	showroomUpdate:
		"Now welcoming appointments in Albuquerque, north of Sawmill District and Old Town.",
} as const;
