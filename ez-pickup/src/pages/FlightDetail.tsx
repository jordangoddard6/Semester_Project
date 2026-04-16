import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import type { FlightSearchParams } from '../types';
import { fetchFlight } from '../services/flightApi';
import type { FlightApiResult } from '../services/flightApi';
import { dateRelativeToToday } from '../utils';
import FlightSkeleton from '../components/FlightSkeleton';
import FlightNotFound from '../components/FlightNotFound';
import FlightNetworkError from '../components/FlightNetworkError';
import FlightCard from '../components/FlightCard';

// The "loading" sentinel lives here rather than inside FlightApiResult because
// "loading" is UI state, not an API outcome.
type PageState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'date_not_found' }
  | { status: 'error'; message: string }
  | { status: 'success'; result: Extract<FlightApiResult, { type: 'success' }> };

export default function FlightDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  // State shape: FlightSearchParams fields are optional; `from` tracks the origin route.
  const rawState = location.state as {
    from?: string;
    date?: string;
    arrivalAirport?: string;
    driveTimeMinutes?: number;
  } | null;

  // Only build searchParams when all required fields are present.
  const searchParams: FlightSearchParams | null =
    rawState?.date != null && rawState?.arrivalAirport != null && rawState?.driveTimeMinutes != null
      ? { date: rawState.date, arrivalAirport: rawState.arrivalAirport, driveTimeMinutes: rawState.driveTimeMinutes }
      : null;

  const backLabel =
    rawState?.from === '/my-pickups' ? '← Rides'
    : rawState?.from === '/my-flights' ? '← Flights'
    : '← Search';

  // location.key is 'default' when the page is accessed directly (no in-app
  // history entry). In that case, navigate(-1) would leave the app entirely,
  // so we fall back to the home route instead.
  function goBack() {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  const [pageState, setPageState] = useState<PageState>({ status: 'loading' });
  // Incrementing retryKey re-triggers the fetch effect without changing the URL.
  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => {
    setPageState({ status: 'loading' });
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    setPageState({ status: 'loading' });

    fetchFlight(id, searchParams?.date).then((result) => {
      if (cancelled) return;

      if (result.type === 'not_found') {
        setPageState({ status: 'not_found' });
      } else if (result.type === 'date_not_found') {
        setPageState({ status: 'date_not_found' });
      } else if (result.type === 'network_error') {
        setPageState({ status: 'error', message: result.message });
      } else {
        setPageState({ status: 'success', result });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id, retryKey]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-400" aria-label="Breadcrumb">
        <button onClick={goBack} className="hover:text-sky-600 transition-colors">
          {backLabel}
        </button>
      </nav>

      {/* ── State D: Loading ── */}
      {pageState.status === 'loading' && <FlightSkeleton />}

      {/* ── State A: Not Found ── */}
      {pageState.status === 'not_found' && (
        <FlightNotFound flightNumber={id} searchParams={searchParams} />
      )}

      {/* ── Date Not Found ── */}
      {pageState.status === 'date_not_found' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center space-y-2">
          <p className="text-lg font-semibold text-amber-800">No data for this date</p>
          <p className="text-sm text-amber-700">
            There is no live data for this flight because it is too far in the{' '}
            <span className="font-semibold">
              {dateRelativeToToday(searchParams?.date) ?? 'future'}
            </span>
            .
          </p>
          {searchParams?.date && (
            <p className="text-xs text-amber-500">Searched date: {searchParams.date}</p>
          )}
        </div>
      )}

      {/* ── State C: Network / API Error ── */}
      {pageState.status === 'error' && (
        <FlightNetworkError message={pageState.message} onRetry={retry} />
      )}

      {/* ── Success (State B or active) ── */}
      {pageState.status === 'success' && (
        <FlightCard data={pageState.result.data} searchParams={searchParams} />
      )}
    </main>
  );
}
