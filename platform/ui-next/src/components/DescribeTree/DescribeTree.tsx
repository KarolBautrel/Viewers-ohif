import React, { useState, useEffect } from 'react';
import FeatureTree from './components/FeatureTree';
import LocationTree from './components/LocationTree';
import type { CechaNode } from './types';
import MultiSelect from '../MultiSelect/MultiSelect';

export const DANE_ZE_SKIEROWANIA = [
  "nikotynizm",
  "nowotwór złośliwy w wywiadzie",
  "pacjent w immunosupresji",
  "zakażenie wirusem HIV/AIDS",
  "stan po przeszczepie allogenicznym narządu/szpiku",
  "czynniki ryzyka",
  "kontrola po 3 miesiącach",
  "kontrola po roku",
  "nikotynizm",
  "kontrola po >600 dniach",
  "kontrola po 400-600 dniach",
  "kontrola po <=400 dniach",
  "kontrola po >400 dniach",
  "kontrola po 4 latach ",
  "kontrola po 3 miesiącach",
  "badanie kontrolne",
  "kontrola po 3=>=6 miesiącach",
];

export const OBJAW_RADIOLOGICZNY = [
  'guzek/obszar miąższu płuca typu matowej szyby',
  'guzek miąższu płuca',
  'mnogie guzki płuca',
  'częściowo lity guzek miąższu płuca',
];

export const WARUNKI_BADANIA = [
  'warunek 1',
  'warunek 2',
  'warunek 3',
  'warunek 4',
];

const API_URL = 'http://localhost:8001';

export default function DescribeTree({
  onSelect,
  onCancel,
  measurements,
  uid,
}: {
  onSelect: (desc: string) => void;
  onCancel: () => void;
  measurements: any[];
  uid: string;
}) {
  const [step, setStep] = useState<'form' | 'features' | 'locations'>('form');
  const [loading, setLoading] = useState(false);
  const [featureData, setFeatureData] = useState<CechaNode[] | null>(null);
  const [locData, setLocData] = useState<any[] | null>(null);

  const [findingName, setFindingName] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [referralData, setReferralData] = useState<string[]>([]);
  const [circumstancesData, setCircumstancesData] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  const currentMeasurement = measurements?.find(m => m.uid === uid);

  let displayValue = '';
  let displayUnit = '';
  if (currentMeasurement) {
    if (currentMeasurement.toolName === 'Length') {
      const dataKey = Object.keys(currentMeasurement.data || {})[0];
      const d = dataKey && currentMeasurement.data[dataKey];
      if (d && typeof d.length === 'number') {
        displayValue = d.length.toFixed(1);
        displayUnit = 'mm';
      }
    } else if (
      currentMeasurement.toolName === 'CircleROI' ||
      currentMeasurement.toolName === 'PlanarFreehandROI'
    ) {
      const dataKey = Object.keys(currentMeasurement.data || {})[0];
      const d = dataKey && currentMeasurement.data[dataKey];
      if (d && typeof d.area === 'number') {
        displayValue = d.area.toFixed(1);
        displayUnit = 'mm²';
      }
    }
  }

  async function fetchFeatures() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        finding_name: findingName,
        size: displayValue || size,
      }).toString();

      const res = await fetch(`${API_URL}/api/neo/objawy/by-name/cechy/?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skierowanie_data: referralData }),
      });

      if (!res.ok) throw new Error('Błąd pobierania cech');
      const data = await res.json();
      setFeatureData(data);
      setStep('features');
    } catch (e) {
      setError('Nie udało się pobrać drzewa cech.');
    } finally {
      setLoading(false);
    }
  }

  // Fetch locations (drzewo lokalizacji)
  async function fetchLocations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        '/api/neo/objawy/by-name/lokalizacja/?finding_name=' + encodeURIComponent(findingName)
      );
      if (!res.ok) throw new Error('Błąd pobierania lokalizacji');
      const data = await res.json();
      setLocData(data);
      setStep('locations');
    } catch (e) {
      setError('Nie udało się pobrać drzewa lokalizacji.');
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setStep('form');
    setFeatureData(null);
    setLocData(null);
    setFindingName('');
    setSize('');
    setReferralData([]);
    setError(null);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#090C2A] py-6">
      <div className="relative flex h-[983px] w-[342px] flex-col items-start gap-2 rounded-lg bg-[#090C2A] px-4 pt-8 pb-6 shadow-[0px_1px_2px_rgba(0,0,0,0.10),0px_1px_3px_rgba(0,0,0,0.05)]">
        <div className="mb-6 flex w-[310px] flex-row items-center justify-between">
          <span className="font-roboto text-[20px] font-semibold text-[#C9C9C9]">Opisz pomiar</span>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded text-[#C9C9C9] hover:bg-[#23274a]"
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>
        {/* Panel z wynikiem pomiaru */}
        <div className="mb-2 flex w-[310px] flex-row items-center gap-3">
          <span className="font-roboto rounded-2xl bg-[rgba(134,142,150,0.15)] px-3 py-1 text-[16px] text-white">
            {displayValue ? `${displayValue} ${displayUnit}` : '—'}
          </span>
          <button
            type="button"
            className="font-roboto ml-auto border-none bg-none text-[16px] text-[#d1ebfd] hover:underline"
            onClick={() => {
              setSize('');
            }}
          >
            Edytuj
          </button>
        </div>
        {step === 'form' && (
          <form
            className="flex w-[310px] flex-col gap-4"
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <label className="flex w-full flex-col gap-1">
              <span className="font-roboto mb-0.5 flex flex-row items-center text-[14px] font-semibold text-[#C9C9C9]">
                Objaw radiologiczny
                <span className="ml-1 text-[#F03E3E]">*</span>
              </span>
              <select
                className="font-roboto h-10 w-full rounded border border-[#225BA4] bg-[#0B0F2B] px-3 text-[16px] text-white outline-none"
                value={findingName}
                onChange={e => setFindingName(e.target.value)}
                required
              >
                <option value="">Pick</option>
                {OBJAW_RADIOLOGICZNY.map(opt => (
                  <option
                    key={opt}
                    value={opt}
                  >
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            {/* Średnica guza / Pole powierzchni */}
            {/* <label className="flex w-full flex-col gap-1">
              <span className="font-roboto mb-0.5 flex flex-row items-center text-[14px] font-semibold text-[#C9C9C9]">
                {displayUnit === 'mm²' ? 'Powierzchnia zmiany (mm²)' : 'Średnica guza (mm)'}
                <span className="ml-1 text-[#F03E3E]">*</span>
              </span>
              <input
                className="font-roboto h-10 w-full rounded border border-[#225BA4] bg-[#0B0F2B] px-3 text-[16px] text-white outline-none"
                placeholder={displayUnit === 'mm²' ? 'np. 150' : 'np. 15'}
                type="number"
                value={size !== '' ? size : displayValue}
                onChange={e => setSize(e.target.value)}
                required
              />
            </label> */}

            <div className="flex w-full flex-col gap-1">
              <span className="font-roboto mb-0.5 text-[14px] font-semibold text-[#C9C9C9]">
                Dane ze skierowania
              </span>
              <MultiSelect
                options={DANE_ZE_SKIEROWANIA}
                value={referralData}
                onChange={setReferralData}
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <span className="font-roboto mb-0.5 text-[14px] font-semibold text-[#C9C9C9]">
                Warunki Badania
              </span>
              <MultiSelect
                options={WARUNKI_BADANIA}
                value={circumstancesData}
                onChange={setCircumstancesData}
              />
            </div>
            {error && <span className="text-sm text-red-400">{error}</span>}
            <div className="mt-2 flex w-full flex-row gap-2">
              <button
                type="button"
                className="h-10 flex-1 truncate rounded bg-[#348CFD] px-4 py-2 font-semibold text-white transition hover:bg-[#225BA4]"
                onClick={fetchFeatures}
                disabled={!findingName || !((displayValue && displayUnit) || size) || loading}
                style={{ minWidth: 0 }}
              >
                {loading ? '...' : 'Pobierz cechy'}
              </button>
              <button
                type="button"
                className="h-10 flex-1 truncate rounded bg-[#348CFD] px-4 py-2 font-semibold text-white transition hover:bg-[#225BA4]"
                onClick={fetchLocations}
                disabled={!findingName || !((displayValue && displayUnit) || size) || loading}
                style={{ minWidth: 0 }}
              >
                {loading ? '...' : 'Pobierz lokalizacje'}
              </button>
            </div>
          </form>
        )}
        {step === 'features' && featureData && (
          <FeatureTree
            data={featureData}
            onDone={selectedList => {
              onSelect(selectedList.map(n => n.name).join(' ➝ '));
            }}
            onBack={resetAll}
          />
        )}
        {step === 'locations' && locData && (
          <LocationTree
            data={locData}
            onDone={selectedList => {
              onSelect(selectedList.map(n => n.name).join(' ➝ '));
            }}
            onBack={resetAll}
          />
        )}
      </div>
    </div>
  );
}
