import React, { useState } from "react";
import FeatureTree  from "./components/FeatureTree";
import  LocationTree  from "./components/LocationTree";
import type { CechaNode } from "./types";

export const DANE_ZE_SKIEROWANIA = [
  'nikotynizm',
  'nowotwór złośliwy w wywiadzie',
  'pacjent w immunosupresji',
  'zakażenie wirusem HIV/AIDS',
  'stan po przeszczepie allogenicznym narządu/szpiku',
  'czynniki ryzyka',
];

export const OBJAW_RADIOLOGICZNY = [
  'guzek/obszar miąższu płuca typu matowej szyby',
  'guzek miąższu płuca',
  'mnogie guzki płuca',
  'częściowo lity guzek miąższu płuca',
];

const API_URL = "http://localhost:8001"

export default function DescribeTree({
  onSelect,
  onCancel,
}: {
  onSelect: (desc: string) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"form" | "features" | "locations">("form");
  const [loading, setLoading] = useState(false);
  const [featureData, setFeatureData] = useState<CechaNode[] | null>(null);
  const [locData, setLocData] = useState<any[] | null>(null);

  // Form fields
  const [findingName, setFindingName] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [referralData, setReferralData] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch features (drzewo cech)
  async function fetchFeatures() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        finding_name: findingName,
        size: size,
      }).toString();
  
      const res = await fetch(`${API_URL}/api/neo/objawy/by-name/cechy/?${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skierowanie_data: referralData }),
      });
  
      if (!res.ok) throw new Error("Błąd pobierania cech");
      const data = await res.json();
      setFeatureData(data);
      setStep("features");
    } catch (e) {
      setError("Nie udało się pobrać drzewa cech.");
    } finally {
      setLoading(false);
    }
  }

  // Fetch locations (drzewo lokalizacji)
  async function fetchLocations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/neo/objawy/by-name/lokalizacja/?finding_name=" + encodeURIComponent(findingName));
      if (!res.ok) throw new Error("Błąd pobierania lokalizacji");
      const data = await res.json();
      setLocData(data);
      setStep("locations");
    } catch (e) {
      setError("Nie udało się pobrać drzewa lokalizacji.");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setStep("form");
    setFeatureData(null);
    setLocData(null);
    setFindingName("");
    setSize("");
    setReferralData([]);
    setError(null);
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#090C2A] py-6">
      <div className="relative w-[342px] min-h-[640px] bg-[#090C2A] shadow-lg rounded-lg p-6 flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center mb-2">
          <span className="font-semibold text-xl text-[#C9C9C9]">Opisz pomiar</span>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded hover:bg-[#23274a] flex items-center justify-center text-[#C9C9C9]"
            aria-label="Zamknij"
          >✕</button>
        </div>
        {step === "form" && (
          <form
            className="flex flex-col gap-4"
            onSubmit={e => { e.preventDefault(); }}
          >
            <label className="flex flex-col gap-1 w-full">
              <span className="text-[#C9C9C9] text-sm font-semibold mb-0.5">
                Objaw radiologiczny <span className="text-red-500">*</span>
              </span>
              <select
                className="w-full px-3 py-2 bg-[#050615] border border-[#225BA4] rounded text-white"
                value={findingName}
                onChange={e => setFindingName(e.target.value)}
                required
              >
                <option value="">Wybierz...</option>
                {OBJAW_RADIOLOGICZNY.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 w-full">
              <span className="text-[#C9C9C9] text-sm font-semibold mb-0.5">
                Średnica guza (mm) <span className="text-red-500">*</span>
              </span>
              <input
                className="w-full px-3 py-2 bg-[#050615] border border-[#225BA4] rounded text-white"
                placeholder="np. 15"
                type="number"
                value={size}
                onChange={e => setSize(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 w-full">
              <span className="text-[#C9C9C9] text-sm font-semibold mb-0.5">
                Dane ze skierowania
              </span>
              <select
                className="w-full px-3 py-2 bg-[#050615] border border-[#225BA4] rounded text-white"
                multiple
                value={referralData}
                onChange={e =>
                  setReferralData(Array.from(e.target.selectedOptions, (o) => o.value))
                }
              >
                {DANE_ZE_SKIEROWANIA.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
            {error && (
              <span className="text-red-400 text-sm">{error}</span>
            )}
            <div className="flex flex-row gap-2 mt-2">
              <button
                type="button"
                className="flex-1 bg-[#348CFD] hover:bg-[#225BA4] text-white font-semibold rounded px-4 py-2"
                onClick={fetchFeatures}
                disabled={!findingName || !size || loading}
              >{loading ? "..." : "Pobierz drzewo cech"}</button>
              <button
                type="button"
                className="flex-1 bg-[#00BFD9] hover:bg-[#14d6f8] text-black font-semibold rounded px-4 py-2"
                onClick={fetchLocations}
                disabled={!findingName || !size || loading}
              >{loading ? "..." : "Pobierz drzewo lokalizacji"}</button>
            </div>
          </form>
        )}
        {step === "features" && featureData && (
          <FeatureTree
            data={featureData}
            onDone={selectedList => {
              onSelect(selectedList.map(n => n.name).join(" ➝ "));
            }}
            onBack={resetAll}
          />
        )}
        {step === "locations" && locData && (
          <LocationTree
            data={locData}
            onDone={selectedList => {
              onSelect(selectedList.map(n => n.name).join(" ➝ "));
            }}
            onBack={resetAll}
          />
        )}
      </div>
    </div>
  );
}
