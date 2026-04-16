import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SavedFlight } from "../types";
import { formatDisplayDate, formatTime } from "../utils";

interface Props {
  flight: SavedFlight;
  onDelete: () => void;
  onEdit: () => void;
  onPlanRide: (context: 'pick-up' | 'drop-off') => void;
}

const RIDE_BADGE: Record<
  SavedFlight["rideType"],
  { label: string; className: string } | null
> = {
  "drop-off": {
    label: "Needs Drop-off",
    className: "bg-amber-100 text-amber-700",
  },
  "pick-up": { label: "Needs Pick-up", className: "bg-sky-100   text-sky-700" },
  both: {
    label: "Drop-off & Pick-up",
    className: "bg-purple-100 text-purple-700",
  },
  none: null,
};

export default function SavedFlightCard({ flight, onDelete, onEdit, onPlanRide }: Props) {
  const navigate = useNavigate();
  const badge = RIDE_BADGE[flight.rideType ?? "none"];
  const rideType = flight.rideType ?? 'none';
  const showPickup  = rideType === 'pick-up' || rideType === 'both';
  const showDropOff = rideType === 'drop-off' || rideType === 'both';

  function handleCardClick() {
    navigate(`/flight/${flight.flightNumber}`, { state: { from: '/my-flights', date: flight.date } });
  }

  function stop(e: MouseEvent, fn: () => void) {
    e.stopPropagation();
    fn();
  }

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
      className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm
                 cursor-pointer hover:border-sky-300 hover:shadow-md transition-all"
    >
      {/* Top row: info + delete */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900">{flight.flightNumber}</p>
            {badge && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}
              >
                {badge.label}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {flight.departureAirport} → {flight.arrivalAirport}
          </p>
          {(flight.departureGate || flight.arrivalGate) && (
            <p className="text-xs text-slate-400 mt-0.5">
              {flight.departureGate ? `Gate ${flight.departureGate}` : "—"}
              {" / "}
              {flight.arrivalGate ? `Gate ${flight.arrivalGate}` : "—"}
            </p>
          )}
          {(flight.scheduledDeparture || flight.scheduledArrival) && (
            <p className="text-xs text-slate-500 mt-0.5">
              Departs: {formatTime(flight.scheduledDeparture)}
              {' • '}
              Arrives: {formatTime(flight.scheduledArrival)}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {formatDisplayDate(flight.date)}
          </p>
        </div>
        <button
          onClick={(e) => stop(e, onDelete)}
          aria-label="Delete flight"
          className="shrink-0 text-slate-300 hover:text-red-500 transition-colors text-xl leading-none mt-0.5"
        >
          &times;
        </button>
      </div>

      {/* Plan ride buttons */}
      {(showPickup || showDropOff) && (
        <div className={`mt-4 grid gap-2 ${showPickup && showDropOff ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {showDropOff && (
            <button
              onClick={(e) => stop(e, () => onPlanRide('drop-off'))}
              className="py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
            >
              Plan Drop-off
            </button>
          )}
          {showPickup && (
            <button
              onClick={(e) => stop(e, () => onPlanRide('pick-up'))}
              className="py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition-colors"
            >
              Plan Pickup
            </button>
          )}
        </div>
      )}

      {/* Edit button */}
      <button
        onClick={(e) => stop(e, onEdit)}
        className="w-full mt-2 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        Edit
      </button>
    </div>
  );
}
