"use client";

import { FormEvent, useRef, useState } from "react";
import { AppointmentCalendarField } from "./appointment-calendar-field";

type ApiResponse = {
	ok?: boolean;
	message?: string;
	errors?: string[];
};

type StepId = 1 | 2 | 3;

const windows = [
	{ value: "weekday-morning", label: "Weekday Morning" },
	{ value: "weekday-afternoon", label: "Weekday Afternoon" },
	{ value: "weekday-evening", label: "Weekday Evening" },
	{ value: "saturday-morning", label: "Saturday Morning" },
	{ value: "saturday-afternoon", label: "Saturday Afternoon" },
	{ value: "flexible", label: "Flexible" },
] as const;

const shoppingFocusOptions = [
	{ value: "bridal-gown", label: "Bridal Gown" },
	{ value: "mother-of-bride", label: "Mother of the Bride" },
	{ value: "accessories", label: "Accessories" },
	{ value: "special-occasion", label: "Special Occasion" },
	{ value: "not-sure", label: "Not Sure Yet" },
] as const;

const timelineOptions = [
	{ value: "asap", label: "As soon as possible" },
	{ value: "1-3-months", label: "1 to 3 months out" },
	{ value: "4-6-months", label: "4 to 6 months out" },
	{ value: "7-12-months", label: "7 to 12 months out" },
	{ value: "over-12-months", label: "More than 12 months out" },
	{ value: "just-browsing", label: "Just browsing for now" },
] as const;

const budgetRanges = [
	{ value: "under-1500", label: "Under $1,500" },
	{ value: "1500-2500", label: "$1,500 to $2,500" },
	{ value: "2500-4000", label: "$2,500 to $4,000" },
	{ value: "4000-plus", label: "$4,000+" },
	{ value: "not-sure", label: "Not sure yet" },
] as const;

const fieldClass =
	"mt-2 w-full border border-[color:var(--line-subtle)] bg-white px-3 py-2 text-sm text-[color:var(--ink-900)] outline-none transition focus:border-[color:var(--ink-900)]";
const labelClass =
	"text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]";

function countSelectedFiles(formData: FormData, fieldName: string): number {
	return formData
		.getAll(fieldName)
		.filter(entry => entry instanceof File && entry.size > 0).length;
}

export function AppointmentRequestForm() {
	const formRef = useRef<HTMLFormElement>(null);

	const [currentStep, setCurrentStep] = useState<StepId>(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [preferredDate, setPreferredDate] = useState("");
	const [preferredDateError, setPreferredDateError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [errorList, setErrorList] = useState<string[]>([]);

	function validateStep1(): boolean {
		const form = formRef.current;
		if (!form) return false;

		const controls = [
			"fullName",
			"email",
			"phone",
			"shoppingFocus",
			"preferredWindow",
			"timeline",
		] as const;

		for (const controlName of controls) {
			const field = form.elements.namedItem(controlName);
			const asInput =
				field instanceof HTMLInputElement ||
				field instanceof HTMLSelectElement ||
				field instanceof HTMLTextAreaElement
					? field
					: null;
			if (!asInput) continue;
			if (!asInput.checkValidity()) {
				asInput.reportValidity();
				asInput.focus();
				return false;
			}
		}

		if (!preferredDate) {
			setPreferredDateError("Please choose your preferred appointment date.");
			setErrorMessage("Please choose your preferred appointment date.");
			return false;
		}

		setPreferredDateError("");
		return true;
	}

	function validateStep2(): boolean {
		const form = formRef.current;
		if (!form) return false;

		const streetSize = form.elements.namedItem("streetSizeApprox");
		if (streetSize instanceof HTMLInputElement && !streetSize.checkValidity()) {
			streetSize.reportValidity();
			streetSize.focus();
			return false;
		}

		const formData = new FormData(form);
		const bridePhotoCount = countSelectedFiles(
			formData,
			"brideInspirationPhotos",
		);
		const motherOfBridePhotoCount = countSelectedFiles(
			formData,
			"motherOfBrideInspirationPhotos",
		);
		const motherOfGroomPhotoCount = countSelectedFiles(
			formData,
			"motherOfGroomInspirationPhotos",
		);

		if (bridePhotoCount < 1) {
			setErrorMessage("Please upload at least one bridal inspiration photo.");
			return false;
		}

		if (motherOfBridePhotoCount + motherOfGroomPhotoCount < 1) {
			setErrorMessage(
				"Please upload inspiration photos for the mother of the bride and/or mother of the groom.",
			);
			return false;
		}

		return true;
	}

	function goToStep(nextStep: StepId) {
		setErrorMessage("");
		setErrorList([]);

		if (nextStep === 2 && !validateStep1()) return;
		if (nextStep === 3 && (!validateStep1() || !validateStep2())) return;

		setCurrentStep(nextStep);
	}

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSubmitting) return;

		setIsSubmitting(true);
		setSuccessMessage("");
		setErrorMessage("");
		setErrorList([]);
		setPreferredDateError("");

		if (!validateStep1()) {
			setCurrentStep(1);
			setIsSubmitting(false);
			return;
		}

		if (!validateStep2()) {
			setCurrentStep(2);
			setIsSubmitting(false);
			return;
		}

		const formData = new FormData(event.currentTarget);
		formData.set("preferredDate", preferredDate);

		try {
			const response = await fetch("/api/appointment-request", {
				method: "POST",
				body: formData,
			});

			const json = (await response.json()) as ApiResponse;
			if (!response.ok || !json.ok) {
				setErrorMessage(
					json.message ??
						"Something went wrong while sending your appointment request.",
				);
				setErrorList(json.errors ?? []);
				setCurrentStep(3);
				setIsSubmitting(false);
				return;
			}

			event.currentTarget.reset();
			setPreferredDate("");
			setCurrentStep(1);
			setSuccessMessage(
				json.message ??
					"Appointment request received. We'll follow up with you shortly.",
			);
		} catch {
			setErrorMessage(
				"We couldn't send your appointment request right now. Please try again.",
			);
			setCurrentStep(3);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form ref={formRef} onSubmit={onSubmit} className="be-card p-6 sm:p-7">
			<input
				type="text"
				name="website"
				tabIndex={-1}
				autoComplete="off"
				className="hidden"
				aria-hidden="true"
			/>

			<section>
				<p className="be-kicker">Step 1</p>
				<h2 className="mt-2 text-2xl leading-tight">
					Appointment Details
				</h2>
				<p className="mt-3 text-sm leading-7 text-[color:var(--ink-700)]">
					Share the essentials so the boutique can review availability and
					prepare the right experience for you.
				</p>

				<div className="mt-5 grid gap-5 md:grid-cols-2">
					<div>
						<label htmlFor="fullName" className={labelClass}>
							Full Name *
						</label>
						<input
							id="fullName"
							name="fullName"
							type="text"
							required
							autoComplete="name"
							className={fieldClass}
						/>
					</div>

					<div>
						<label htmlFor="email" className={labelClass}>
							Email *
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							autoComplete="email"
							className={fieldClass}
						/>
					</div>

					<div>
						<label htmlFor="phone" className={labelClass}>
							Phone *
						</label>
						<input
							id="phone"
							name="phone"
							type="tel"
							required
							autoComplete="tel"
							className={fieldClass}
						/>
					</div>

					<div>
						<label htmlFor="shoppingFocus" className={labelClass}>
							Shopping For *
						</label>
						<select
							id="shoppingFocus"
							name="shoppingFocus"
							required
							defaultValue=""
							className={fieldClass}
						>
							<option value="" disabled>
								Select one
							</option>
							{shoppingFocusOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div className="md:col-span-2">
						<AppointmentCalendarField
							id="preferredDate"
							name="preferredDate"
							label="Preferred Appointment Date"
							required
							value={preferredDate}
							onChange={nextValue => {
								setPreferredDate(nextValue);
								setPreferredDateError("");
							}}
						/>
						{preferredDateError ? (
							<p className="mt-2 text-xs uppercase tracking-[0.12em] text-red-700">
								{preferredDateError}
							</p>
						) : null}
					</div>

					<div>
						<label htmlFor="preferredWindow" className={labelClass}>
							Preferred Time Window *
						</label>
						<select
							id="preferredWindow"
							name="preferredWindow"
							required
							defaultValue=""
							className={fieldClass}
						>
							<option value="" disabled>
								Select a window
							</option>
							{windows.map(window => (
								<option key={window.value} value={window.value}>
									{window.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label htmlFor="timeline" className={labelClass}>
							Purchase Timeline *
						</label>
						<select
							id="timeline"
							name="timeline"
							required
							defaultValue=""
							className={fieldClass}
						>
							<option value="" disabled>
								Select timeline
							</option>
							{timelineOptions.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label htmlFor="weddingDate" className={labelClass}>
							Event / Wedding Date
						</label>
						<input
							id="weddingDate"
							name="weddingDate"
							type="date"
							className={fieldClass}
						/>
					</div>

					<div>
						<label htmlFor="guestCount" className={labelClass}>
							Guests Bringing (0-6)
						</label>
						<input
							id="guestCount"
							name="guestCount"
							type="number"
							min={0}
							max={6}
							step={1}
							className={fieldClass}
						/>
					</div>
				</div>

				<div className="mt-6 flex justify-end">
					<button
						type="button"
						onClick={() => goToStep(2)}
						className="be-btn be-btn-primary"
					>
						Continue To Style Profile
					</button>
				</div>
			</section>

			<section
				className={`${currentStep === 2 ? "" : "hidden"} mt-8 border-t border-[color:var(--line-subtle)] pt-7`}
			>
				<p className="be-kicker">Step 2</p>
				<h2 className="mt-2 text-2xl leading-tight">
					Style Profile + Required Inspiration Uploads
				</h2>

				<div className="mt-5 grid gap-5 md:grid-cols-2">
					<div>
						<label htmlFor="streetSizeApprox" className={labelClass}>
							Approximate Street Size *
						</label>
						<input
							id="streetSizeApprox"
							name="streetSizeApprox"
							type="text"
							required
							maxLength={24}
							placeholder="e.g., 8 / 10 / 12"
							className={fieldClass}
						/>
					</div>

					<div>
						<label htmlFor="budgetRange" className={labelClass}>
							Estimated Budget Range
						</label>
						<select
							id="budgetRange"
							name="budgetRange"
							defaultValue=""
							className={fieldClass}
						>
							<option value="">Prefer not to say</option>
							{budgetRanges.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</div>

					<div>
						<label htmlFor="preferredDesigners" className={labelClass}>
							Designers / Styles You Like
						</label>
						<input
							id="preferredDesigners"
							name="preferredDesigners"
							type="text"
							maxLength={200}
							placeholder="Maggie Sottero, fitted silhouette, sleeves, etc."
							className={fieldClass}
						/>
					</div>

					<div>
						<label htmlFor="instagramHandle" className={labelClass}>
							Instagram Handle (Optional)
						</label>
						<input
							id="instagramHandle"
							name="instagramHandle"
							type="text"
							maxLength={80}
							placeholder="@yourhandle"
							className={fieldClass}
						/>
					</div>

					<div className="md:col-span-2">
						<p className={labelClass}>Preferred Contact Method *</p>
						<div className="mt-2 flex flex-wrap gap-4 text-sm text-[color:var(--ink-700)]">
							<label className="inline-flex items-center gap-2">
								<input
									type="radio"
									name="contactPreference"
									value="email"
									defaultChecked
								/>
								Email
							</label>
							<label className="inline-flex items-center gap-2">
								<input
									type="radio"
									name="contactPreference"
									value="phone"
								/>
								Phone
							</label>
							<label className="inline-flex items-center gap-2">
								<input
									type="radio"
									name="contactPreference"
									value="text"
								/>
								Text
							</label>
						</div>
					</div>
				</div>

				<div className="mt-5 grid gap-5 md:grid-cols-3">
					<div>
						<label htmlFor="brideInspirationPhotos" className={labelClass}>
							Bride Inspiration Photos *
						</label>
						<input
							id="brideInspirationPhotos"
							name="brideInspirationPhotos"
							type="file"
							required
							accept="image/*"
							multiple
							className={fieldClass}
						/>
						<p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-500)]">
							Required: upload at least one image.
						</p>
					</div>

					<div>
						<label
							htmlFor="motherOfBrideInspirationPhotos"
							className={labelClass}
						>
							Mother Of The Bride Inspiration
						</label>
						<input
							id="motherOfBrideInspirationPhotos"
							name="motherOfBrideInspirationPhotos"
							type="file"
							accept="image/*"
							multiple
							className={fieldClass}
						/>
					</div>

					<div>
						<label
							htmlFor="motherOfGroomInspirationPhotos"
							className={labelClass}
						>
							Mother Of The Groom Inspiration
						</label>
						<input
							id="motherOfGroomInspirationPhotos"
							name="motherOfGroomInspirationPhotos"
							type="file"
							accept="image/*"
							multiple
							className={fieldClass}
						/>
						<p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-500)]">
							Required: upload mother-of-bride and/or mother-of-groom inspiration.
						</p>
					</div>
				</div>

				<div className="mt-5">
					<label htmlFor="styleNotes" className={labelClass}>
						Style Notes
					</label>
					<textarea
						id="styleNotes"
						name="styleNotes"
						rows={5}
						maxLength={1000}
						placeholder="Silhouettes, designers, vibe, budget notes, or anything else we should know."
						className={fieldClass}
					/>
				</div>

				<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
					<button
						type="button"
						onClick={() => setCurrentStep(1)}
						className="be-btn be-btn-ghost"
					>
						Back
					</button>
					<button
						type="button"
						onClick={() => goToStep(3)}
						className="be-btn be-btn-primary"
					>
						Continue To Review
					</button>
				</div>
			</section>

			<section
				className={`${currentStep === 3 ? "" : "hidden"} mt-8 border-t border-[color:var(--line-subtle)] pt-7`}
			>
				<p className="be-kicker">Step 3</p>
				<h2 className="mt-2 text-2xl leading-tight">
					Review + Submit Request
				</h2>
				<p className="mt-3 text-sm leading-7 text-[color:var(--ink-700)]">
					No payment is collected online at this stage. Once you submit, the
					boutique receives your details and inspiration photos, then follows
					up directly by phone, text, or email to confirm next steps.
				</p>

				<div className="mt-5 grid gap-3 border border-[color:var(--line-subtle)] bg-[color:var(--surface-soft)] p-4 text-sm leading-7 text-[color:var(--ink-700)]">
					<p>Your request will include:</p>
					<p>- preferred date and time window</p>
					<p>- shopping focus, timeline, and size notes</p>
					<p>- bridal and family inspiration photos</p>
					<p>- your preferred follow-up method</p>
				</div>

				<label className="mt-6 flex items-start gap-3 text-xs leading-6 text-[color:var(--ink-700)]">
					<input
						name="policyAccepted"
						type="checkbox"
						required
						className="mt-1 h-4 w-4"
					/>
					I understand this is an appointment request and the boutique will
					confirm my final date and time directly.
				</label>

				<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
					<button
						type="button"
						onClick={() => setCurrentStep(2)}
						className="be-btn be-btn-ghost"
					>
						Back
					</button>
					<div className="flex items-center gap-3">
						<button
							type="submit"
							disabled={isSubmitting}
							className="be-btn be-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting
								? "Submitting..."
								: "Submit Appointment Request"}
						</button>
						<p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
							Manual Confirmation
						</p>
					</div>
				</div>
			</section>

			{successMessage ? (
				<p className="mt-5 border border-[color:var(--line-subtle)] bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--ink-900)]">
					{successMessage}
				</p>
			) : null}

			{errorMessage ? (
				<div className="mt-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
					<p>{errorMessage}</p>
					{errorList.length > 0 ? (
						<ul className="mt-2 list-disc pl-5">
							{errorList.map(item => (
								<li key={item}>{item}</li>
							))}
						</ul>
					) : null}
				</div>
			) : null}
		</form>
	);
}
