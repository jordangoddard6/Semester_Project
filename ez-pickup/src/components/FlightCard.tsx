// Success state — handles both State B (scheduled/no live) and active (with map)

import type { FlightApiDataResponse, FlightSearchParams } from "../types";
import { stripUtcOffset } from "../utils";
import FlightMap from "./FlightMap";

interface Props {
  data: FlightApiDataResponse;
  searchParams: FlightSearchParams | null;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<FlightApiDataResponse["flight_status"], string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  scheduled: "bg-blue-100  text-blue-800  border-blue-200",
  landed: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-red-100   text-red-800   border-red-200",
  diverted: "bg-orange-100 text-orange-800 border-orange-200",
  unknown: "bg-gray-100  text-gray-600  border-gray-200",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format an ISO timestamp to a readable local time, e.g. "3:42 PM". */
function fmtTime(iso: string | null): string {
  const stripped = stripUtcOffset(iso);
  if (!stripped) return "—";
  return new Date(stripped).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format an ISO timestamp to a readable local date+time. */
function fmtDateTime(iso: string | null): string {
  const stripped = stripUtcOffset(iso);
  if (!stripped) return "—";
  return new Date(stripped).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Determine the best arrival time estimate for pickup calculation.
 * Priority: actual > estimated > scheduled.
 */
function bestArrivalTime(
  arrival: FlightApiDataResponse["arrival"],
): string | null {
  return arrival.actual ?? arrival.estimated ?? arrival.scheduled ?? null;
}

/** Extra minutes added to the arrival time to account for the passenger
 *  walking from the gate to the curb pickup area. */
const GATE_TO_CURB_MINUTES = 15;

/** Calculate the "leave at" timestamp.
 *  Driver should arrive at (flightArrival + GATE_TO_CURB_MINUTES),
 *  so they need to leave driveMinutes before that. */
function leaveByTime(arrivalIso: string, driveMinutes: number): Date {
  const stripped = stripUtcOffset(arrivalIso) ?? arrivalIso;
  const arrivalMs = new Date(stripped).getTime();
  return new Date(
    arrivalMs + GATE_TO_CURB_MINUTES * 60_000 - driveMinutes * 60_000,
  );
}

/** Returns true when there is usable live position data. */
function hasLivePosition(data: FlightApiDataResponse): boolean {
  return (
    data.flight_status === "active" &&
    data.live != null &&
    data.live.latitude != null &&
    data.live.longitude != null
  );
}

// ─── Sub-section components ───────────────────────────────────────────────────

interface AirportCardProps {
  label: string;
  airport: string;
  gate: string | null;
  scheduled: string;
  estimated: string | null;
  actual: string | null;
  delay: number;
}

function AirportCard({
  label,
  airport,
  gate,
  scheduled,
  estimated,
  actual,
  delay,
}: AirportCardProps) {
  return (
    <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900">{airport || "—"}</p>
      {gate && (
        <p className="text-sm text-slate-600">
          Gate <span className="font-semibold">{gate}</span>
        </p>
      )}
      <div className="pt-1 space-y-1 text-sm text-slate-600">
        <p>
          Scheduled: <span className="font-medium">{fmtTime(scheduled)}</span>
        </p>
        {estimated && (
          <p>
            Estimated: <span className="font-medium">{fmtTime(estimated)}</span>
          </p>
        )}
        {actual && (
          <p>
            Actual:{" "}
            <span className="font-medium text-green-700">
              {fmtTime(actual)}
            </span>
          </p>
        )}
        {delay > 0 && (
          <p className="text-amber-600 font-medium">+{delay} min delay</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/** Returns the full IATA flight code, e.g. "DL907". */
function flightCode(data: FlightApiDataResponse): string {
  return data.flight.iata ?? `${data.airline.iata ?? ""}${data.flight.number}`;
}

export default function FlightCard({ data, searchParams }: Props) {
  const isLive = hasLivePosition(data);
  const arrivalIso = bestArrivalTime(data.arrival);

  const leaveBy =
    arrivalIso && searchParams
      ? leaveByTime(arrivalIso, searchParams.driveTimeMinutes)
      : null;

  return (
    <div className="space-y-5">
      {/* ── Header row ── */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-slate-900">
          {flightCode(data)}
        </h1>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize
                      ${STATUS_STYLES[data.flight_status]}`}
        >
          {data.flight_status}
        </span>
        <span className="text-sm text-slate-400">{data.flight_date}</span>
      </div>

      {/* ── Route ── */}
      <p className="text-slate-500 text-sm font-medium">
        {data.departure.airport || "—"} → {data.arrival.airport || "—"}
      </p>

      {/* ── Departure / Arrival cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AirportCard
          label="Departure"
          airport={data.departure.airport}
          gate={data.departure.gate || null}
          scheduled={data.departure.scheduled}
          estimated={data.departure.estimated}
          actual={data.departure.actual}
          delay={data.departure.delay ?? 0}
        />
        <AirportCard
          label="Arrival"
          airport={data.arrival.airport}
          gate={data.arrival.gate || null}
          scheduled={data.arrival.scheduled}
          estimated={data.arrival.estimated}
          actual={data.arrival.actual}
          delay={data.arrival.delay ?? 0}
        />
      </div>

      {/* ── Live map (State active only) ── */}
      {isLive && data.live != null && (
        <section aria-label="Live flight map">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Live position
          </h2>
          <FlightMap
            lat={data.live.latitude!}
            lng={data.live.longitude!}
            direction={data.live.direction}
            altitude={data.live.altitude}
            speedHorizontal={data.live.speed_horizontal}
          />
          {data.live.updated && (
            <p className="text-xs text-slate-400 mt-1">
              Last updated: {fmtDateTime(data.live.updated)}
            </p>
          )}
        </section>
      )}

      {/* ── State B: scheduled and not yet departed ── */}
      {data.flight_status === "scheduled" && (
        <div
          className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50
                        border border-blue-200 rounded-lg px-4 py-3"
        >
          <span aria-hidden="true">🕐</span>
          Live tracking is not yet available — the flight hasn't departed.
        </div>
      )}

      {/* ── Active / landed but GPS feed unavailable ── */}
      {!isLive &&
        (data.flight_status === "active" ||
          data.flight_status === "landed") && (
          <div
            className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50
                        border border-slate-200 rounded-lg px-4 py-3"
          >
            <span aria-hidden="true">📡</span>
            Live GPS map currently unavailable for this flight.
          </div>
        )}

      {/* ── Pickup ETA card ── */}
      {searchParams && (
        <section
          aria-label="Pickup timing"
          className="border border-slate-200 rounded-xl p-5 bg-white space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pickup timing
          </p>

          {leaveBy ? (
            <>
              <p className="text-2xl font-bold text-sky-700">
                Leave at{" "}
                {leaveBy.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                (Includes estimated {GATE_TO_CURB_MINUTES}-minute walk from gate
                to pickup area)
              </p>
              <p className="text-sm text-slate-500">
                Based on {searchParams.driveTimeMinutes} min drive to{" "}
                <span className="font-medium">
                  {searchParams.arrivalAirport}
                </span>
                {arrivalIso && (
                  <>
                    {" "}
                    and{" "}
                    {data.arrival.actual
                      ? "actual"
                      : data.arrival.estimated
                        ? "estimated"
                        : "scheduled"}{" "}
                    arrival of{" "}
                    <span className="font-medium">{fmtTime(arrivalIso)}</span>
                  </>
                )}
                .
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              Arrival time unavailable — cannot calculate pickup time.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
