"use client";

import {
	FormEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	formatUsdFromCents,
	getDepositAmountCents,
} from "@/lib/appointments";
import { AppointmentCalendarField } from "./appointment-calendar-field";

type ApiResponse = {
	ok?: boolean;
	message?: string;
	errors?: string[];
};

type PaymentMethod = "card" | "apple-pay" | "google-pay" | "paypal";
type StepId = 1 | 2 | 3;

type SquareTokenizeResult = {
	status: string;
	token?: string;
	errors?: Array<{ message?: string }>;
};

type SquarePayMethodInstance = {
	attach: (selector: string) => Promise<void>;
	tokenize: (options?: unknown) => Promise<SquareTokenizeResult>;
	destroy?: () => Promise<void> | void;
};

type SquarePaymentsInstance = {
	card: (options?: {
		postalCode?: string;
		style?: Record<string, Record<string, string>>;
	}) => Promise<SquarePayMethodInstance>;
	paymentRequest: (options: {
		countryCode: string;
		currencyCode: string;
		total: { amount: string; label: string };
		requestBillingContact?: boolean;
		requestShippingContact?: boolean;
	}) => unknown;
	applePay: (paymentRequest: unknown) => Promise<SquarePayMethodInstance>;
	googlePay: (paymentRequest: unknown) => Promise<SquarePayMethodInstance>;
};

type SquareNamespace = {
	payments: (
		appId: string,
		locationId: string,
	) => SquarePaymentsInstance;
};

type SquareChargeResponse = {
	ok?: boolean;
	message?: string;
	errors?: string[];
	paymentId?: string;
	paymentStatus?: string;
	receiptUrl?: string;
	amountCents?: number;
	currency?: string;
	sourceType?: string;
	cardBrand?: string;
};

type CompletedSquarePayment = {
	method: Exclude<PaymentMethod, "paypal">;
	date: string;
	amountCents: number;
	paymentId: string;
	receiptUrl?: string;
	sourceType?: string;
};

function splitName(fullName: string): { givenName: string; familyName: string } {
	const chunks = fullName.trim().split(/\s+/).filter(Boolean);
	if (chunks.length === 0) return { givenName: "", familyName: "" };
	if (chunks.length === 1) return { givenName: chunks[0], familyName: "" };
	return {
		givenName: chunks[0],
		familyName: chunks.slice(1).join(" "),
	};
}

declare global {
	interface Window {
		Square?: SquareNamespace;
	}
}

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldClass =
	"mt-2 w-full border border-[color:var(--line-subtle)] bg-white px-3 py-2 text-sm text-[color:var(--ink-900)] outline-none transition focus:border-[color:var(--ink-900)]";
const labelClass =
	"text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]";

let squareScriptPromise: Promise<void> | null = null;

function countSelectedFiles(formData: FormData, fieldName: string): number {
	return formData
		.getAll(fieldName)
		.filter(entry => entry instanceof File && entry.size > 0).length;
}

function getSquareScriptUrl(): string {
	const env =
		(process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT ?? "production")
			.trim()
			.toLowerCase() || "production";

	return env === "sandbox"
		? "https://sandbox.web.squarecdn.com/v1/square.js"
		: "https://web.squarecdn.com/v1/square.js";
}

async function ensureSquareSdkLoaded(): Promise<void> {
	if (typeof window === "undefined") return;
	if (window.Square?.payments) return;

	if (!squareScriptPromise) {
		squareScriptPromise = new Promise<void>((resolve, reject) => {
			const existing = document.querySelector<HTMLScriptElement>(
				`script[src="${getSquareScriptUrl()}"]`,
			);

			if (existing) {
				existing.addEventListener("load", () => resolve(), {
					once: true,
				});
				existing.addEventListener(
					"error",
					() => reject(new Error("Failed to load Square SDK.")),
					{ once: true },
				);
				return;
			}

			const script = document.createElement("script");
			script.src = getSquareScriptUrl();
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () =>
				reject(new Error("Failed to load Square SDK."));
			document.head.appendChild(script);
		});
	}

	await squareScriptPromise;

	if (!window.Square?.payments) {
		throw new Error("Square SDK did not initialize correctly.");
	}
}

function getSquareErrorMessage(errors?: Array<{ message?: string }>): string {
	const message = errors?.find(item => item.message?.trim())?.message?.trim();
	return message || "Square payment could not be completed.";
}

export function AppointmentRequestForm() {
	const formRef = useRef<HTMLFormElement>(null);
	const squarePaymentsRef = useRef<SquarePaymentsInstance | null>(null);
	const squareMethodRef = useRef<SquarePayMethodInstance | null>(null);
	const attachedSquareKeyRef = useRef<string>("");

	const [currentStep, setCurrentStep] = useState<StepId>(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [preferredDate, setPreferredDate] = useState("");
	const [preferredDateError, setPreferredDateError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [errorList, setErrorList] = useState<string[]>([]);

	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
	const [cardholderName, setCardholderName] = useState("");
	const [billingPostalCode, setBillingPostalCode] = useState("");
	const [billingAddressLine1, setBillingAddressLine1] = useState("");
	const [billingAddressLine2, setBillingAddressLine2] = useState("");
	const [billingCity, setBillingCity] = useState("");
	const [billingState, setBillingState] = useState("");
	const [isProcessingSquarePayment, setIsProcessingSquarePayment] =
		useState(false);
	const [squarePaymentError, setSquarePaymentError] = useState("");
	const [squarePaymentSuccess, setSquarePaymentSuccess] = useState("");
	const [completedSquarePayment, setCompletedSquarePayment] =
		useState<CompletedSquarePayment | null>(null);
	const [walletSupport, setWalletSupport] = useState({
		applePay: true,
		googlePay: true,
	});

	const depositAmountCents = useMemo(
		() => getDepositAmountCents(preferredDate),
		[preferredDate],
	);
	const depositAmountLabel = useMemo(
		() => formatUsdFromCents(depositAmountCents),
		[depositAmountCents],
	);

	const isSquareMethod =
		paymentMethod === "card" ||
		paymentMethod === "apple-pay" ||
		paymentMethod === "google-pay";
	const isCompletedSquarePaymentValid = useMemo(() => {
		if (!completedSquarePayment) return false;
		return (
			completedSquarePayment.method === paymentMethod &&
			completedSquarePayment.date === preferredDate &&
			completedSquarePayment.amountCents === depositAmountCents
		);
	}, [
		completedSquarePayment,
		paymentMethod,
		preferredDate,
		depositAmountCents,
	]);

	const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
		setPaymentMethod(method);
		setSquarePaymentError("");
		setSquarePaymentSuccess("");
		setCompletedSquarePayment(null);
	}, []);

	const resetSquareMethod = useCallback(async (): Promise<void> => {
		const instance = squareMethodRef.current;
		squareMethodRef.current = null;
		attachedSquareKeyRef.current = "";
		if (instance?.destroy) {
			await instance.destroy();
		}
	}, []);

	const getSquarePaymentsInstance = useCallback(
		async (): Promise<SquarePaymentsInstance> => {
		if (squarePaymentsRef.current) {
			return squarePaymentsRef.current;
		}

		const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID?.trim();
		const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID?.trim();

		if (!appId || !locationId) {
			throw new Error(
				"Square public config missing. Set NEXT_PUBLIC_SQUARE_APP_ID and NEXT_PUBLIC_SQUARE_LOCATION_ID.",
			);
		}

		await ensureSquareSdkLoaded();
		if (!window.Square?.payments) {
			throw new Error("Square SDK is unavailable.");
		}

		squarePaymentsRef.current = window.Square.payments(appId, locationId);
		return squarePaymentsRef.current;
	},
	[],
	);

	const ensureSquareMethod = useCallback(async (
		method: Exclude<PaymentMethod, "paypal">,
		amountCents: number,
	): Promise<SquarePayMethodInstance> => {
		const methodKey = `${method}:${amountCents}:${billingPostalCode}`;
		if (squareMethodRef.current && attachedSquareKeyRef.current === methodKey) {
			return squareMethodRef.current;
		}

		await resetSquareMethod();

		const payments = await getSquarePaymentsInstance();
		const container = document.getElementById("square-payment-container");
		if (!container) {
			throw new Error("Square payment area is unavailable.");
		}
		container.innerHTML = "";

		let squareMethod: SquarePayMethodInstance;
		if (method === "card") {
			squareMethod = await payments.card({
				postalCode: billingPostalCode || undefined,
				style: {
					input: {
						fontFamily: "Manrope, Segoe UI, sans-serif",
						fontSize: "16px",
						lineHeight: "24px",
						color: "#1f2937",
					},
				},
			});
		} else {
			const paymentRequest = payments.paymentRequest({
				countryCode: "US",
				currencyCode: "USD",
				total: {
					amount: (amountCents / 100).toFixed(2),
					label: "Bridal Appointment Deposit",
				},
				requestBillingContact: true,
				requestShippingContact: false,
			});

			squareMethod =
				method === "apple-pay"
					? await payments.applePay(paymentRequest)
					: await payments.googlePay(paymentRequest);
		}

		await squareMethod.attach("#square-payment-container");
		squareMethodRef.current = squareMethod;
		attachedSquareKeyRef.current = methodKey;
		return squareMethod;
	}, [billingPostalCode, getSquarePaymentsInstance, resetSquareMethod]);

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

	async function onProcessSquarePayment() {
		if (!isSquareMethod || isProcessingSquarePayment || isSubmitting) return;

		setSquarePaymentError("");
		setSquarePaymentSuccess("");
		setErrorMessage("");
		setErrorList([]);

		if (!preferredDate) {
			setPreferredDateError("Choose an appointment date before payment.");
			setSquarePaymentError("Please choose an appointment date first.");
			return;
		}

		const form = formRef.current;
		if (!form) return;

		const formData = new FormData(form);
		const fullName = String(formData.get("fullName") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim().toLowerCase();
		const phone = String(formData.get("phone") ?? "").trim();

		if (fullName.length < 2 || !emailPattern.test(email) || phone.length < 7) {
			setSquarePaymentError(
				"Please complete name, email, and phone before payment.",
			);
			return;
		}
		if (paymentMethod === "card" && cardholderName.trim().length < 2) {
			setSquarePaymentError("Please enter the cardholder name.");
			return;
		}
		if (paymentMethod === "card" && billingAddressLine1.trim().length < 3) {
			setSquarePaymentError("Please enter the billing street address.");
			return;
		}
		if (paymentMethod === "card" && billingCity.trim().length < 2) {
			setSquarePaymentError("Please enter the billing city.");
			return;
		}
		if (paymentMethod === "card" && billingState.trim().length < 2) {
			setSquarePaymentError("Please enter the billing state.");
			return;
		}
		if (paymentMethod === "card" && billingPostalCode.trim().length < 5) {
			setSquarePaymentError("Please enter the billing ZIP code.");
			return;
		}

		setIsProcessingSquarePayment(true);

		try {
			const squareMethod = await ensureSquareMethod(
				paymentMethod as Exclude<PaymentMethod, "paypal">,
				depositAmountCents,
			);

			const { givenName, familyName } = splitName(cardholderName || fullName);
			const tokenResult =
				paymentMethod === "card"
					? await squareMethod.tokenize({
							billing: {
								givenName,
								familyName: familyName || undefined,
								email,
								phone,
								countryCode: "US",
								addressLines: [
									billingAddressLine1.trim(),
									billingAddressLine2.trim(),
								].filter(Boolean),
								city: billingCity.trim() || undefined,
								state: billingState.trim() || undefined,
								postalCode: billingPostalCode || undefined,
							},
						})
					: await squareMethod.tokenize();
			if (tokenResult.status !== "OK" || !tokenResult.token) {
				throw new Error(getSquareErrorMessage(tokenResult.errors));
			}

			const response = await fetch("/api/appointments/payments/charge", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sourceId: tokenResult.token,
					preferredDate,
					fullName,
					email,
					phone,
					paymentMethod,
				}),
			});

			const json = (await response.json()) as SquareChargeResponse;
			if (!response.ok || !json.ok || !json.paymentId) {
				throw new Error(
					json.message ??
						json.errors?.[0] ??
						"Square could not complete payment.",
				);
			}

			setCompletedSquarePayment({
				method: paymentMethod,
				date: preferredDate,
				amountCents:
					typeof json.amountCents === "number"
						? json.amountCents
						: depositAmountCents,
				paymentId: json.paymentId,
				receiptUrl: json.receiptUrl || undefined,
				sourceType: json.sourceType || undefined,
			});
			setSquarePaymentSuccess(
				`Payment captured: ${depositAmountLabel}. You can now submit your appointment request.`,
			);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Payment failed. Please try again.";
			setSquarePaymentError(message);

			if (paymentMethod === "apple-pay" || paymentMethod === "google-pay") {
				setWalletSupport(prev => ({
					...prev,
					[paymentMethod === "apple-pay" ? "applePay" : "googlePay"]: false,
				}));
				handlePaymentMethodChange("card");
			}
		} finally {
			setIsProcessingSquarePayment(false);
		}
	}

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSubmitting) return;

		setIsSubmitting(true);
		setSuccessMessage("");
		setErrorMessage("");
		setErrorList([]);
		setPreferredDateError("");
		setSquarePaymentError("");

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

		const form = event.currentTarget;
		const formData = new FormData(form);
		formData.set("preferredDate", preferredDate);
		formData.set("paymentMethod", paymentMethod);
		formData.set("squareAmountCents", String(depositAmountCents));

		if (isSquareMethod) {
			if (!isCompletedSquarePaymentValid || !completedSquarePayment) {
				setIsSubmitting(false);
				setErrorMessage(
					"Please complete the Square payment for the selected date before submitting.",
				);
				return;
			}

			const paid = completedSquarePayment;
			formData.set("squarePaymentId", paid.paymentId);
			formData.set("squareReceiptUrl", paid.receiptUrl ?? "");
			formData.set("squareSourceType", paid.sourceType ?? "");
		} else {
			const paypalPayerEmail = String(
				formData.get("paypalPayerEmail") ?? "",
			).trim();
			if (!emailPattern.test(paypalPayerEmail)) {
				setIsSubmitting(false);
				setErrorMessage("Please enter a valid PayPal email.");
				return;
			}
		}

		try {
			const response = await fetch("/api/appointment-request", {
				method: "POST",
				body: formData,
			});

			const json = (await response.json()) as ApiResponse;
			if (!response.ok || !json.ok) {
				setErrorMessage(
					json.message ??
						"We couldn't submit your request right now. Please try again.",
				);
				setErrorList(json.errors ?? []);

				const hasDateError = (json.errors ?? []).some(item =>
					item.toLowerCase().includes("appointment date"),
				);
				if (hasDateError) {
					setPreferredDateError("Please choose a valid appointment date.");
				}
				return;
			}

			form.reset();
			setCurrentStep(1);
			setPreferredDate("");
				setPaymentMethod("card");
				setCardholderName("");
				setBillingPostalCode("");
				setBillingAddressLine1("");
				setBillingAddressLine2("");
				setBillingCity("");
				setBillingState("");
				setCompletedSquarePayment(null);
				setSquarePaymentSuccess("");
				setSuccessMessage(
				json.message ??
					"Appointment request received. We will follow up shortly.",
			);
		} catch {
			setErrorMessage(
				"Network issue while submitting. Please retry in a moment.",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	useEffect(() => {
		if (currentStep !== 3 || !isSquareMethod) return;
		let cancelled = false;

		(async () => {
			try {
				await ensureSquareMethod(
					paymentMethod as Exclude<PaymentMethod, "paypal">,
					depositAmountCents,
				);
				if (cancelled) return;
			} catch (error) {
				if (cancelled) return;
				const message =
					error instanceof Error
						? error.message
						: "Unable to initialize payment method.";
				setSquarePaymentError(message);

				if (paymentMethod === "apple-pay" || paymentMethod === "google-pay") {
					setWalletSupport(prev => ({
						...prev,
						[paymentMethod === "apple-pay" ? "applePay" : "googlePay"]:
							false,
					}));
					handlePaymentMethodChange("card");
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [
		currentStep,
		isSquareMethod,
		paymentMethod,
		depositAmountCents,
		billingPostalCode,
		ensureSquareMethod,
		handlePaymentMethodChange,
	]);

	return (
		<form
			ref={formRef}
			onSubmit={onSubmit}
			encType="multipart/form-data"
			className="be-card relative p-6 sm:p-8"
		>
			<div
				className="absolute left-[-5000px] top-auto h-px w-px overflow-hidden"
				aria-hidden="true"
			>
				<label htmlFor="website">Website</label>
				<input
					id="website"
					name="website"
					type="text"
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			<div className="mb-6 border border-[color:var(--line-subtle)] bg-[color:var(--surface-soft)] p-4">
				<p className="be-kicker">Appointment Request Flow</p>
				<p className="mt-2 text-sm text-[color:var(--ink-700)]">
					Step {currentStep} of 3. Complete each section to continue.
				</p>
			</div>

			<section className={currentStep === 1 ? "" : "hidden"}>
				<p className="be-kicker">Step 1</p>
				<h2 className="mt-2 text-2xl leading-tight">Appointment Details</h2>

				<div className="mt-5 grid gap-5 md:grid-cols-2">
					<div>
						<label htmlFor="fullName" className={labelClass}>
							Your Name *
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
								setSquarePaymentSuccess("");
								setCompletedSquarePayment(null);
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
						Continue To Payment
					</button>
				</div>
			</section>

			<section
				className={`${currentStep === 3 ? "" : "hidden"} mt-8 border-t border-[color:var(--line-subtle)] pt-7`}
			>
				<p className="be-kicker">Step 3</p>
				<h2 className="mt-2 text-2xl leading-tight">Payment</h2>
				<p className="mt-3 text-sm leading-7 text-[color:var(--ink-700)]">
					Required deposit:{" "}
					<strong className="text-[color:var(--ink-900)]">
						{depositAmountLabel}
					</strong>{" "}
					({preferredDate ? "auto-calculated from selected day" : "weekdays $35, weekends $50"}).
				</p>

				<input type="hidden" name="paymentMethod" value={paymentMethod} readOnly />
				<input
					type="hidden"
					name="squarePaymentId"
					value={completedSquarePayment?.paymentId ?? ""}
					readOnly
				/>
				<input
					type="hidden"
					name="squareReceiptUrl"
					value={completedSquarePayment?.receiptUrl ?? ""}
					readOnly
				/>
				<input
					type="hidden"
					name="squareSourceType"
					value={completedSquarePayment?.sourceType ?? ""}
					readOnly
				/>
				<input
					type="hidden"
					name="squareAmountCents"
					value={String(completedSquarePayment?.amountCents ?? 0)}
					readOnly
				/>

				<div className="mt-5 grid gap-3 sm:grid-cols-2">
					<label className="flex items-center gap-3 border border-[color:var(--line-subtle)] px-3 py-2 text-sm">
						<input
							type="radio"
							name="paymentMethodChoice"
							value="card"
							checked={paymentMethod === "card"}
							onChange={() => handlePaymentMethodChange("card")}
						/>
						Credit / Debit Card
					</label>
					<label
						className={`flex items-center gap-3 border px-3 py-2 text-sm ${
							walletSupport.applePay
								? "border-[color:var(--line-subtle)]"
								: "cursor-not-allowed border-red-200 opacity-60"
						}`}
					>
						<input
							type="radio"
							name="paymentMethodChoice"
							value="apple-pay"
							checked={paymentMethod === "apple-pay"}
							disabled={!walletSupport.applePay}
							onChange={() => handlePaymentMethodChange("apple-pay")}
						/>
						Apple Pay
					</label>
					<label
						className={`flex items-center gap-3 border px-3 py-2 text-sm ${
							walletSupport.googlePay
								? "border-[color:var(--line-subtle)]"
								: "cursor-not-allowed border-red-200 opacity-60"
						}`}
					>
						<input
							type="radio"
							name="paymentMethodChoice"
							value="google-pay"
							checked={paymentMethod === "google-pay"}
							disabled={!walletSupport.googlePay}
							onChange={() => handlePaymentMethodChange("google-pay")}
						/>
						Google Pay
					</label>
					<label className="flex items-center gap-3 border border-[color:var(--line-subtle)] px-3 py-2 text-sm">
						<input
							type="radio"
							name="paymentMethodChoice"
							value="paypal"
							checked={paymentMethod === "paypal"}
							onChange={() => handlePaymentMethodChange("paypal")}
						/>
						PayPal
					</label>
				</div>

					{isSquareMethod ? (
						<div className="mt-5 space-y-4">
							{paymentMethod === "card" ? (
								<div className="grid gap-5 md:grid-cols-2">
									<div>
										<label htmlFor="cardholderName" className={labelClass}>
											Cardholder Name *
									</label>
									<input
										id="cardholderName"
										name="cardholderName"
										type="text"
										required={paymentMethod === "card"}
										value={cardholderName}
										onChange={event =>
											setCardholderName(event.target.value)
										}
										className={fieldClass}
									/>
								</div>
									<div>
										<label htmlFor="billingPostalCode" className={labelClass}>
											Billing Postal Code *
										</label>
										<input
											id="billingPostalCode"
											name="billingPostalCode"
											type="text"
											required={paymentMethod === "card"}
											value={billingPostalCode}
											onChange={event =>
												setBillingPostalCode(event.target.value)
											}
											className={fieldClass}
											placeholder="ZIP"
										/>
									</div>
									<div className="md:col-span-2">
										<label htmlFor="billingAddressLine1" className={labelClass}>
											Billing Street Address *
										</label>
										<input
											id="billingAddressLine1"
											name="billingAddressLine1"
											type="text"
											required={paymentMethod === "card"}
											value={billingAddressLine1}
											onChange={event =>
												setBillingAddressLine1(event.target.value)
											}
											className={fieldClass}
											autoComplete="address-line1"
										/>
									</div>
									<div className="md:col-span-2">
										<label htmlFor="billingAddressLine2" className={labelClass}>
											Apartment / Suite (Optional)
										</label>
										<input
											id="billingAddressLine2"
											name="billingAddressLine2"
											type="text"
											value={billingAddressLine2}
											onChange={event =>
												setBillingAddressLine2(event.target.value)
											}
											className={fieldClass}
											autoComplete="address-line2"
										/>
									</div>
									<div>
										<label htmlFor="billingCity" className={labelClass}>
											Billing City *
										</label>
										<input
											id="billingCity"
											name="billingCity"
											type="text"
											required={paymentMethod === "card"}
											value={billingCity}
											onChange={event =>
												setBillingCity(event.target.value)
											}
											className={fieldClass}
											autoComplete="address-level2"
										/>
									</div>
									<div>
										<label htmlFor="billingState" className={labelClass}>
											Billing State *
										</label>
										<input
											id="billingState"
											name="billingState"
											type="text"
											required={paymentMethod === "card"}
											value={billingState}
											onChange={event =>
												setBillingState(event.target.value.toUpperCase())
											}
											className={fieldClass}
											maxLength={2}
											placeholder="NM"
											autoComplete="address-level1"
										/>
									</div>
								</div>
							) : null}
							<div className="border border-[color:var(--line-subtle)] bg-white p-4">
							<p className="mb-3 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
								{paymentMethod === "card"
									? "Card Information"
									: paymentMethod === "apple-pay"
										? "Apple Pay"
										: "Google Pay"}
							</p>
								<div
									id="square-payment-container"
									className="min-h-[7rem] rounded-sm border border-[color:var(--line-subtle)] px-3 py-2"
								/>
							</div>
							<p className="text-xs uppercase tracking-[0.12em] text-[color:var(--ink-500)]">
								{paymentMethod === "card"
									? "Enter card number, expiration, and security code in the secure Square fields above, then complete billing details just like a standard checkout."
									: "Digital wallet availability depends on browser/device setup. Google Pay can work on desktop browsers when an eligible wallet is configured."}
							</p>
						<button
							type="button"
							onClick={onProcessSquarePayment}
							disabled={isProcessingSquarePayment || isSubmitting}
							className="be-btn be-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isProcessingSquarePayment
								? "Processing Payment..."
								: `Pay ${depositAmountLabel} Deposit`}
						</button>
					</div>
				) : (
					<div className="mt-5 grid gap-5 md:grid-cols-2">
						<div>
							<label htmlFor="paypalPayerEmail" className={labelClass}>
								PayPal Email *
							</label>
							<input
								id="paypalPayerEmail"
								name="paypalPayerEmail"
								type="email"
								placeholder="you@example.com"
								className={fieldClass}
								required={paymentMethod === "paypal"}
							/>
						</div>
						<div>
							<label htmlFor="paymentReference" className={labelClass}>
								Payment Reference
							</label>
							<input
								id="paymentReference"
								name="paymentReference"
								type="text"
								maxLength={120}
								placeholder="Optional note or transaction reference"
								className={fieldClass}
							/>
						</div>
					</div>
				)}

				{squarePaymentSuccess ? (
					<p className="mt-4 border border-[color:var(--line-subtle)] bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--ink-900)]">
						{squarePaymentSuccess}
					</p>
				) : null}

				{squarePaymentError ? (
					<p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
						{squarePaymentError}
					</p>
				) : null}

				<label className="mt-6 flex items-start gap-3 text-xs leading-6 text-[color:var(--ink-700)]">
					<input
						name="policyAccepted"
						type="checkbox"
						required
						className="mt-1 h-4 w-4"
					/>
					I understand this is an appointment request and the boutique will confirm my final date and time.
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
							disabled={isSubmitting || isProcessingSquarePayment}
							className="be-btn be-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting
								? "Submitting..."
								: "Submit Appointment Request"}
						</button>
						<p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ink-500)]">
							Secure Payment + Manual Confirmation
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
