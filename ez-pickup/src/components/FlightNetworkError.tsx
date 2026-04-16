// State C — fetch threw, HTTP 5xx, API quota error, etc.

interface Props {
  message: string;
  onRetry: () => void;
}

export default function FlightNetworkError({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">⚠️</span>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
          <p className="mt-1 text-sm text-red-600 font-mono bg-red-50 border border-red-200
                        rounded px-3 py-2 max-w-prose break-words">
            {message}
          </p>
        </div>
      </div>

      <button
        onClick={onRetry}
        className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-lg text-sm
                   font-medium transition-colors"
      >
        Retry now
      </button>
    </div>
  );
}
