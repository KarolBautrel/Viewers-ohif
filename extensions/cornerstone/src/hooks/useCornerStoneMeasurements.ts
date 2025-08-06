import { useEffect, useState } from 'react';
import * as cs3dTools from '@cornerstonejs/tools';
import { fetchMeasurement } from '../api/apiService';
import { convertToCornerstoneFormat } from '../helpers';

type Description = {
  referral?: string[];
  circumstances?: { warunek?: string }[];
};

export function useCornerstoneMeasurements({
  descriptionId,
  studyId,
  measurementService,
}: {
  descriptionId: string | null;
  studyId: string | null;
  measurementService: any;
}) {
  const [referral, setReferral] = useState<string[]>([]);
  const [circumstances, setCircumstances] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!descriptionId || !studyId) return;

    const fetchAndAddMeasurements = async () => {
      setIsLoading(true);
      try {
        const rawMeasurements = await fetchMeasurement(descriptionId, studyId);
        const sanitized = rawMeasurements.map(({ modifiedTimestamp, ...rest }) => rest);

        const allReferral: string[] = [];
        const allCircumstances: string[] = [];

        sanitized.forEach(m => {
          const desc: Description | undefined = m.description;
          if (desc?.referral?.length) {
            allReferral.push(...desc.referral);
          }
          if (desc?.circumstances?.length) {
            desc.circumstances.forEach(c => {
              if (c?.warunek) allCircumstances.push(c.warunek);
            });
          }
        });

        setReferral([...new Set(allReferral)]);
        setCircumstances([...new Set(allCircumstances)]);

        measurementService.addMeasurementsFromJSON(sanitized);
        const measurementsCornerStoned = convertToCornerstoneFormat(sanitized);
        measurementsCornerStoned.forEach(c =>
          cs3dTools.annotation.state.addAnnotation(JSON.parse(JSON.stringify(c)))
        );
      } catch (e) {
        setReferral([]);
        setCircumstances([]);
        console.error('Nie udalo sie pobrac:', e);
      }
      setIsLoading(false);
    };

    fetchAndAddMeasurements();
  }, [descriptionId, studyId, measurementService]);

  return { referral, circumstances, isLoading };
}
