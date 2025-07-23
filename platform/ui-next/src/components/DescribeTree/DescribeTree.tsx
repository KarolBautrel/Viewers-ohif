import React, { useState, useEffect } from 'react';
import FeatureTree from './components/FeatureTree';
import LocationTree from './components/LocationTree';
import type { CechaNode, DescriptionItem } from './types';
import { fetchFeatureTree, fetchLocalizationTree, fetchSymptoms } from '../../apiService/api';
import SelectModeStep from './components/SelectModeStep';
import FormStep from './components/FormStep';
import { NodeType, Step } from './enums';

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
  circumstancecData: Record<string, string>[];
}) {
  const [step, setStep] = useState<Step>(Step.Locations);
  const [featureData, setFeatureData] = useState<CechaNode[] | null>(null);
  const [locData, setLocData] = useState<any[] | null>(null);
  const [gatingsUuid, setGatingUuids] = useState<string[]>([]);
  const [describeResult, setDescribeResult] = useState({
    circumstances: circumstancecData || null,
    localization: [],
    description: null,
  });
  const [symptomOptions, setSymptomOptions] = useState<string[]>([]);
  const [localizationRecon, setLocalizationRecon] = useState<any[]>([]);

  const [findingName, setFindingName] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMeasurement = measurements?.find(m => m.uid === uid);
  const hasLocalization = currentMeasurement?.description?.localization?.length > 0;

  useEffect(() => {
    async function fetchSymptomsOptions() {
      try {
        const data = await fetchSymptoms();

        if (Array.isArray(data)) {
          const names = data
            .map(symptom => symptom.name)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'pl'));

          setSymptomOptions(names);
        } else {
          throw new Error('Niepoprawna odpowiedź z API.');
        }
      } catch (e) {
        console.error('Błąd pobierania objawów:', e);
      }
    }

    fetchSymptomsOptions();
  }, []);
  useEffect(() => {
    if (hasLocalization) {
      setDescribeResult(r => ({
        ...r,
        localization: currentMeasurement.description.localization,
        description: currentMeasurement.description.description,
      }));
      setStep(Step.SelectMode);
    } else {
      fetchLocations();
    }
  }, []);

  function findReconFromLocalization(selectedLoc, reconFromLocalization = []) {
    if (!selectedLoc || !reconFromLocalization) return [];
    const selectedUuids = Array.isArray(selectedLoc)
      ? selectedLoc.map(l => l.uuid)
      : [selectedLoc.uuid];
    let result = [];
    for (const loc of reconFromLocalization) {
      if (selectedUuids.includes(loc.uuid)) {
        for (const meta of loc.children_dane_z_metadanych || []) {
          for (const recon of meta.children_rozpoznanie_roznicowe || []) {
            result.push({
              ...recon,
              metaName: meta.name,
              source: 'localization',
            });
          }
        }
      }
    }
    return result;
  }

  let displayValue = '';
  let displayUnit = '';
  let unitDimension = '';
  if (currentMeasurement) {
    if (currentMeasurement.toolName === 'Length') {
      const d = currentMeasurement.data?.[Object.keys(currentMeasurement.data)[0]];
      if (d?.length) {
        displayValue = d.length.toFixed(1);
        displayUnit = 'mm';
        unitDimension = null;
      }
    } else if (['CircleROI', 'PlanarFreehandROI'].includes(currentMeasurement.toolName)) {
      const d = currentMeasurement.data?.[Object.keys(currentMeasurement.data)[0]];
      if (d?.area) {
        displayValue = d.area.toFixed(1);
        displayUnit = 'mm²';
        unitDimension = 'square';
      }
    }
  }

  const extractGatingsUUID = gatingData => {
    return (gatingData?.[0]?.bramkowania || []).map(b => b.from_id);
  };

  async function fetchFeatures() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeatureTree({
        findingName,
        size: displayValue || size,
        unitDimension,
        referralData,
      });

      setFeatureData(data);
      setGatingUuids(extractGatingsUUID(data));
      setStep(Step.Features);
    } catch (e) {
      console.error(e);
      setError((e as Error).message || 'Nie udało się pobrać drzewa cech.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocations(isVirtual = false) {
    setLoading(true);
    setError(null);
    setDescribeResult(r => ({ ...r, description: null }));

    try {
      const data = await fetchLocalizationTree();
      setLocData(data);
      setGatingUuids(extractGatingsUUID(data));
      setStep(isVirtual ? Step.VirtualLocation : Step.Locations);
    } catch (e) {
      console.error(e);
      setError((e as Error).message || 'Nie udało się pobrać lokalizacji.');
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
    console.log('handleLocalizationDone: selectedPath', JSON.stringify(selectedPath, null, 2));

    const recon = findReconFromLocalization(
      selectedPath,
      currentMeasurement?.description?.recon_from_localization || []
    );
    setLocalizationRecon(recon);
    setDescribeResult(r => ({ ...r, localization: selectedPath }));
    setStep(Step.SelectMode);
  }

  function handleVirtualLocalizationDone(selectedPath: any) {
    const flaggedLocations = selectedPath.map(applyROIFalseRecursive);
    setDescribeResult(r => ({
      ...r,
      localization: [...(r.localization || []).filter(l => l.ROI !== false), ...flaggedLocations],
    }));
    setStep(Step.SelectMode);
  }

  function handleFeatureDone(descriptionList: any) {
    setDescribeResult(r => ({
      ...r,
      description: descriptionList,
    }));
    setStep(Step.SelectMode);
  }
  function mergeDescriptions(
    { features = [], conclusions = [], diagnoses = [] } = {},
    virtualDescriptions = []
  ) {
    const byUuid: Record<string, DescriptionItem>  = {};
    for (const d of [...features, ...conclusions, ...diagnoses, ...virtualDescriptions]) {
      const key = d.uuid || d.name;
      if (!byUuid[key]) byUuid[key] = { ...d, weight: d.weight || 1 };
      else byUuid[key].weight += d.weight || 1;
    }
    const merged = Object.values(byUuid);

    return {
      features: merged.filter(d => d.type === NodeType.CHARACTERISTIC),
      conclusions: merged.filter(d => d.type === NodeType.SUMMARY),
      diagnoses: merged.filter(d => d.type === NodeType.RECOGNITIONS),
    };
  }

  const isReadyToConfirm =
    Array.isArray(describeResult.localization) &&
    describeResult.localization.length > 0 &&
    describeResult.description !== null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#090C2A] py-6">
      <div className="relative flex max-h-screen w-[342px] flex-col gap-4 rounded-lg bg-[#090C2A] p-4 shadow">
        {loading && (
          <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-[#090C2A]/80 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#090C2A]/90 px-4 text-center">
            <div className="px- rounded bg-[#090C2A] py-3 text-sm text-white shadow-lg">
              <p className="mb-2 font-semibold">Wystąpił błąd:</p>
              <p>Nie udalo sie pobrac danych do drzewa.</p>
              <button
                onClick={() => {
                  setError(null);
                  onCancel();
                }}
                className="mt-4 rounded bg-[#225BA4] px-3 py-1 text-white hover:bg-[#2b6cb0]"
              >
                Wróć
              </button>
            </div>
          </div>
        )}

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
          <SelectModeStep
            describeResult={describeResult}
            isReadyToConfirm={isReadyToConfirm}
            onEditLocalization={() => fetchLocations()}
            onAddVirtualLocation={() => fetchLocations(true)}
            onDescribe={() => setStep(Step.Form)}
            onConfirm={() => {
              if (!isReadyToConfirm) return;
              onSelect({
                localization: describeResult.localization,
                description: mergeDescriptions(
                  {
                    features: describeResult.description?.features || [],
                    conclusions: describeResult.description?.conclusions || [],
                    diagnoses: describeResult.description?.diagnoses || [],
                  },
                  localizationRecon
                ),
                circumstances: describeResult.circumstances,
                referral: referralData,
                finding: describeResult.description?.finding || [],
              });
            }}
            onCancel={onCancel}
          />
        )}

        {step === 'locations' && locData && (
          <LocationTree
            data={locData}
            onDone={handleLocalizationDone}
            onBack={() => setStep(Step.SelectMode)}
            onFinish={handleLocalizationDone}
          />
        )}

        {step === 'virtualLocation' && locData && (
          <LocationTree
            data={locData}
            onDone={handleVirtualLocalizationDone}
            onBack={() => setStep(Step.SelectMode)}
            onFinish={handleVirtualLocalizationDone}
          />
        )}

        {step === 'form' && (
          <FormStep
            symptomOptions={symptomOptions}
            findingName={findingName}
            setFindingName={setFindingName}
            loading={loading}
            error={error}
            onBack={() => setStep(Step.SelectMode)}
            onFetchFeatures={fetchFeatures}
          />
        )}

        {step === 'features' && featureData && (
          <FeatureTree
            data={featureData}
            onDone={handleFeatureDone}
            onBack={() => setStep(Step.SelectMode)}
            gatingUuids={gatingsUuid}
          />
        )}
      </div>
    </div>
  );
}
