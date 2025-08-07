import React from 'react';
import { useTranslation } from 'react-i18next';

type PatientReportButton = {
  refId?: string | number | null;
};

export const OpenPatientReportButton: React.FC<PatientReportButton> = ({ refId }) => {
  const { t } = useTranslation('MeasurementDescribe');

  if (!refId) return null;

  return (
    <button
      className="h-8 w-56 truncate rounded bg-blue-500 px-3 py-1 text-sm text-white transition hover:bg-blue-600"
      onClick={() => window.open(`/dashboard/referrals/${refId}/description/`, `ris-${refId}`)}
      title={t('supportButtons.moveToPatientPanel')}
    >
      {t('supportButtons.moveToPatientPanel')}
    </button>
  );
};

type ShowJsonReportProps = {
  onClick: () => void;
};

export const ShowReportJsonButton: React.FC<ShowJsonReportProps> = ({ onClick }) => {
  const { t } = useTranslation('MeasurementDescribe');

  return (
    <button
      className="h-8 w-56 truncate rounded bg-blue-500 px-3 py-1 text-sm text-white transition hover:bg-blue-600"
      onClick={onClick}
      title={t('supportButtons.showJsonMeasurement')}
    >
      {t('supportButtons.showJsonMeasurement')}
    </button>
  );
};
