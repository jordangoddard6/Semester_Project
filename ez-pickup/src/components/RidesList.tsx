import { useState, useEffect } from 'react';
import type { SavedRide } from '../types';
import RidesCard from './RidesCard';
import ConfigureRideModal from './ConfigureRideModal';

const LS_KEY = 'savedPickups'; // key unchanged to preserve existing LocalStorage data

function loadRides(): SavedRide[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedRide[]) : [];
  } catch {
    return [];
  }
}

export default function RidesList() {
  const [rides, setRides] = useState<SavedRide[]>(loadRides);
  // null = modal closed; -1 = adding new; ≥0 = editing that index
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(rides));
  }, [rides]);

  function handleSave(ride: SavedRide) {
    if (editingIndex !== null && editingIndex >= 0) {
      setRides((prev) => prev.map((r, i) => (i === editingIndex ? ride : r)));
    } else {
      setRides((prev) => [...prev, ride]);
    }
    setEditingIndex(null);
  }

  function handleClose() {
    setEditingIndex(null);
  }

  function handleDelete(index: number) {
    setRides((prev) => prev.filter((_, i) => i !== index));
  }

  const modalOpen = editingIndex !== null;
  const rideToEdit = editingIndex !== null && editingIndex >= 0 ? rides[editingIndex] : undefined;

  return (
    <div>
      {rides.length === 0 ? (
        <p className="text-slate-500 text-sm">No rides scheduled for others yet.</p>
      ) : (
        <ul className="space-y-3">
          {rides.map((ride, idx) => (
            <li key={`${ride.flightNumber}-${ride.date}-${idx}`}>
              <RidesCard
                ride={ride}
                onDelete={() => handleDelete(idx)}
                onEdit={() => setEditingIndex(idx)}
              />
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setEditingIndex(-1)}
        className="w-full mt-6 py-2.5 rounded-lg text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
      >
        + Add a Ride
      </button>

      {modalOpen && (
        <ConfigureRideModal
          onSave={handleSave}
          onClose={handleClose}
          rideToEdit={rideToEdit}
        />
      )}
    </div>
  );
}
