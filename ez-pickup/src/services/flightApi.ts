import type { FlightApiDataResponse } from '../types';

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------
// A discriminated union the UI can exhaustively switch on.
// "not_found"    → State A: flight number returned zero results (API 200 + empty data[])
// "network_error"→ State C: fetch threw, HTTP 5xx, or the API returned an error object
// "success"      → State B/D: at least one flight record was returned
// ---------------------------------------------------------------------------
export type FlightApiResult =
  | { type: 'success'; data: FlightApiDataResponse }
  | { type: 'not_found' }
  | { type: 'date_not_found' }
  | { type: 'network_error'; message: string };

// ---------------------------------------------------------------------------
// Raw AviationStack envelope shapes
// ---------------------------------------------------------------------------
interface AviationStackSuccess {
  pagination: { limit: number; offset: number; count: number; total: number };
  data: FlightApiDataResponse[];
}

interface AviationStackError {
  error: {
    code: number;
    message: string;
    context?: Record<string, unknown>;
  };
}

type AviationStackResponse = AviationStackSuccess | AviationStackError;

function isApiError(body: AviationStackResponse): body is AviationStackError {
  return 'error' in body;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BASE_URL = 'https://api.aviationstack.com/v1/flights';
const TIMEOUT_MS = 10_000;

// Set VITE_AVIATIONSTACK_API_KEY in a .env file at the project root.
const API_KEY = import.meta.env.VITE_AVIATIONSTACK_API_KEY as string | undefined;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Priority order for selecting among multiple results on the same date.
 * Lower number = higher priority.
 */
const STATUS_PRIORITY: Record<FlightApiDataResponse['flight_status'], number> = {
  active:    0,
  landed:    1,
  cancelled: 2,
  diverted:  3,
  unknown:   4,
  scheduled: 5,
};

/**
 * Given the raw `data[]` array from AviationStack, find the best single record.
 *
 * 1. If a `date` is provided, filter strictly to entries whose `flight_date`
 *    matches exactly. Returns undefined when no match exists — the caller must
 *    NOT fall back to a different date's data.
 * 2. Among matching candidates, pick the one with the highest-priority status
 *    (active > landed > cancelled/diverted/unknown > scheduled).
 */
function selectBestFlight(
  flights: FlightApiDataResponse[],
  date: string | undefined,
): FlightApiDataResponse | undefined {
  console.log('Target Date:', date);
  console.log('Raw API Array:', flights);

  const pool = date ? flights.filter((f) => f.flight_date === date) : flights;
  if (pool.length === 0) return undefined;

  const selected = pool.reduce((best, current) =>
    STATUS_PRIORITY[current.flight_status] < STATUS_PRIORITY[best.flight_status]
      ? current
      : best,
  );

  console.log('Selected Flight Object:', selected);
  return selected;
}

// ---------------------------------------------------------------------------
// fetchFlight
// ---------------------------------------------------------------------------
/**
 * Fetches the best-matching flight record for a given IATA flight number.
 *
 * @param flightNumber - IATA flight number, e.g. "AA123"
 * @param date         - ISO date string to filter by (e.g. "2026-04-15").
 *                       When provided, only results whose `flight_date` matches
 *                       are considered, and the result is prioritised by status:
 *                       active > landed > cancelled/diverted/unknown > scheduled.
 * @returns A `FlightApiResult` discriminated union — never throws.
 */
export async function fetchFlight(flightNumber: string, date?: string): Promise<FlightApiResult> {
  if (!API_KEY) {
    return {
      type: 'network_error',
      message: 'API key is not configured. Set VITE_AVIATIONSTACK_API_KEY in your .env file.',
    };
  }

  const url = new URL(BASE_URL);
  url.searchParams.set('access_key', API_KEY);
  url.searchParams.set('flight_iata', flightNumber.trim().toUpperCase());

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url.toString(), { signal: controller.signal });
  } catch (err) {
    clearTimeout(timeoutId);
    // fetch() only throws on network failure or abort
    const message =
      err instanceof DOMException && err.name === 'AbortError'
        ? `Request timed out after ${TIMEOUT_MS / 1000}s`
        : err instanceof Error
          ? err.message
          : 'Unknown network error';
    return { type: 'network_error', message };
  } finally {
    clearTimeout(timeoutId);
  }

  // HTTP-level server errors (5xx) — AviationStack rarely sends these, but
  // a proxy or gateway in front of the API might.
  if (response.status >= 500) {
    return {
      type: 'network_error',
      message: `Server error: HTTP ${response.status} ${response.statusText}`,
    };
  }

  let body: AviationStackResponse;
  try {
    body = (await response.json()) as AviationStackResponse;
  } catch {
    return { type: 'network_error', message: 'Failed to parse API response as JSON' };
  }

  // AviationStack signals problems (bad key, quota exceeded, etc.) inside the
  // JSON body with an "error" key, regardless of the HTTP status code.
  if (isApiError(body)) {
    return { type: 'network_error', message: body.error.message };
  }

  // Successful envelope but no matching flights → treat as "not found"
  if (body.data.length === 0) {
    return { type: 'not_found' };
  }

  const best = selectBestFlight(body.data, date);
  if (!best) {
    // body.data had entries but none matched the requested date — the flight
    // number is valid, but AviationStack has no data for this specific date.
    return date && body.data.length > 0
      ? { type: 'date_not_found' }
      : { type: 'not_found' };
  }

  return { type: 'success', data: best };
}
