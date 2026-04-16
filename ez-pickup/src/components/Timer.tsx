import { useState, useRef } from 'react';

export default function Timer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }

  function reset() {
    stop();
    setElapsed(0);
  }

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="space-y-4">
      <div className="text-5xl font-mono font-bold text-slate-900 tabular-nums">
        {minutes}:{seconds}
      </div>
      <div className="flex gap-3">
        <button
          onClick={start}
          disabled={running}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Start
        </button>
        <button
          onClick={stop}
          disabled={!running}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Stop
        </button>
        <button
          onClick={reset}
          className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
