import { useEffect, useState } from 'react';

type ViewerUrlParams = {
  descriptionId: string | null;
  studyId: string | null;
  patientGender: string | null;
  patientAge: string | null;
  refId: string | null;
};

export function useViewerUrlParams(): ViewerUrlParams {
  const [params, setParams] = useState<ViewerUrlParams>({
    descriptionId: null,
    studyId: null,
    patientGender: null,
    patientAge: null,
    refId: null,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setParams({
      descriptionId: searchParams.get('descriptionId'),
      studyId: searchParams.get('studyId'),
      patientGender: searchParams.get('patientGender'),
      patientAge: searchParams.get('patientAge'),
      refId: searchParams.get('refId'),
    });
  }, [window.location.search]);

  return params;
}
