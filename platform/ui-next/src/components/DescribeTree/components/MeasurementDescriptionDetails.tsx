import React, { useEffect } from 'react';

function getLeafPill(node) {
  let first = node;
  let last = node;
  while (last.children_lokalizacja && last.children_lokalizacja.length > 0) {
    last = last.children_lokalizacja[last.children_lokalizacja.length - 1];
  }
  return { first, last };
}

export function MeasurementDescriptionDetails({ description }) {
  useEffect(() => {
    console.log('>>>>> DESCRIPTION', description);
  }, [description]);
  if (!description) return null;
  return (
    <div className="flex flex-col gap-4">
      {/* Objaw */}
      {description.finding?.name && (
        <div className="flex flex-col gap-1">
          <span className="text-secondary-foreground font-semibold">Objaw radiologiczny:</span>
          <span className="mt-1 w-fit rounded-2xl bg-[#14d6f8] px-3 py-1 text-sm font-bold text-black">
            {description.finding.name}
          </span>
        </div>
      )}

      {/* Lokalizacje */}
      {Array.isArray(description.localization) && description.localization.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-secondary-foreground font-semibold">Lokalizacja pomiaru:</span>
          {/* ROI (standard) */}
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
                    className="rounded-2xl bg-[#225BA4] px-3 py-1 text-sm font-medium text-white"
                  >
                    {label}
                  </span>
                );
              })}
            {/* Poza ROI */}
            {description.localization
              .filter(l => l.ROI === false)
              .map((loc, idx) => {
                const { first, last } = getLeafPill(loc);
                const label =
                  first.name === last.name ? first.name : `${first.name} — ${last.name}`;
                return (
                  <span
                    key={(loc.uuid || idx) + '_pozaROI'}
                    className="rounded-2xl bg-[#62768b] px-3 py-1 text-sm font-medium text-white"
                  >
                    {label} (poza ROI)
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Cechy */}
      {Array.isArray(description.description) &&
        description.description.filter(f => f.type === 'cecha').length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-secondary-foreground font-semibold">Cechy:</span>
            {description.description
              .filter(feature => feature.type === 'cecha')
              .map((feature, idx) => (
                <span
                  key={feature.uuid || feature.name + idx}
                  className="mt-1 w-fit rounded-2xl bg-[#23274a] px-3 py-1 text-sm font-medium text-white"
                >
                  {feature.name}
                </span>
              ))}
          </div>
        )}

      {/* Wnioski */}
      {Array.isArray(description.description) &&
        description.description.filter(d => d.type === 'wnioski').length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-[#ffdcb0]">Wnioski:</span>
            {description.description
              .filter(d => d.type === 'wnioski')
              .map((diagnosis, idx) => (
                <span
                  key={diagnosis.uuid || diagnosis.name + idx}
                  className="mt-1 w-fit rounded-2xl bg-[#7d2424] px-3 py-1 text-sm font-medium text-[#ffdcb0]"
                >
                  {diagnosis.name}
                </span>
              ))}
          </div>
        )}

      {/* Rozpoznania */}
      {Array.isArray(description.description) &&
        description.description.filter(d => d.type === 'rozpoznanie_roznicowe').length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-[#ffdcb0]">Rozpoznania:</span>
            {description.description
              .filter(d => d.type === 'rozpoznanie_roznicowe')
              .map((diagnosis, idx) => (
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
