import { useState, useRef } from "react";
import DistanceTrackerForm from "../components/DistanceTrackerForm";
import Timer from "../components/Timer";
import { useToast } from "../context/ToastContext";
import type { DistanceTrackerForm as FormData } from "../types";

const initialForm: FormData = {
  direction: "arriving",
  gateNumber: "",
  airport: "",
  bathroomStop: false,
  waitForBags: false,
};

export default function GateTimer() {
  const { addToast } = useToast();

  const [form, setForm] = useState<FormData>(initialForm);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleStart() {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
  }

  function handleStop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    if (elapsed > 0) setShowSubmitButton(true);
  }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
    setShowSubmitButton(false);
  }

  function handleSubmit() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
    setForm(initialForm);
    setShowSubmitButton(false);
    addToast({
      type: "success",
      message: "Thank you for your help!",
      duration: 3000,
    });
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Track Gate Distances
      </h1>
      <p className="text-slate-600 text-base mt-2 mb-6">
        Tracking the amount of time it takes you to walk from the gate to the
        curb (or vice versa) allows us to create better estimates!
      </p>
      <DistanceTrackerForm form={form} onChange={setForm} />
      <div className="mt-8">
        <Timer
          elapsed={elapsed}
          running={running}
          showSubmitButton={showSubmitButton}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
