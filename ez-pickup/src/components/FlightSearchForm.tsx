import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { FlightSearchParams } from "../types";
import { US_AIRPORTS } from "../constants/airports";

interface FormFields {
  flightNumber: string;
  date: string;
  arrivalAirport: string;
  driveTimeMinutes: string; // kept as string while in the input; parsed on submit
}

interface FormErrors {
  flightNumber?: string;
  date?: string;
  arrivalAirport?: string;
  driveTimeMinutes?: string;
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};

  const flightTrimmed = fields.flightNumber
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  if (!flightTrimmed) {
    errors.flightNumber = "Flight number is required.";
  } else if (!/^[A-Z0-9]{2,8}$/.test(flightTrimmed)) {
    errors.flightNumber =
      "Enter a valid IATA flight number (e.g. AA123 or DL 907).";
  }

  if (!fields.date) {
    errors.date = "Date is required.";
  }

  if (!fields.arrivalAirport) {
    errors.arrivalAirport = "Arrival airport is required.";
  }

  const drive = Number(fields.driveTimeMinutes);
  if (!fields.driveTimeMinutes) {
    errors.driveTimeMinutes = "Drive time is required.";
  } else if (!Number.isFinite(drive) || drive <= 0) {
    errors.driveTimeMinutes = "Drive time must be a positive number.";
  }

  return errors;
}

export default function FlightSearchForm() {
  const navigate = useNavigate();

  const [fields, setFields] = useState<FormFields>({
    flightNumber: "",
    date: todayIso(),
    arrivalAirport: "",
    driveTimeMinutes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof FormFields, value: string) {
    const next = { ...fields, [field]: value };
    setFields(next);
    // Re-validate only after the first submit attempt so errors don't flash
    // while the user is still typing for the first time.
    if (submitted) {
      setErrors(validate(next));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const flightNumber = fields.flightNumber
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    const state: FlightSearchParams = {
      date: fields.date,
      arrivalAirport: fields.arrivalAirport, // already a clean IATA code from the select
      driveTimeMinutes: Number(fields.driveTimeMinutes),
    };

    navigate(`/flight/${flightNumber}`, { state });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full space-y-5">
      {/* Flight Number */}
      <div>
        <label
          htmlFor="flightNumber"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Flight Number
        </label>
        <input
          id="flightNumber"
          type="text"
          value={fields.flightNumber}
          onChange={(e) => set("flightNumber", e.target.value)}
          placeholder="e.g. AA123"
          autoComplete="off"
          aria-describedby={
            errors.flightNumber ? "flightNumber-error" : undefined
          }
          className={inputClass(!!errors.flightNumber)}
        />
        <FieldError id="flightNumber-error" message={errors.flightNumber} />
      </div>

      {/* Date */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Date
        </label>
        <input
          id="date"
          type="date"
          value={fields.date}
          onChange={(e) => set("date", e.target.value)}
          aria-describedby={errors.date ? "date-error" : undefined}
          className={inputClass(!!errors.date)}
        />
        <FieldError id="date-error" message={errors.date} />
      </div>

      {/* Arrival Airport */}
      <div>
        <label
          htmlFor="arrivalAirport"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Arrival Airport
        </label>
        <select
          id="arrivalAirport"
          value={fields.arrivalAirport}
          onChange={(e) => set("arrivalAirport", e.target.value)}
          aria-describedby={
            errors.arrivalAirport ? "arrivalAirport-error" : undefined
          }
          className={inputClass(!!errors.arrivalAirport)}
        >
          <option value="">Select an airport…</option>
          {US_AIRPORTS.map(({ code }) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <FieldError id="arrivalAirport-error" message={errors.arrivalAirport} />
      </div>

      {/* Drive Time */}
      <div>
        <label
          htmlFor="driveTimeMinutes"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Drive Time{" "}
          <span className="text-slate-400 font-normal">(minutes)</span>
        </label>
        <input
          id="driveTimeMinutes"
          type="number"
          min={1}
          value={fields.driveTimeMinutes}
          onChange={(e) => set("driveTimeMinutes", e.target.value)}
          placeholder="e.g. 45"
          aria-describedby={
            errors.driveTimeMinutes ? "driveTimeMinutes-error" : undefined
          }
          className={inputClass(!!errors.driveTimeMinutes)}
        />
        <FieldError
          id="driveTimeMinutes-error"
          message={errors.driveTimeMinutes}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
      >
        Calculate Pickup Time
      </button>
    </form>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inputClass(hasError: boolean): string {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm",
    "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent",
    "transition-colors",
    hasError ? "border-red-400 bg-red-50" : "border-slate-300 bg-white",
  ].join(" ");
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}
