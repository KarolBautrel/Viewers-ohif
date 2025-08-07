import React from 'react';
import AutocompleteSingleSelect from '../../AutocompleteSingleSelect/AutocompleteSingleSelect';
import { useTranslation } from 'react-i18next';

export default function FormStep({
  symptomOptions,
  findingName,
  setFindingName,
  loading,
  error,
  onBack,
  onFetchFeatures,
}) {
  const { t } = useTranslation('MeasurementDescribe');

  return (
    <form
      onSubmit={e => e.preventDefault()}
      className="flex flex-col gap-4"
    >
      <label className="flex w-full flex-col gap-1">
        <span className="mb-0.5 flex flex-row items-center text-[14px] font-semibold text-[#C9C9C9]">
          {t('form.chooseSymptom')}
          <span className="ml-1 text-[#F03E3E]">*</span>
        </span>
        <AutocompleteSingleSelect
          options={symptomOptions}
          value={findingName}
          onChange={setFindingName}
          placeholder={t('form.placeholderSymptom')}
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded bg-[#23274a] py-2 text-white"
        >
          {t('form.exit')}
        </button>
        <button
          type="button"
          onClick={onFetchFeatures}
          disabled={!findingName || loading}
          className="flex-1 rounded bg-[#348CFD] py-2 text-white"
        >
          {loading ? t('form.loading') : t('form.fetchFeatures')}
        </button>
      </div>
      {error && <div className="rounded bg-red-800 p-2 text-sm text-white">{error}</div>}
    </form>
  );
}
