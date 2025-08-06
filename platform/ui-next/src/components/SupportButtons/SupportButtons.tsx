import React from 'react';

type PatientReportButton = {
  refId?: string | number | null;
};
// Dodam tlumaczenia
export const OpenPatientReportButton: React.FC<PatientReportButton> = ({ refId }) => {
  if (!refId) return null;
  return (
    <button
      className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition hover:bg-blue-600"
      onClick={() => window.open(`/dashboard/referrals/${refId}/description/`, `ris-${refId}`)}
    >
      Wyświetl raport pacjenta
    </button>
  );
};

type ShowJsonReportProps = {
  onClick: () => void;
};

export const ShowReportJsonButton: React.FC<ShowJsonReportProps> = ({ onClick }) => (
  <button
    className="rounded bg-blue-500 px-3 py-1 text-sm text-white transition hover:bg-blue-600"
    onClick={onClick}
  >
    Wyświetl JSON z raportem
  </button>
);
