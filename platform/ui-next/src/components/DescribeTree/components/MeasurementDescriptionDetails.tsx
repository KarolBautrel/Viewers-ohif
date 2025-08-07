import React from 'react';
import { useTranslation } from 'react-i18next';

function getLeafPill(node) {
  let first = node;
  let last = node;
  while (last.children_lokalizacja && last.children_lokalizacja.length > 0) {
    last = last.children_lokalizacja[last.children_lokalizacja.length - 1];
  }
  return { first, last };
}

export function MeasurementDescriptionDetails({ description }) {
  const { t } = useTranslation('MeasurementDescribe');

  if (!description) return null;

  const features = Array.isArray(description.description?.features)
    ? description.description.features
    : [];
  const conclusions = Array.isArray(description.description?.conclusions)
    ? description.description.conclusions
    : [];
  const diagnoses = Array.isArray(description.description?.diagnoses)
    ? description.description.diagnoses
    : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Objaw */}
      {description.finding?.name && (
        <div className="flex flex-col gap-1">
          <span className="text-secondary-foreground font-semibold">
            {t('details.radiologicalFinding')}
          </span>
          <span className="mt-1 w-fit rounded-2xl bg-[#14d6f8] px-3 py-1 text-sm font-bold text-black">
            {description.finding.name}
          </span>
        </div>
      )}

      {Array.isArray(description.localization) && description.localization.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-secondary-foreground font-semibold">
            {t('details.measurementLocation')}
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {description.localization
              .filter(l => l.ROI !== false)
              .map((loc, idx) => {
                const { first, last } = getLeafPill(loc);
                const label =
                  first.name === last.name ? first.name : `${first.name} — ${last.name}`;
                return (
                  <span
                    key={loc.uuid || idx}
                    className="mt-1 w-full rounded-2xl bg-[#225BA4] px-3 py-1 text-sm font-medium text-white"
                  >
                    {label}
                  </span>
                );
              })}
            {description.localization
              .filter(l => l.ROI === false)
              .map((loc, idx) => {
                const { first, last } = getLeafPill(loc);
                const label =
                  first.name === last.name ? first.name : `${first.name} — ${last.name}`;
                return (
                  <span
                    key={(loc.uuid || idx) + '_pozaROI'}
                    className="mt-1 w-full rounded-2xl bg-[#62768b] px-3 py-1 text-sm font-medium text-white"
                  >
                    {label} ({t('details.outsideROI')})
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {features.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-secondary-foreground font-semibold">{t('details.features')}</span>
          {features.map((feature, idx) => (
            <span
              key={feature.uuid || feature.name + idx}
              className="mt-1 w-fit rounded-2xl bg-[#23274a] px-3 py-1 text-sm font-medium text-white"
            >
              {feature.name}
            </span>
          ))}
        </div>
      )}

      {conclusions.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#ffdcb0]">{t('details.conclusions')}</span>
          {conclusions.map((conclusion, idx) => (
            <span
              key={conclusion.uuid || conclusion.name + idx}
              className="mt-1 w-fit rounded-2xl bg-[#7d2424] px-3 py-1 text-sm font-medium text-[#ffdcb0]"
            >
              {conclusion.name}
            </span>
          ))}
        </div>
      )}

      {diagnoses.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#ffdcb0]">{t('details.diagnoses')}</span>
          {diagnoses.map((diagnosis, idx) => (
            <span
              key={diagnosis.uuid || diagnosis.name + idx}
              className="mt-1 w-fit rounded-2xl bg-[#653828] px-3 py-1 text-sm font-medium text-[#ffdcb0]"
            >
              {diagnosis.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
