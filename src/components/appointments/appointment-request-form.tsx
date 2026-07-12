"use client";

import { FormEvent, useRef, useState } from "react";
import { AppointmentCalendarField } from "./appointment-calendar-field";

type ApiResponse = {
	ok?: boolean;
	message?: string;
	errors?: string[];
};

const timelineOptions = [
	{ value: "asap", label: "As soon as possible" },
	{ value: "1-3-months", label: "1 to 3 months out" },
	{ value: "4-6-months", label: "4 to 6 months out" },
	{ value: "7-12-months", label: "7 to 12 months out" },
	{ value: "over-12-months", label: "More than 12 months out" },
	{ value: "just-browsing", label: "Just browsing for now" },
] as const;

const budgetRanges = [
	{ value: "500-1000", label: "$500 to $1,000" },
	{ value: "1500-2500", label: "$1,500 to $2,500" },
	{ value: "2500-3000", label: "$2,500 to $3,000" },
	{ value: "3000-plus", label: "$3,000+" },
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

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [preferredDate, setPreferredDate] = useState("");
	const [preferredDateError, setPreferredDateError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [errorList, setErrorList] = useState<string[]>([]);

	function validateForm(): boolean {
		const form = formRef.current;
		if (!form) return false;

		const controls = [
			"fullName",
			"email",
			"phone",
			"streetSizeApprox",
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

		const formData = new FormData(form);
		const bridePhotoCount = countSelectedFiles(
			formData,
			"brideInspirationPhotos",
		);

		if (bridePhotoCount < 1) {
			setErrorMessage("Please upload at least one bridal inspiration photo.");
			return false;
		}

		setPreferredDateError("");
		return true;
	}

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSubmitting) return;

		setIsSubmitting(true);
		setSuccessMessage("");
		setErrorMessage("");
		setErrorList([]);
		setPreferredDateError("");

		if (!validateForm()) {
			setIsSubmitting(false);
			return;
		}

		const formData = new FormData(event.currentTarget);
		formData.set("preferredDate", preferredDate);
		formData.set("shoppingFocus", "bridal-gown");

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
				setIsSubmitting(false);
				return;
			}

			event.currentTarget.reset();
			setPreferredDate("");
			setSuccessMessage(
				json.message ??
					"Appointment request received. We'll follow up with you shortly.",
			);
		} catch {
			setErrorMessage(
				"We couldn't send your appointment request right now. Please try again.",
			);
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

			<input type="hidden" name="shoppingFocus" value="bridal-gown" />

			<div>
				<p className="be-kicker">Bridal Appointment Request</p>
				<h2 className="mt-2 text-2xl leading-tight">
					Tell us a little about your appointment.
				</h2>
				<p className="mt-3 text-sm leading-7 text-[color:var(--ink-700)]">
					This form is for bridal gown appointments. Submit your details, share
					at least one inspiration image, choose from open appointment dates,
					and we&apos;ll confirm the exact time directly.
				</p>
			</div>

			<div className="mt-6 grid gap-5 md:grid-cols-2">
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
					<label htmlFor="guestCount" className={labelClass}>
						Guests Bringing (0-4)
					</label>
					<input
						id="guestCount"
						name="guestCount"
						type="number"
						min={0}
						max={4}
						step={1}
						className={fieldClass}
					/>
					<p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-[color:var(--ink-500)]">
						Up to 4 guests for now.
					</p>
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
						Wedding Date
					</label>
					<input
						id="weddingDate"
						name="weddingDate"
						type="date"
						className={fieldClass}
					/>
				</div>

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
						defaultValue="500-1000"
						className={fieldClass}
					>
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
						Instagram Handle
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
							<input type="radio" name="contactPreference" value="phone" />
							Phone
						</label>
						<label className="inline-flex items-center gap-2">
							<input type="radio" name="contactPreference" value="text" />
							Text
						</label>
					</div>
				</div>

				<div className="md:col-span-2">
					<label htmlFor="brideInspirationPhotos" className={labelClass}>
						Bridal Inspiration Photos *
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
						Upload at least one inspiration image using this single upload field.
					</p>
				</div>

				<div className="md:col-span-2">
					<label htmlFor="styleNotes" className={labelClass}>
						Style Notes
					</label>
					<textarea
						id="styleNotes"
						name="styleNotes"
						rows={5}
						maxLength={1000}
						placeholder="Silhouettes, designers, vibe, sleeve preferences, or anything else we should know."
						className={fieldClass}
					/>
				</div>
			</div>

			<div className="mt-6 border border-[color:var(--line-subtle)] bg-[color:var(--surface-soft)] p-4 text-sm leading-7 text-[color:var(--ink-700)]">
				<p>
					We&apos;ll review your request, confirm availability directly, and reach
					out by your preferred contact method.
				</p>
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
				<p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
					Manual Confirmation
				</p>
				<button
					type="submit"
					disabled={isSubmitting}
					className="be-btn be-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isSubmitting ? "Submitting..." : "Submit Appointment Request"}
				</button>
			</div>

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
