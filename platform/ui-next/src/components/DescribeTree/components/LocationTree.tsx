import React, { useState } from "react";

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

  const nodes = selectedPath.length === 0
    ? data
    : selectedPath[selectedPath.length - 1].children_lokalizacja || [];

  function handleSelect(node: any) {
    setSelectedPath([...selectedPath, node]);
  }

  function handleBackOneLevel() {
    setSelectedPath(selectedPath.slice(0, -1));
  }

  function handleConfirm() {
    onDone(selectedPath);
  }

  function handleReset() {
    setSelectedPath([]);
    onBack();
  }

  return (
    <div className="flex flex-col gap-4 w-full">
     <div className="flex flex-wrap items-center gap-2">
  {selectedPath.map((node, idx) => (
    <React.Fragment key={node.element_id_property}>
      <span className="rounded-2xl bg-[#23274a] px-3 py-1 text-sm font-medium text-white">
        {node.name}
      </span>
      {idx < selectedPath.length - 1 && (
        <span className="text-[#C9C9C9] text-sm">→</span>
      )}
    </React.Fragment>
  ))}
</div>

      <div className="flex flex-col gap-2">
        {nodes.length > 0 ? (
          nodes.map(node => (
            <button
              key={node.element_id_property}
              className="bg-[#23274a] hover:bg-[#2d314f] text-white rounded px-3 py-2 font-semibold text-sm"
              onClick={() => handleSelect(node)}
            >
              {node.name}
            </button>
          ))
        ) : (
          <div className="text-[#9FA6B2]">To już najniższy poziom drzewa.</div>
        )}
      </div>
      <div className="flex flex-row gap-2 mt-3">
        {selectedPath.length > 0 && (
          <>
            <button
              className="flex-1 bg-[#348CFD] text-white py-2 rounded"
              onClick={handleConfirm}
            >
              Zatwierdź
            </button>
            <button
              className="flex-1 bg-[#23274a] text-[#C9C9C9] py-2 rounded"
              onClick={handleBackOneLevel}
            >
              Wstecz
            </button>
          </>
        )}
        <button
          className="flex-1 bg-[#23274a] text-[#C9C9C9] py-2 rounded"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
