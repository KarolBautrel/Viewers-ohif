import React, { useState, useEffect } from 'react';
import CircumstancesTree from './components/CircumstancesTree';
import FeatureTree from './components/FeatureTree';
import LocationTree from './components/LocationTree';
import type { CechaNode } from './types';
import { API_URL } from './consts';
export const OBJAW_RADIOLOGICZNY = [
  // 'część lita częściowo litego guzka miąższu płuca',
  'guzek miąższu płuca',
  'mnogie guzki płuca',
  // 'częściowo lity guzek miąższu płuca',
];

export default function DescribeTree({
  onSelect,
  onCancel,
  measurements,
  uid,
  referralData,
  onSocketMessage,
}: {
  onSelect: (desc: Record<string, any>) => void;
  onCancel: () => void;
  measurements: any[];
  uid: string;
  referralData: string[];
  circumstancecData: string[];
  onSocketMessage: (socketMessage: Record<string, any>, uid: string) => void;
}) {
  const [step, setStep] = useState<'circumstances' | 'form' | 'features' | 'locations'>('form');
  const [featureData, setFeatureData] = useState<CechaNode[] | null>(null);
  const [locData, setLocData] = useState<any[] | null>(null);
  const [describeResult, setDescribeResult] = useState<{
    circumstances: any[] | null;
    localization: Record<any, any> | null;
    description: Record<any, any> | null;
  }>({
    circumstances: null,
    localization: null,
    description: null,
  });

  const [findingName, setFindingName] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [loading, setLoading] = useState(false);
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

  function handleCircumstancesDone(selectedCircumstances: any[]) {
    setDescribeResult(r => ({ ...r, circumstances: selectedCircumstances }));
    setStep('form');
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

  async function fetchLocations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/neo/objawy/by-name/lokalizacja/`, { method: 'GET' });
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
    setDescribeResult({ circumstances: null, localization: null, description: null });
    setError(null);
  }

  function handleFeatureDone(descriptionList: Record<any, any>) {
    setDescribeResult(r => {
      const full = { ...r, description: descriptionList };
      return full;
    });
    fetchLocations();
  }

  function handleLocalizationDone(selectedPath: Record<any, any>) {
    setDescribeResult(r => ({ ...r, localization: selectedPath }));
    const finalDes = { ...describeResult, localization: selectedPath };
    onSelect(finalDes);
    onSocketMessage(finalDes, uid);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#090C2A] py-6">
      <div className="relative flex max-h-screen w-[342px] flex-col items-start gap-2 overflow-y-auto rounded-lg bg-[#090C2A] px-4 pt-4 pb-6 shadow-[0px_1px_2px_rgba(0,0,0,0.10),0px_1px_3px_rgba(0,0,0,0.05)]">
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

        <div className="mb-2 flex w-[310px] justify-center">
          <span className="font-roboto rounded-2xl bg-[rgba(134,142,150,0.15)] px-3 py-1 text-[16px] text-white">
            {displayValue ? `${displayValue} ${displayUnit}` : '—'}
          </span>
        </div>

        {step === 'circumstances' && (
          <CircumstancesTree
            onDone={handleCircumstancesDone}
            onBack={onCancel}
          />
        )}

        {step === 'form' && (
          <form
            className="flex w-[310px] flex-col gap-4"
            onSubmit={e => e.preventDefault()}
          >
            <div className="flex w-full flex-row items-center gap-2">
              <span className="font-roboto text-[14px] font-semibold text-[#C9C9C9]">
                Objaw radiologiczny
              </span>
            </div>
            <label className="flex w-full flex-col gap-1">
              <span className="font-roboto mb-0.5 flex flex-row items-center text-[14px] font-semibold text-[#C9C9C9]">
                Wybierz objaw
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
            <button
              type="button"
              className="mt-2 h-10 w-full rounded bg-[#348CFD] px-4 py-2 font-semibold text-white transition hover:bg-[#225BA4]"
              onClick={fetchFeatures}
              disabled={!findingName || loading}
            >
              {loading ? '...' : 'Pobierz cechy'}
            </button>
            {error && <span className="text-sm text-red-400">{error}</span>}
          </form>
        )}

        {step === 'features' && featureData && (
          <FeatureTree
            data={featureData}
            onDone={handleFeatureDone}
            onBack={() => setStep('form')}
          />
        )}

        {step === 'locations' && locData && (
          <LocationTree
            data={locData}
            onDone={handleLocalizationDone}
            onBack={() => setStep('features')}
          />
        )}
      </div>
    </div>
  );
}
