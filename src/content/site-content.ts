export const homeContent = {
	hero: {
		title: "A Bridal Website Experience Designed To Make Booking Feel Obvious.",
		description:
			"Inspired by top bridal experiences without copying them, this direction prioritizes couture atmosphere, image-led storytelling, and strong appointment conversion.",
		secondaryCtaLabel: "Explore Collections",
	},
	aboutPreview: {
		kicker: "Showroom Experience",
		copy: "Classy, calm, appointment-first bridal service from first contact.",
	},
	collectionSection: {
		heading: {
			eyebrow: "Collections Direction",
			title: "A Premium Browsing Feel, Not A Generic Local Brochure",
			description:
				"These category blocks establish the visual rhythm for future collection and designer pages.",
		},
		items: [
			{
				title: "Romantic Classics",
				copy: "Timeless silhouettes with modern shaping for elegant bridal portraits.",
				tag: "Soft Structure",
			},
			{
				title: "Contemporary Minimal",
				copy: "Sculptural gowns with clean lines and couture-level fabric movement.",
				tag: "Modern Edit",
			},
			{
				title: "Statement Glamour",
				copy: "High-impact detailing for brides who want unforgettable entrance energy.",
				tag: "Couture Drama",
			},
		],
	},
	spotlightSection: {
		heading: {
			eyebrow: "Editorial Strategy",
			title: "Designer Spotlights Built For Bridal SEO + Storytelling",
			description:
				"Content architecture mirrors premium bridal editorial patterns while staying fully original.",
		},
		ctaLabel: "Book Styling Appointment",
		items: [
			{
				title: "Silhouette Spotlight",
				copy: "How to choose a shape that complements venue, movement, and comfort.",
			},
			{
				title: "Fabric Spotlight",
				copy: "Texture, drape, and sheen explained in a bride-friendly editorial format.",
			},
			{
				title: "Styling Spotlight",
				copy: "How veil, accessories, and neckline decisions create a cohesive bridal look.",
			},
		],
	},
	journeySection: {
		heading: {
			eyebrow: "Boutique Journey",
			title: "A Structured Process That Feels Personal, Not Transactional",
			description:
				"This mirrors how a premium in-store experience should translate online.",
		},
		steps: [
			{
				step: "01",
				title: "Share Your Vision",
				body: "Tell us about venue, date, style preferences, and how you want to feel in your gown.",
			},
			{
				step: "02",
				title: "Curated Try-On",
				body: "Your appointment is guided with intentional dress pulls, not overwhelming rack browsing.",
			},
			{
				step: "03",
				title: "Refine The Look",
				body: "We narrow silhouettes, neckline direction, and styling options that suit your priorities.",
			},
			{
				step: "04",
				title: "Confirm Next Steps",
				body: "You leave with clarity on timeline, ordering path, and what happens after your request.",
			},
		],
	},
	appointmentSection: {
		heading: {
			eyebrow: "Appointment Conversion",
			title: "Make Booking Feel Premium From The First Click",
			description:
				"Request-based booking now, with controlled slot-based booking to follow.",
		},
		promises: [
			"One-on-one boutique guidance from first try-on to final direction.",
			"Clear, calm appointment pacing that feels premium from minute one.",
			"Personalized recommendations aligned to style, timeline, and vision.",
		],
	},
} as const;

export const appointmentPageContent = {
	metadata: {
		title: "Book Appointment",
		description:
			"Request a bridal appointment with Bridal Elegance NM. Our team confirms availability by email or phone.",
	},
	heading: {
		eyebrow: "Book Appointment",
		title: "Request Your Bridal Appointment",
		description:
			"Phase 1: submit your request and our team confirms availability directly by email or phone.",
	},
	experienceCard: {
		kicker: "Showroom Experience",
		title: "Personal, calm, and intentionally guided.",
		points: [
			"One-on-one stylist support in a calm showroom setting.",
			"Curated pulls based on your date, style, and priorities.",
			"Clear next steps after your appointment request is reviewed.",
		],
	},
	prepareCard: {
		kicker: "Before You Submit",
		title: "Bring These Details",
		points: [
			"Wedding date (or estimated timeline).",
			"Any inspiration photos or silhouettes you love.",
			"Preferred appointment days and times.",
			"How many guests you plan to bring.",
		],
	},
} as const;
