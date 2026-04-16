interface Props {
  elapsed: number;
  running: boolean;
  showSubmitButton: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSubmit: () => void;
}

export default function Timer({
  elapsed,
  running,
  showSubmitButton,
  onStart,
  onStop,
  onReset,
  onSubmit,
}: Props) {
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="space-y-4">
      <div className="text-5xl font-mono font-bold text-slate-900 tabular-nums">
        {minutes}:{seconds}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onStart}
          disabled={running}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Start
        </button>
        <button
          onClick={onStop}
          disabled={!running}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Stop
        </button>
        <button
          onClick={onReset}
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Reset
        </button>
      </div>

      {showSubmitButton && (
        <button
          onClick={onSubmit}
          className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded text-sm font-medium transition-colors"
        >
          Submit Time
        </button>
      )}
    </div>
  );
}
