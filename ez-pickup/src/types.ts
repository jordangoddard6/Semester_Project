// ─── API Response ────────────────────────────────────────────────────────────
export interface FlightApiDataResponse {
  flight_date: string;
  flight_status:
    | 'scheduled'
    | 'active'
    | 'landed'
    | 'cancelled'
    | 'diverted'
    | 'unknown';
  departure: {
    airport: string;
    gate: string;
    delay: number;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
  };
  arrival: {
    airport: string;
    gate: string;
    delay: number;
    scheduled: string;
    estimated: string | null;
    actual: string | null;
  };
  airline: { iata: string | null };
  flight: { iata: string | null; number: string };
  live: {
    updated: string | null;
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
    direction: number | null;
    speed_horizontal: number | null;
    speed_vertical: number | null;
    is_ground: boolean;
  } | null;
}

// ─── Flight Search ────────────────────────────────────────────────────────────
// Passed as router state from FlightSearchForm → FlightDetail
export interface FlightSearchParams {
  date: string;           // ISO date string, e.g. "2026-04-14"
  arrivalAirport: string; // IATA code, e.g. "LAX"
  driveTimeMinutes: number;
}

// ─── React API State ──────────────────────────────────────────────────────────
export type ApiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; response: FlightApiDataResponse }
  | { status: 'error'; message: string };

// ─── Local Storage & Forms ────────────────────────────────────────────────────
export interface SavedFlight {
  flightNumber: string;
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  departureGate: string | null;
  arrivalGate: string | null;
  rideType: 'drop-off' | 'pick-up' | 'both' | 'none';
  scheduledDeparture?: string; // HH:MM, from <input type="time">
  scheduledArrival?: string;   // HH:MM, from <input type="time">
}

export interface SavedRide {
  flightNumber: string;
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  gate: string | null;
  type: 'drop-off' | 'pick-up';
  personName: string;
  driveTimeMinutes: number;
}

export interface DistanceTrackerForm {
  direction: 'arriving' | 'departing';
  gateNumber: string;
  airport: string;
  bathroomStop: boolean;
  waitForBags: boolean;
}
