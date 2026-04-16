import SavedFlightsList from "../components/SavedFlightsList";

export default function MyFlights() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">My Flights</h1>
      <p className="text-slate-600 text-base mt-2 mb-4">
        Track your flights to easily coordinate pickups, drop-offs, and
        rideshares!
      </p>
      <div className="mb-6">
        <span className="block w-fit mx-auto bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs font-medium">
          Click on a card to view live flight details.
        </span>
      </div>
      <SavedFlightsList />
    </main>
  );
}
