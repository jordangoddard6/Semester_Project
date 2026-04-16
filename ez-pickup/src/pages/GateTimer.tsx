import DistanceTrackerForm from '../components/DistanceTrackerForm';
import Timer from '../components/Timer';

export default function GateTimer() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Track Gate Distances
      </h1>
      <DistanceTrackerForm />
      <div className="mt-8">
        <Timer />
      </div>
    </main>
  );
}
