import React from 'react';

export function ReferralDataSelector({
  referralData,
  circumstancesData,
  onOpenModal,
}: {
  referralData: string[];
  circumstancesData: string[];
  onOpenModal: () => void;
}) {
  const renderPills = (arr: string[]) =>
    arr.length > 0 ? (
      <div className="mt-1 flex flex-wrap gap-2">
        {arr.map(val => (
          <span
            key={val}
            className="rounded-2xl bg-blue-900 px-3 py-1 text-sm font-medium text-blue-100"
          >
            {val}
          </span>
        ))}
      </div>
    ) : (
      <span className="mt-1 block text-sm text-gray-400">Brak wybranych danych</span>
    );

  return (
    <div className="mb-4 w-full">
      <div className="flex justify-center">
        <button
          className="rounded bg-blue-800 px-3 py-1.5 text-sm text-white transition hover:bg-blue-900"
          onClick={onOpenModal}
          type="button"
        >
        Podaj Dane wejsciowe
        </button>
      </div>
      <div className="mt-3">
        <div>
          <span className="text-sm font-semibold text-blue-200">Dane ze skierowania:</span>
          {renderPills(referralData)}
        </div>
        <div className="mt-2">
          <span className="text-sm font-semibold text-blue-200">Warunki badania:</span>
          {renderPills(circumstancesData)}
        </div>
      </div>
    </div>
  );
}
