export const legacySiteContent = {
	migratedAt: "2026-04-26",
	sourceSite: "https://bridalelegancenm.com",
	canonicalPages: [
		{ label: "Home", path: "/" },
		{ label: "Bridal Gowns", path: "/bridal-gowns" },
		{ label: "Accessories", path: "/accessories" },
		{ label: "Contact for Appointment", path: "/contact-for-appointment" },
	],
	business: {
		legacyName: "Bridal Elegance (Legacy Site)",
		operatingName: "Bridal Elegance NM",
		authorizedLine: "An Authorized Maggie Sottero Bridal Salon",
		authenticityLine:
			"Authorized salon sourcing for genuine Maggie Sottero designs, with personalized boutique guidance.",
		welcomeHeading: "Welcome to Bridal Elegance NM",
		welcomeParagraphs: [
			"Bridal Elegance NM is a family-owned and operated bridal boutique in New Mexico.",
			"Our team has served New Mexico brides for over 35 years with curated gowns for brides, mothers, and special occasions, paired with personal and knowledgeable support.",
		],
		appointmentModel: "APPOINTMENT ONLY",
		showroomUpdate:
			"Now welcoming appointments at 1301 Rio Grande NW, Suite 2, north of Sawmill District and Old Town in Albuquerque, NM.",
		phoneDisplay: "(505) 830-2110",
		phoneHref: "tel:+15058302110",
		mapHref:
			"https://maps.google.com/?q=1301+Rio+Grande+NW+Suite+2,+Albuquerque,+NM",
	},
	socialLinks: [
		{
			label: "Instagram",
			href: "https://www.instagram.com/bridalelegancenm?igshid=1pbdf5fjo7xjw",
		},
	],
	externalLinks: {
		bridalDesigners: [
			{
				label: "Sottero and Midgley",
				href: "https://www.maggiesottero.com/sottero-and-midgley",
			},
			{
				label: "Maggie Sottero",
				href: "https://www.maggiesottero.com/maggie-sottero",
			},
			{
				label: "Rebecca Ingram",
				href: "https://www.maggiesottero.com/rebecca-ingram",
			},
		],
		motherOfBride: {
			label: "Jasmine Bridal",
			href: "https://www.jasminebridal.com/mothers/JADE-COUTURE/",
		},
		accessories: {
			label: "Bel Aire Bridal",
			href: "http://www.belairebridal.com/",
		},
	},
	imageLibrary: {
		hero: {
			localPath: "/migration/legacy-site-images/home-hero.jpg",
			sourceUrl:
				"https://img1.wsimg.com/isteam/ip/c99f89a1-2c9a-4b6d-88ec-7a9f74d21294/IMG_Black.JPG",
			alt: "Bridal Elegance featured bridal gown",
		},
		homeGallery: [
			{
				localPath: "/client-gallery-2026/img-6691.jpg",
				sourceUrl:
					"/client-gallery-2026/img-6691.jpg",
				alt: "Bride in a structured satin ballgown",
			},
			{
				localPath: "/client-gallery-2026/img-6692.jpeg",
				sourceUrl:
					"/client-gallery-2026/img-6692.jpeg",
				alt: "Bride seated in a lace long-sleeve gown by a window",
			},
			{
				localPath: "/client-gallery-2026/img-6693.jpeg",
				sourceUrl:
					"/client-gallery-2026/img-6693.jpeg",
				alt: "Bride standing in a fitted gown with cathedral veil",
			},
			{
				localPath: "/client-gallery-2026/img-6694.jpeg",
				sourceUrl:
					"/client-gallery-2026/img-6694.jpeg",
				alt: "Bride seated on a table in an embellished fitted gown",
			},
			{
				localPath: "/client-gallery-2026/img-6699.jpeg",
				sourceUrl:
					"/client-gallery-2026/img-6699.jpeg",
				alt: "Bride in an appliqued ballgown smiling in studio",
			},
			{
				localPath: "/client-gallery-2026/img-6704.jpeg",
				sourceUrl:
					"/client-gallery-2026/img-6704.jpeg",
				alt: "Bride in a floral appliqued ballgown in studio",
			},
		],
		collectionHighlights: {
			bridalDesigners: [
				{
					localPath: "/migration/legacy-site-images/bridal-sottero-midgley.png",
					sourceUrl:
						"/migration/legacy-site-images/bridal-sottero-midgley.png",
					alt: "Sottero and Midgley style bridal gown",
				},
				{
					localPath: "/migration/legacy-site-images/bridal-maggie.jpeg",
					sourceUrl:
						"/migration/legacy-site-images/bridal-maggie.jpeg",
					alt: "Maggie Sottero style bridal gown",
				},
				{
					localPath: "/migration/legacy-site-images/bridal-rebecca.jpeg",
					sourceUrl:
						"/migration/legacy-site-images/bridal-rebecca.jpeg",
					alt: "Rebecca Ingram style bridal gown",
				},
			],
			motherOfBride: {
				localPath: "/client-gallery-2026/img-6703.jpeg",
				sourceUrl:
					"/client-gallery-2026/img-6703.jpeg",
				alt: "Bridal corset gown detail",
			},
			accessories: {
				localPath: "/client-gallery-2026/img-6701.jpeg",
				sourceUrl:
					"/client-gallery-2026/img-6701.jpeg",
				alt: "Pearled bridal bodice detail",
			},
		},
	},
} as const;
