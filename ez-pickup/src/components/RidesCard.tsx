import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SavedRide, FlightSearchParams } from '../types';
import { formatDisplayDate } from '../utils';

interface Props {
  ride: SavedRide;
  onDelete: () => void;
  onEdit: () => void;
}

export default function RidesCard({ ride, onDelete, onEdit }: Props) {
  const navigate = useNavigate();

  function handleCardClick() {
    const state: FlightSearchParams & { from: string } = {
      date: ride.date,
      arrivalAirport: ride.arrivalAirport,
      driveTimeMinutes: ride.driveTimeMinutes,
      from: '/my-pickups',
    };
    navigate(`/flight/${ride.flightNumber}`, { state });
  }

  function handleDelete(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onDelete();
  }

  function handleEdit(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onEdit();
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
          {/* Name + type badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-900">{ride.personName}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-medium capitalize">
              {ride.type}
            </span>
          </div>

          {/* Flight */}
          <p className="text-sm font-medium text-slate-700 mt-0.5">{ride.flightNumber}</p>

          {/* Route */}
          <p className="text-sm text-slate-500">
            {ride.departureAirport} → {ride.arrivalAirport}
          </p>

          {/* Gate */}
          {ride.gate && (
            <p className="text-xs text-slate-400">Gate {ride.gate}</p>
          )}

          {/* Date + drive time */}
          <p className="text-xs text-slate-400 mt-1">
            {formatDisplayDate(ride.date)} · {ride.driveTimeMinutes} min drive
          </p>
        </div>

        <button
          onClick={handleDelete}
          aria-label="Delete ride"
          className="shrink-0 text-slate-300 hover:text-red-500 transition-colors text-xl leading-none mt-0.5"
        >
          &times;
        </button>
      </div>

      {/* Bottom row: full-width Edit button */}
      <button
        onClick={handleEdit}
        className="w-full mt-4 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        Edit
      </button>
    </div>
  );
}
