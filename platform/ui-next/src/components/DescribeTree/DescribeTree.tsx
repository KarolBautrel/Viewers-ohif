import React, { useState, useEffect } from 'react';
import CircumstancesTree from './components/CircumstancesTree';
import FeatureTree from './components/FeatureTree';
import LocationTree from './components/LocationTree';
import type { CechaNode } from './types';
import { API_URL } from './consts';

export const OBJAW_RADIOLOGICZNY = ['guzek miąższu płuca', 'mnogie guzki płuca'];

export default function DescribeTree({
  onSelect,
  onCancel,
  measurements,
  uid,
  referralData,
  circumstancecData,
}: {
  onSelect: (desc: Record<string, any>) => void;
  onCancel: () => void;
  measurements: any[];
  uid: string;
  referralData: string[];
  circumstancecData: string[];
}) {
  const [step, setStep] = useState<
    'selectMode' | 'locations' | 'form' | 'features' | 'virtualLocation'
  >('locations');
  const [featureData, setFeatureData] = useState<CechaNode[] | null>(null);
  const [locData, setLocData] = useState<any[] | null>(null);
  const [describeResult, setDescribeResult] = useState({
    circumstances: circumstancecData || null,
    localization: [],
    description: null,
  });

  const [findingName, setFindingName] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMeasurement = measurements?.find(m => m.uid === uid);
  const hasLocalization = currentMeasurement?.description?.localization?.length > 0;

  useEffect(() => {
    if (hasLocalization) {
      setDescribeResult(r => ({
        ...r,
        localization: currentMeasurement.description.localization,
        description: currentMeasurement.description.description,
      }));
      setStep('selectMode');
    } else {
      fetchLocations();
    }
  }, []);

  let displayValue = '';
  let displayUnit = '';
  if (currentMeasurement) {
    if (currentMeasurement.toolName === 'Length') {
      const d = currentMeasurement.data?.[Object.keys(currentMeasurement.data)[0]];
      if (d?.length) {
        displayValue = d.length.toFixed(1);
        displayUnit = 'mm';
      }
    } else if (['CircleROI', 'PlanarFreehandROI'].includes(currentMeasurement.toolName)) {
      const d = currentMeasurement.data?.[Object.keys(currentMeasurement.data)[0]];
      if (d?.area) {
        displayValue = d.area.toFixed(1);
        displayUnit = 'mm²';
      }
    }
  }

  async function fetchFeatures() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ finding_name: findingName, size: displayValue || size });
      const res = await fetch(`${API_URL}/api/neo/objawy/by-name/cechy/?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_data: referralData }),
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

  async function fetchLocations(isVirtual = false) {
    setLoading(true);
    setError(null);
    /// Za kazdym razem, gdy zmieniamy lokalizacje, opis
    // musi sie zrestartowac, dlatego daje desc na null
    setDescribeResult(r => ({
      ...r,
      description: null,
    }));
    try {
      const res = await fetch(`${API_URL}/api/neo/objawy/by-name/lokalizacja/`);
      if (!res.ok) throw new Error('Błąd pobierania lokalizacji');
      const data = await res.json();
      setLocData(data);
      setStep(isVirtual ? 'virtualLocation' : 'locations');
    } catch (e) {
      setError('Nie udało się pobrać lokalizacji.');
    } finally {
      setLoading(false);
    }
  }

  function applyROIFalseRecursive(node) {
    return {
      ...node,
      ROI: false,
      children_lokalizacja: (node.children_lokalizacja || []).map(applyROIFalseRecursive),
    };
  }

  function handleLocalizationDone(selectedPath: any) {
    setDescribeResult(r => ({ ...r, localization: selectedPath }));
    setStep('selectMode');
  }

  function handleVirtualLocalizationDone(selectedPath: any) {
    const flaggedLocations = selectedPath.map(applyROIFalseRecursive);
    setDescribeResult(r => ({
      ...r,
      localization: [...r.localization, ...flaggedLocations],
    }));
    setStep('selectMode');
  }

  function handleFeatureDone(descriptionList: any) {
    setDescribeResult(r => ({
      ...r,
      description: descriptionList,
    }));
    setStep('selectMode');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#090C2A] py-6">
      <div className="relative flex max-h-screen w-[342px] flex-col gap-4 rounded-lg bg-[#090C2A] p-4 shadow">
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-[#C9C9C9]">Opisz pomiar</span>
          <button
            onClick={onCancel}
            className="h-8 w-8 rounded text-white hover:bg-[#23274a]"
          >
            ✕
          </button>
        </div>

        {step === 'selectMode' && (
          <div className="flex flex-col gap-3">
            <span className="text-sm text-white">Co chcesz zrobić?</span>
            <button
              className="rounded bg-[#348CFD] py-2 text-white"
              onClick={() => fetchLocations()}
            >
              Edytuj lokalizację
            </button>
            <button
              className="rounded bg-[#348CFD] py-2 text-white"
              onClick={() => setStep('form')}
            >
              Edytuj opis (cechy)
            </button>
            <button
              className="rounded bg-[#225BA4] py-2 text-white"
              onClick={() => fetchLocations(true)}
            >
              Dodaj kolejne lokalizacje (wirtualne)
            </button>
            {describeResult.localization?.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-semibold text-white">Aktualne lokalizacje:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {describeResult.localization.map((loc, idx) => (
                    <span
                      key={idx}
                      className={`rounded-2xl px-3 py-1 text-sm font-medium ${loc.ROI === false ? 'bg-[#62768b] text-white' : 'bg-[#225BA4] text-white'}`}
                    >
                      {loc.name} {loc.ROI === false ? '(wirtualna)' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              className="mt-4 rounded bg-green-600 py-2 text-white"
              onClick={() =>
                onSelect({
                  localization: describeResult.localization,
                  description: describeResult.description,
                  circumstances: describeResult.circumstances,
                  referral: referralData,
                })
              }
            >
              Zatwierdź i zakończ
            </button>
          </div>
        )}

        {step === 'locations' && locData && (
          <LocationTree
            data={locData}
            onDone={handleLocalizationDone}
            onBack={() => setStep('selectMode')}
            onFinish={handleLocalizationDone}
          />
        )}

        {step === 'virtualLocation' && locData && (
          <LocationTree
            data={locData}
            onDone={handleVirtualLocalizationDone}
            onBack={() => setStep('selectMode')}
            onFinish={handleVirtualLocalizationDone}
          />
        )}

        {step === 'form' && (
          <form
            onSubmit={e => e.preventDefault()}
            className="flex flex-col gap-4"
          >
            <label className="flex w-full flex-col gap-1">
              <span className="mb-0.5 flex flex-row items-center text-[14px] font-semibold text-[#C9C9C9]">
                Wybierz objaw<span className="ml-1 text-[#F03E3E]">*</span>
              </span>
              <select
                className="h-10 w-full rounded border border-[#225BA4] bg-[#0B0F2B] px-3 text-[16px] text-white outline-none"
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
              onClick={fetchFeatures}
              disabled={!findingName || loading}
              className="rounded bg-[#348CFD] py-2 text-white"
            >
              {loading ? 'Ładowanie...' : 'Pobierz cechy'}
            </button>
            {error && <div className="text-red-400">{error}</div>}
          </form>
        )}

        {step === 'features' && featureData && (
          <FeatureTree
            data={featureData}
            onDone={handleFeatureDone}
            onBack={() => setStep('form')}
          />
        )}
      </div>
    </div>
  );
}
