export const siteConfig = {
	name: "Bridal Elegance Atelier",
	description:
		"Bridal Elegance Atelier is an Albuquerque bridal boutique with an editorial feel and appointment-first bridal experience.",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	cityState: "Albuquerque, New Mexico",
	tagline:
		"Appointment-first bridal boutique with personalized styling support in Old Town Albuquerque.",
	appointmentLabel: "Book Appointment",
	appointmentHref: "/book-appointment",
	legacySiteUrl: "https://bridalelegancenm.com",
	phoneDisplay: "(505) 830-2110",
	phoneHref: "tel:+15058302110",
	addressLine1: "1301 Rio Grande NW",
	addressLine2: "Old Town Albuquerque, NM",
	mapsHref:
		"https://maps.google.com/?q=1301+Rio+Grande+NW,+Old+Town+Albuquerque,+NM",
	instagramHref:
		"https://www.instagram.com/bridalelegancenm?igshid=1pbdf5fjo7xjw",
	instagramLabel: "@bridalelegancenm",
	showroomUpdate: "Now welcoming appointments in Old Town Albuquerque.",
} as const;
