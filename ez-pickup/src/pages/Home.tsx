import FlightSearchForm from "../components/FlightSearchForm";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
        Picking someone up from the airport?
      </h1>
      <p className="text-slate-600 mb-6 text-center">
        We'll tell you what time to leave so you aren't sitting around waiting.
      </p>
      <FlightSearchForm />
    </main>
  );
}
