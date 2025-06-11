import React, { useState } from 'react';
import { cleanChoice } from '../helpers';
export default function LocationTree({
  data,
  onDone,
  onBack,
}: {
  data: any[];
  onDone: (selected: any[]) => void;
  onBack: () => void;
}) {
  const [selectedPath, setSelectedPath] = useState<any[]>([]);

  const nodes =
    selectedPath.length === 0
      ? data
      : selectedPath[selectedPath.length - 1].children_lokalizacja || [];

  function handleSelect(node: any) {
    console.log(node)
    setSelectedPath([...selectedPath, node]);
  }

  function handleBackOneLevel() {
    setSelectedPath(selectedPath.slice(0, -1));
  }
  function handleConfirm() {
    const cleanedSelectedPath = cleanChoice(selectedPath);

    onDone(cleanedSelectedPath);
  }

  function handleReset() {
    setSelectedPath([]);
    onBack();
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {selectedPath.map((node, idx) => (
          <React.Fragment key={node.element_id_property}>
            <span className="rounded-2xl bg-[#23274a] px-3 py-1 text-sm font-medium text-white">
              {node.name}
            </span>
            {idx < selectedPath.length - 1 && <span className="text-sm text-[#C9C9C9]">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {nodes.length > 0 ? (
          nodes.map(node => (
            <button
              key={node.element_id_property}
              className="rounded bg-[#23274a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2d314f]"
              onClick={() => handleSelect(node)}
            >
              {node.name}
            </button>
          ))
        ) : (
          <div className="text-[#9FA6B2]">To już najniższy poziom drzewa.</div>
        )}
      </div>
      <div className="mt-3 flex flex-row gap-2">
        {selectedPath.length > 0 && (
          <>
            <button
              className="flex-1 rounded bg-[#348CFD] py-2 text-white"
              onClick={handleConfirm}
            >
              Zatwierdź
            </button>
            <button
              className="flex-1 rounded bg-[#23274a] py-2 text-[#C9C9C9]"
              onClick={handleBackOneLevel}
            >
              Wstecz
            </button>
          </>
        )}
        <button
          className="flex-1 rounded bg-[#23274a] py-2 text-[#C9C9C9]"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
