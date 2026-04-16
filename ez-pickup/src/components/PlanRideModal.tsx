import { useState, type FormEvent } from 'react';
import type { SavedFlight } from '../types';
import { formatDisplayDate, formatTime } from '../utils';
import { useToast } from '../context/ToastContext';

interface Props {
  flight: SavedFlight;
  context: 'pick-up' | 'drop-off';
  onClose: () => void;
}

type View = 'options' | 'share';

export default function PlanRideModal({ flight, context, onClose }: Props) {
  const { addToast } = useToast();
  const [view, setView] = useState<View>('options');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const title = context === 'pick-up' ? 'Plan Pickup' : 'Plan Drop-off';
  const timeLabel = context === 'pick-up'
    ? formatTime(flight.scheduledArrival)
    : formatTime(flight.scheduledDeparture);
  const timePrefix = context === 'pick-up' ? 'Arrives' : 'Departs';

  function handleRideshare() {
    window.open('https://uber.com', '_blank');
    onClose();
  }

  function handleShareSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) return;
    setEmail('');
    setPhone('');
    onClose();
    addToast({ type: 'success', message: 'Flight details successfully shared!', duration: 3000 });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl w-full max-w-sm shadow-xl" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {view === 'share' && (
              <button
                onClick={() => setView('options')}
                className="text-slate-400 hover:text-slate-600 transition-colors mr-1"
                aria-label="Back"
              >
                ←
              </button>
            )}
            <h2 className="text-lg font-semibold text-slate-900">
              {view === 'options' ? title : 'Share Flight Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Flight summary */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">{flight.flightNumber}</p>
          <p>{flight.departureAirport} → {flight.arrivalAirport}</p>
          {timeLabel !== '—' && (
            <p className="text-xs text-slate-500 mt-0.5">
              {timePrefix}: {timeLabel}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-0.5">{formatDisplayDate(flight.date)}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {view === 'options' ? (
            <div className="space-y-3">
              <button
                onClick={handleRideshare}
                className="w-full py-3 rounded-xl bg-black hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
              >
                Schedule a Rideshare
              </button>
              <button
                onClick={() => setView('share')}
                className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
              >
                Share Flight Details
              </button>
            </div>
          ) : (
            <form onSubmit={handleShareSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. mom@example.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                             transition-colors"
                />
              </div>

              {/* OR divider */}
              <p className="text-center text-slate-400 text-sm font-medium">OR</p>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 555-867-5309"
                  autoComplete="tel"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                             transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!email.trim() && !phone.trim()}
                className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                Send Details
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
