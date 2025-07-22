import React from 'react';

export default function SelectModeStep({
  describeResult,
  isReadyToConfirm,
  onEditLocalization,
  onAddVirtualLocation,
  onDescribe,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-white">Co chcesz zrobić?</span>

      <button
        className="rounded bg-[#348CFD] py-2 text-white"
        onClick={onEditLocalization}
      >
        Edytuj lokalizację ROI
      </button>
      <button
        className="rounded bg-[#225BA4] py-2 text-white"
        onClick={onAddVirtualLocation}
      >
        Dodaj lokalizacje poza ROI
      </button>
      <button
        className="rounded bg-[#14d6f8] py-2 font-bold text-black hover:bg-[#0db8d7]"
        onClick={onDescribe}
      >
        Opisuj
      </button>

      {describeResult.localization?.length > 0 && (
        <div className="mt-4">
          <span className="text-sm font-semibold text-white">Lokalizacja pomiaru:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {describeResult.localization.map((loc, idx) => (
              <span
                key={idx}
                className={`rounded-2xl px-3 py-1 text-sm font-medium ${
                  loc.ROI === false ? 'bg-[#62768b] text-white' : 'bg-[#225BA4] text-white'
                }`}
              >
                {loc.name} {loc.ROI === false ? '(poza ROI)' : ''}
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
        Zatwierdź
      </button>
    </div>
  );
}
