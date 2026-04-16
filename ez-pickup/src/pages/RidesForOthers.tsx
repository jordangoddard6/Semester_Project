import { useEffect } from 'react';
import RidesList from '../components/RidesList';

export default function RidesForOthers() {
  useEffect(() => {
    document.title = 'Rides for Others | EZ Pickup';
    return () => { document.title = 'EZ Pickup'; };
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Rides for Others</h1>
      <p className="text-slate-600 text-base mt-2 mb-4">
        Easily track all the future rides you've promised others.
      </p>
      <div className="mb-6">
        <span className="block w-fit mx-auto bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs font-medium">
          Click on a card to view live flight details.
        </span>
      </div>
      <RidesList />
    </main>
  );
}
