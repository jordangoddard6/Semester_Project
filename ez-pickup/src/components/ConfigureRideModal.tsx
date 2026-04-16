import { useState, type FormEvent } from 'react';
import { US_AIRPORTS } from '../constants/airports';
import type { SavedRide } from '../types';

interface Props {
  onSave: (ride: SavedRide) => void;
  onClose: () => void;
  rideToEdit?: SavedRide;
}

interface Fields {
  personName: string;
  flightNumber: string;
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  type: 'pick-up' | 'drop-off';
  gate: string;
  driveTimeMinutes: string;
}

interface Errors {
  personName?: string;
  flightNumber?: string;
  date?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  driveTimeMinutes?: string;
}

function todayIso() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.personName.trim()) e.personName = 'Required.';
  if (!f.flightNumber.trim()) e.flightNumber = 'Required.';
  if (!f.date) {
    e.date = 'Required.';
  } else if (f.date < todayIso()) {
    e.date = 'Please select a current or future date.';
  }
  if (!f.departureAirport) e.departureAirport = 'Required.';
  if (!f.arrivalAirport) e.arrivalAirport = 'Required.';
  const drive = Number(f.driveTimeMinutes);
  if (!f.driveTimeMinutes) e.driveTimeMinutes = 'Required.';
  else if (!Number.isFinite(drive) || drive <= 0) e.driveTimeMinutes = 'Must be a positive number.';
  return e;
}

function inputClass(err: boolean) {
  return [
    'w-full rounded-lg border px-3 py-2 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors',
    err ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white',
  ].join(' ');
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}

export default function ConfigureRideModal({ onSave, onClose, rideToEdit }: Props) {
  const [fields, setFields] = useState<Fields>(() =>
    rideToEdit
      ? {
          personName:       rideToEdit.personName,
          flightNumber:     rideToEdit.flightNumber,
          date:             rideToEdit.date,
          departureAirport: rideToEdit.departureAirport,
          arrivalAirport:   rideToEdit.arrivalAirport,
          type:             rideToEdit.type,
          gate:             rideToEdit.gate ?? '',
          driveTimeMinutes: String(rideToEdit.driveTimeMinutes),
        }
      : {
          personName: '',
          flightNumber: '',
          date: todayIso(),
          departureAirport: '',
          arrivalAirport: '',
          type: 'pick-up',
          gate: '',
          driveTimeMinutes: '',
        }
  );
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof Fields, value: string) {
    const next = { ...fields, [field]: value };
    setFields(next);
    if (submitted) setErrors(validate(next));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSave({
      personName:       fields.personName.trim(),
      flightNumber:     fields.flightNumber.trim().toUpperCase().replace(/\s+/g, ''),
      date:             fields.date,
      departureAirport: fields.departureAirport,
      arrivalAirport:   fields.arrivalAirport,
      type:             fields.type,
      gate:             fields.gate.trim() || null,
      driveTimeMinutes: Number(fields.driveTimeMinutes),
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {rideToEdit ? 'Edit Ride' : 'Add a Ride'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* Person + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Person's Name
              </label>
              <input
                type="text"
                value={fields.personName}
                onChange={(e) => set('personName', e.target.value)}
                placeholder="e.g. Mom"
                autoComplete="off"
                className={inputClass(!!errors.personName)}
              />
              <FieldError msg={errors.personName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={fields.type}
                onChange={(e) => set('type', e.target.value)}
                className={inputClass(false)}
              >
                <option value="pick-up">Pick-up</option>
                <option value="drop-off">Drop-off</option>
              </select>
            </div>
          </div>

          {/* Flight + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Flight Number
              </label>
              <input
                type="text"
                value={fields.flightNumber}
                onChange={(e) => set('flightNumber', e.target.value)}
                placeholder="e.g. DL907"
                autoComplete="off"
                className={inputClass(!!errors.flightNumber)}
              />
              <FieldError msg={errors.flightNumber} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                min={todayIso()}
                value={fields.date}
                onChange={(e) => set('date', e.target.value)}
                className={inputClass(!!errors.date)}
              />
              <FieldError msg={errors.date} />
            </div>
          </div>

          {/* Airports */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
              <select
                value={fields.departureAirport}
                onChange={(e) => set('departureAirport', e.target.value)}
                className={inputClass(!!errors.departureAirport)}
              >
                <option value="">Select…</option>
                {US_AIRPORTS.map(({ code }) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <FieldError msg={errors.departureAirport} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
              <select
                value={fields.arrivalAirport}
                onChange={(e) => set('arrivalAirport', e.target.value)}
                className={inputClass(!!errors.arrivalAirport)}
              >
                <option value="">Select…</option>
                {US_AIRPORTS.map(({ code }) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <FieldError msg={errors.arrivalAirport} />
            </div>
          </div>

          {/* Gate + Drive Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gate{' '}
                <span className="text-slate-400 font-normal">(opt.)</span>
              </label>
              <input
                type="text"
                value={fields.gate}
                onChange={(e) => set('gate', e.target.value)}
                placeholder="e.g. B7"
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Drive Time{' '}
                <span className="text-slate-400 font-normal">(min)</span>
              </label>
              <input
                type="number"
                min={1}
                value={fields.driveTimeMinutes}
                onChange={(e) => set('driveTimeMinutes', e.target.value)}
                placeholder="e.g. 30"
                className={inputClass(!!errors.driveTimeMinutes)}
              />
              <FieldError msg={errors.driveTimeMinutes} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white transition-colors"
            >
              {rideToEdit ? 'Save Changes' : 'Save Ride'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
