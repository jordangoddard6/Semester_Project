// State A — the API returned an empty data[] for this flight number

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FlightSearchParams } from '../types';

interface Props {
  /** The flight number that was not found, used to pre-fill the correction input. */
  flightNumber: string;
  /** Forwarded so the corrected search keeps the same date/airport/drive time. */
  searchParams: FlightSearchParams | null;
}

export default function FlightNotFound({ flightNumber, searchParams }: Props) {
  const navigate = useNavigate();
  const [value, setValue] = useState(flightNumber);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const corrected = value.trim().toUpperCase();
    if (!corrected) return;
    navigate(`/flight/${corrected}`, { state: searchParams });
  }

  return (
    <div className="flex flex-col items-start gap-5">
      {/* Icon + message */}
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">🔍</span>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Flight not found</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            No results for <span className="font-mono font-medium">{flightNumber}</span>.
            Check the number and try again.
          </p>
        </div>
      </div>

      {/* Pre-filled correction form */}
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xs">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Correct flight number"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono uppercase
                     focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium
                     transition-colors whitespace-nowrap"
        >
          Try again
        </button>
      </form>
    </div>
  );
}
