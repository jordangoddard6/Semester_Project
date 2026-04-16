import { useState, type FormEvent } from 'react';
import { US_AIRPORTS } from '../constants/airports';
import type { SavedFlight } from '../types';

interface Props {
  onSave: (flight: SavedFlight) => void;
  onClose: () => void;
  flightToEdit?: SavedFlight;
}

interface Fields {
  flightNumber: string;
  date: string;
  departureAirport: string;
  arrivalAirport: string;
  departureGate: string;
  arrivalGate: string;
  rideType: 'drop-off' | 'pick-up' | 'both' | 'none';
  scheduledDeparture: string;
  scheduledArrival: string;
}

interface Errors {
  flightNumber?: string;
  date?: string;
  departureAirport?: string;
  arrivalAirport?: string;
}

function todayIso() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.flightNumber.trim()) e.flightNumber = 'Required.';
  if (!f.date) {
    e.date = 'Required.';
  } else if (f.date < todayIso()) {
    e.date = 'Please select a current or future date.';
  }
  if (!f.departureAirport) e.departureAirport = 'Required.';
  if (!f.arrivalAirport) e.arrivalAirport = 'Required.';
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

export default function ConfigureSavedFlightModal({ onSave, onClose, flightToEdit }: Props) {
  const [fields, setFields] = useState<Fields>(() =>
    flightToEdit
      ? {
          flightNumber:      flightToEdit.flightNumber,
          date:              flightToEdit.date,
          departureAirport:  flightToEdit.departureAirport,
          arrivalAirport:    flightToEdit.arrivalAirport,
          departureGate:     flightToEdit.departureGate ?? '',
          arrivalGate:       flightToEdit.arrivalGate ?? '',
          rideType:          flightToEdit.rideType,
          scheduledDeparture: flightToEdit.scheduledDeparture ?? '',
          scheduledArrival:   flightToEdit.scheduledArrival ?? '',
        }
      : {
          flightNumber: '',
          date: todayIso(),
          departureAirport: '',
          arrivalAirport: '',
          departureGate: '',
          arrivalGate: '',
          rideType: 'none',
          scheduledDeparture: '',
          scheduledArrival: '',
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
      flightNumber: fields.flightNumber.trim().toUpperCase().replace(/\s+/g, ''),
      date: fields.date,
      departureAirport: fields.departureAirport,
      arrivalAirport: fields.arrivalAirport,
      departureGate: fields.departureGate.trim() || null,
      arrivalGate: fields.arrivalGate.trim() || null,
      rideType: fields.rideType,
      scheduledDeparture: fields.scheduledDeparture || undefined,
      scheduledArrival: fields.scheduledArrival || undefined,
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
            {flightToEdit ? 'Edit Flight' : 'Save a Flight'}
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
          {/* Flight Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Flight Number
            </label>
            <input
              type="text"
              value={fields.flightNumber}
              onChange={(e) => set('flightNumber', e.target.value)}
              placeholder="e.g. AA123"
              autoComplete="off"
              className={inputClass(!!errors.flightNumber)}
            />
            <FieldError msg={errors.flightNumber} />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={fields.date}
              min={todayIso()}
              onChange={(e) => set('date', e.target.value)}
              className={inputClass(!!errors.date)}
            />
            <FieldError msg={errors.date} />
          </div>

          {/* Airports */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Departure</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Arrival</label>
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

          {/* Gates (optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dep. Gate{' '}
                <span className="text-slate-400 font-normal">(opt.)</span>
              </label>
              <input
                type="text"
                value={fields.departureGate}
                onChange={(e) => set('departureGate', e.target.value)}
                placeholder="e.g. A12"
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Arr. Gate{' '}
                <span className="text-slate-400 font-normal">(opt.)</span>
              </label>
              <input
                type="text"
                value={fields.arrivalGate}
                onChange={(e) => set('arrivalGate', e.target.value)}
                placeholder="e.g. B7"
                className={inputClass(false)}
              />
            </div>
          </div>

          {/* Scheduled times (optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Scheduled Departure{' '}
                <span className="text-slate-400 font-normal">(opt.)</span>
              </label>
              <input
                type="time"
                value={fields.scheduledDeparture}
                onChange={(e) => set('scheduledDeparture', e.target.value)}
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Scheduled Arrival{' '}
                <span className="text-slate-400 font-normal">(opt.)</span>
              </label>
              <input
                type="time"
                value={fields.scheduledArrival}
                onChange={(e) => set('scheduledArrival', e.target.value)}
                className={inputClass(false)}
              />
            </div>
          </div>

          {/* Ride needs */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ride needs</label>
            <select
              value={fields.rideType}
              onChange={(e) => set('rideType', e.target.value)}
              className={inputClass(false)}
            >
              <option value="none">None</option>
              <option value="drop-off">Drop-off</option>
              <option value="pick-up">Pick-up</option>
              <option value="both">Both</option>
            </select>
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
              {flightToEdit ? 'Save Changes' : 'Save Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
