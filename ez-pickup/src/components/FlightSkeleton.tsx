// State D — displayed while the API fetch is in-flight

function Bone({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
}

export default function FlightSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading flight data">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Bone className="h-9 w-32" />
        <Bone className="h-6 w-20" />
      </div>

      {/* Route bar */}
      <div className="flex items-center gap-3">
        <Bone className="h-5 w-24" />
        <Bone className="h-4 w-8" />
        <Bone className="h-5 w-24" />
      </div>

      {/* Two info cards side-by-side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white">
            <Bone className="h-4 w-24" />
            <Bone className="h-7 w-40" />
            <Bone className="h-4 w-32" />
            <Bone className="h-4 w-28" />
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <Bone className="h-64 w-full rounded-xl" />

      {/* Pickup ETA card */}
      <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-white">
        <Bone className="h-4 w-28" />
        <Bone className="h-8 w-48" />
      </div>
    </div>
  );
}
