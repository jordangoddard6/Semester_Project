import type { DistanceTrackerForm as FormData } from "../types";

interface Props {
  form: FormData;
  onChange: (form: FormData) => void;
}

export default function DistanceTrackerForm({ form, onChange }: Props) {
  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    onChange({ ...form, [field]: value });
  }

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Direction
        </label>
        <select
          value={form.direction}
          onChange={(e) =>
            set("direction", e.target.value as FormData["direction"])
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
          onChange={(e) => set("airport", e.target.value)}
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
          onChange={(e) => set("gateNumber", e.target.value)}
          placeholder="e.g. B12"
          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.bathroomStop}
            onChange={(e) => set("bathroomStop", e.target.checked)}
            className="rounded"
          />
          Bathroom stop
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.waitForBags}
            onChange={(e) => set("waitForBags", e.target.checked)}
            className="rounded"
          />
          Wait for bags at carousel
        </label>
      </div>
    </div>
  );
}
