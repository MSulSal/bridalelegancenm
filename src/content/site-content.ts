import { legacySiteContent } from "@/content/migration/legacy-site/legacy-content";

export const homeContent = {
	hero: {
		title: "Bridal Elegance NM",
		supportLine: legacySiteContent.business.authorizedLine,
		secondaryCtaLabel: "View Bridal Gowns",
	},
	aboutPreview: {
		kicker: "Showroom Experience",
		copy: "A calm, one-on-one consultation experience shaped around your timeline and style preferences.",
	},
	homeGallery: legacySiteContent.imageLibrary.homeGallery,
	collectionSection: {
		heading: {
			eyebrow: "Collections",
			title: "Bridal Gowns",
			description:
				"Curated designer collections presented with a modern editorial boutique experience.",
		},
		items: [
			{
				title: "Sottero and Midgley",
				copy: "Designer wedding gowns carried through our authorized salon relationship.",
				tag: "Bridal Designer",
				href: legacySiteContent.externalLinks.bridalDesigners[0].href,
				homeImagePosition: "96% 34%",
				image: legacySiteContent.imageLibrary.collectionHighlights
					.bridalDesigners[0],
			},
			{
				title: "Maggie Sottero",
				copy: "Wedding gown collection from Maggie Sottero.",
				tag: "Bridal Designer",
				href: legacySiteContent.externalLinks.bridalDesigners[1].href,
				homeImagePosition: "4% 42%",
				image: legacySiteContent.imageLibrary.collectionHighlights
					.bridalDesigners[1],
			},
			{
				title: "Rebecca Ingram",
				copy: "Wedding gown collection from Rebecca Ingram.",
				tag: "Bridal Designer",
				href: legacySiteContent.externalLinks.bridalDesigners[2].href,
				homeImagePosition: "100% 42%",
				image: legacySiteContent.imageLibrary.collectionHighlights
					.bridalDesigners[2],
			},
		],
	},
	spotlightSection: {
		heading: {
			eyebrow: "Boutique Highlights",
			title: "Finishing Touches And An Appointment-First Experience",
			description:
				"Everything is designed to make each visit feel polished, focused, and easy to navigate.",
		},
		ctaLabel: "Book Styling Appointment",
		items: [
			{
				title: "Accessories",
				copy: "Bel Aire Bridal veils and headpieces to complete your look.",
				ctaLabel: "View Collection",
				href: "/accessories",
				image: legacySiteContent.imageLibrary.collectionHighlights
					.accessories,
			},
			{
				title: "Appointment-Only Experience",
				copy: "Personalized in-store guidance with direct boutique confirmation.",
				ctaLabel: "Book Appointment",
				href: "/book-appointment",
				image: legacySiteContent.imageLibrary.homeGallery[5],
			},
		],
	},
	journeySection: {
		heading: {
			eyebrow: "Boutique Journey",
			title: "A Personal Appointment-First Process",
			description:
				"Built around high-touch consultation and confident next-step guidance.",
		},
		steps: [
			{
				step: "01",
				title: "Send Appointment Request",
				body: "Share your timeline, style direction, and preferred appointment windows.",
			},
			{
				step: "02",
				title: "Availability Confirmation",
				body: "Our team confirms by text based on boutique availability.",
			},
			{
				step: "03",
				title: "Guided Try-On Session",
				body: "Receive one-on-one support with curated gowns and styling direction.",
			},
			{
				step: "04",
				title: "Plan Next Steps",
				body: "Leave with clear recommendations for ordering, styling, and follow-up.",
			},
		],
	},
	appointmentSection: {
		heading: {
			eyebrow: "Contact + Booking",
			title: "Appointment-Only Service",
			description: "",
		},
		promises: [
			"Now welcoming appointments in Albuquerque, north of Sawmill District and Old Town.",
			`Text us: ${legacySiteContent.business.phoneDisplay}`,
			"Instagram: @bridalelegancenm",
		],
	},
} as const;

export const accessoriesPageContent = {
	metadata: {
		title: "Accessories",
		description:
			"Explore accessory styling direction from Bridal Elegance NM, including veils and finishing pieces.",
	},
	heading: {
		eyebrow: "Finishing Pieces",
		title: "Accessories",
		description:
			"Complete your bridal look with thoughtful finishing pieces selected to complement your gown.",
	},
	summary:
		"From veils to detail pieces, we help align your accessories with silhouette, venue, and overall style direction.",
	featurePoints: [
		"Styling guidance matched to your gown profile.",
		"Veil and detail-piece recommendations in appointment.",
		"Balanced finishing touches for a cohesive look.",
	],
	previewImage: legacySiteContent.imageLibrary.collectionHighlights.accessories,
	externalCollection: legacySiteContent.externalLinks.accessories,
} as const;

export const appointmentPageContent = {
	metadata: {
		title: "Book Appointment",
		description:
			"Request a bridal appointment with Bridal Elegance in Albuquerque, north of Sawmill District and Old Town. Our team confirms availability directly by phone or email.",
	},
	heading: {
		eyebrow: "Book Appointment",
		title: "Request Your Bridal Appointment",
		description:
			"Appointment-only service in Albuquerque, north of Sawmill District and Old Town. Submit your request and our team confirms directly.",
	},
	experienceCard: {
		kicker: "Showroom Experience",
		title: "Personal, calm, and intentionally guided.",
		points: [
			legacySiteContent.business.authorizedLine,
			legacySiteContent.business.welcomeParagraphs[0],
			legacySiteContent.business.welcomeParagraphs[1],
		],
	},
	prepareCard: {
		kicker: "Before You Submit",
		title: "Bring These Details",
		points: [
			"Wedding date or estimated timeline.",
			"Preferred appointment days and times.",
			`Phone: ${legacySiteContent.business.phoneDisplay}`,
			legacySiteContent.business.showroomUpdate,
		],
	},
} as const;
