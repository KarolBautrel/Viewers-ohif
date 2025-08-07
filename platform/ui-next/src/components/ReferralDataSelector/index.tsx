import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export function ReferralDataSelector({
  referralData,
  circumstancesData,
  onOpenModal,
}: {
  referralData: string[];
  circumstancesData: Record<string, string>[];
  onOpenModal: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { t } = useTranslation('MeasurementDescribe');

  const renderPills = (arr: any[], type = 'string') =>
    arr && arr.length > 0 ? (
      <div className="mt-1 flex w-full flex-col gap-2">
        {arr.map((val, idx) => {
          if (typeof val === 'string') {
            return (
              <span
                key={val}
                className="block w-full rounded-2xl bg-blue-900 px-3 py-1 text-sm font-medium text-blue-100"
              >
                {val}
              </span>
            );
          } else if (val && typeof val === 'object') {
            return (
              <span
                key={val.warunek || idx}
                className="block w-full rounded-2xl bg-blue-900 px-3 py-1 text-sm font-medium text-blue-100"
              >
                {val.warunek}
              </span>
            );
          }
          return null;
        })}
      </div>
    ) : (
      <span className="mt-1 block text-sm text-gray-400">{t('referralDataSelector.noData')}</span>
    );

  return (
    <div className="mb-4 w-full rounded p-3">
      <button
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-blue-200"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <span>{t('descriptionModal.title')}</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="mt-3">
          <div className="mb-3">
            <span className="text-sm font-semibold text-blue-200">
              {t('descriptionModal.referralLabel')}:
            </span>
            {renderPills(referralData, 'string')}
          </div>
          <div>
            <span className="text-sm font-semibold text-blue-200">
              {t('descriptionModal.conditionsLabel')}:
            </span>
            {renderPills(circumstancesData, 'condition')}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              className="rounded bg-blue-800 px-3 py-1.5 text-sm text-white transition hover:bg-blue-900"
              onClick={onOpenModal}
              type="button"
            >
              {t('referralDataSelector.modifyEntryData')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
