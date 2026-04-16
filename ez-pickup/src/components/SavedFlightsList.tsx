import { useState, useEffect } from 'react';
import type { SavedFlight } from '../types';
import SavedFlightCard from './SavedFlightCard';
import ConfigureSavedFlightModal from './ConfigureSavedFlightModal';
import PlanRideModal from './PlanRideModal';

const LS_KEY = 'savedFlights';

function loadFlights(): SavedFlight[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedFlight[]) : [];
  } catch {
    return [];
  }
}

export default function SavedFlightsList() {
  const [flights, setFlights] = useState<SavedFlight[]>(loadFlights);
  // null = modal closed; -1 = adding new; ≥0 = editing that index
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [planRide, setPlanRide] = useState<{ index: number; context: 'pick-up' | 'drop-off' } | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(flights));
  }, [flights]);

  function handleSave(flight: SavedFlight) {
    if (editingIndex !== null && editingIndex >= 0) {
      setFlights((prev) => prev.map((f, i) => (i === editingIndex ? flight : f)));
    } else {
      setFlights((prev) => [...prev, flight]);
    }
    setEditingIndex(null);
  }

  function handleClose() {
    setEditingIndex(null);
  }

  function handleDelete(index: number) {
    setFlights((prev) => prev.filter((_, i) => i !== index));
  }

  const modalOpen = editingIndex !== null;
  const flightToEdit = editingIndex !== null && editingIndex >= 0 ? flights[editingIndex] : undefined;

  return (
    <div>
      {flights.length === 0 ? (
        <p className="text-slate-500 text-sm">No saved flights yet. Add one to get started.</p>
      ) : (
        <ul className="space-y-3">
          {flights
            .map((flight, originalIndex) => ({ flight, originalIndex }))
            .sort((a, b) => new Date(a.flight.date).getTime() - new Date(b.flight.date).getTime())
            .map(({ flight, originalIndex }) => (
              <li key={`${flight.flightNumber}-${flight.date}-${originalIndex}`}>
                <SavedFlightCard
                  flight={flight}
                  onDelete={() => handleDelete(originalIndex)}
                  onEdit={() => setEditingIndex(originalIndex)}
                  onPlanRide={(context) => setPlanRide({ index: originalIndex, context })}
                />
              </li>
            ))}
        </ul>
      )}

      <button
        onClick={() => setEditingIndex(-1)}
        className="w-full mt-6 py-2.5 rounded-lg text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
      >
        + Add Flight
      </button>

      {modalOpen && (
        <ConfigureSavedFlightModal
          onSave={handleSave}
          onClose={handleClose}
          flightToEdit={flightToEdit}
        />
      )}

      {planRide !== null && (
        <PlanRideModal
          flight={flights[planRide.index]}
          context={planRide.context}
          onClose={() => setPlanRide(null)}
        />
      )}
    </div>
  );
}
