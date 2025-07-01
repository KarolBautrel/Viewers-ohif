import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ReferralDataSelector({
  referralData,
  circumstancesData,
  onOpenModal,
}: {
  referralData: string[];
  circumstancesData: string[];
  onOpenModal: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

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
    <div className="mb-4 w-full rounded p-3">
      <button
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-blue-200"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <span>Dane wyjściowe</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="mt-3">
          <div className="mb-3">
            <span className="text-sm font-semibold text-blue-200">Dane ze skierowania:</span>
            {renderPills(referralData)}
          </div>
          <div>
            <span className="text-sm font-semibold text-blue-200">Warunki badania:</span>
            {renderPills(circumstancesData)}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              className="rounded bg-blue-800 px-3 py-1.5 text-sm text-white transition hover:bg-blue-900"
              onClick={onOpenModal}
              type="button"
            >
              Modyfikuj dane wejściowe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
