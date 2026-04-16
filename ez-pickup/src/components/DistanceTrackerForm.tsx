import { useState, type FormEvent } from 'react';
import type { DistanceTrackerForm as DistanceTrackerFormData } from '../types';

const initialForm: DistanceTrackerFormData = {
  direction: 'arriving',
  gateNumber: '',
  airport: '',
  bathroomStop: false,
  stopForTreat: false,
};

export default function DistanceTrackerForm() {
  const [form, setForm] = useState<DistanceTrackerFormData>(initialForm);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: start timer with form data
    console.log('Starting gate timer with:', form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Direction
        </label>
        <select
          value={form.direction}
          onChange={(e) =>
            setForm({ ...form, direction: e.target.value as DistanceTrackerFormData['direction'] })
          }
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="arriving">Arriving</option>
          <option value="departing">Departing</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Airport
        </label>
        <input
          type="text"
          value={form.airport}
          onChange={(e) => setForm({ ...form, airport: e.target.value })}
          placeholder="e.g. LAX"
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Gate Number
        </label>
        <input
          type="text"
          value={form.gateNumber}
          onChange={(e) => setForm({ ...form, gateNumber: e.target.value })}
          placeholder="e.g. B12"
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.bathroomStop}
            onChange={(e) => setForm({ ...form, bathroomStop: e.target.checked })}
            className="rounded"
          />
          Bathroom stop
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.stopForTreat}
            onChange={(e) => setForm({ ...form, stopForTreat: e.target.checked })}
            className="rounded"
          />
          Stop for treat
        </label>
      </div>

      <button
        type="submit"
        className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded text-sm font-medium transition-colors"
      >
        Start Timer
      </button>
    </form>
  );
}
