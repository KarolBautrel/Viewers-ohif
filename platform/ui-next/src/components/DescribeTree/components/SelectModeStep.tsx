import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SelectModeStep({
  describeResult,
  isReadyToConfirm,
  onEditLocalization,
  onAddVirtualLocation,
  onDescribe,
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation('MeasurementDescribe');

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-white">{t('selectMode.whatToDo')}</span>

      <button
        className="rounded bg-[#348CFD] py-2 text-white"
        onClick={onEditLocalization}
      >
        {t('selectMode.editLocalization')}
      </button>
      <button
        className="rounded bg-[#225BA4] py-2 text-white"
        onClick={onAddVirtualLocation}
      >
        {t('selectMode.addVirtualLocation')}
      </button>
      <button
        className="rounded bg-[#14d6f8] py-2 font-bold text-black hover:bg-[#0db8d7]"
        onClick={onDescribe}
      >
        {t('selectMode.describe')}
      </button>

      {describeResult.localization?.length > 0 && (
        <div className="mt-4">
          <span className="text-sm font-semibold text-white">
            {t('selectMode.measurementLocation')}
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {describeResult.localization.map((loc, idx) => (
              <span
                key={idx}
                className={`rounded-2xl px-3 py-1 text-sm font-medium ${
                  loc.ROI === false ? 'bg-[#62768b] text-white' : 'bg-[#225BA4] text-white'
                }`}
              >
                {loc.name} {loc.ROI === false ? `(${t('selectMode.outsideROI')})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        className={`mt-4 w-full rounded py-2 text-white transition ${
          isReadyToConfirm
            ? 'cursor-pointer bg-green-600 hover:bg-green-700'
            : 'cursor-not-allowed bg-[#101225] text-gray-500'
        }`}
        onClick={onConfirm}
        disabled={!isReadyToConfirm}
      >
        {t('selectMode.confirm')}
      </button>
    </div>
  );
}
