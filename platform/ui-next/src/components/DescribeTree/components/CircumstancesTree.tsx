// CircumstancesTree.tsx
import React, { useState, useEffect } from "react";

// FAKOWY JSON NA START
const MOCK_DATA = [
  {
    name: "warunek 1",
    id: "w1",
    children: [
      { name: "warunek 1a", id: "w1a" },
      { name: "warunek 1b", id: "w1b" },
    ]
  },
  {
    name: "warunek 2",
    id: "w2"
  }
];

export default function CircumstancesTree({ onDone, onBack }: { onDone: (selected: any[]) => void, onBack: () => void }) {
  const [path, setPath] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);

  // tu zamiast MOCK_DATA fetchujesz dane
  const nodes = path.length === 0
    ? MOCK_DATA
    : (path[path.length - 1].children || []);

  function handleSelect(node: any) {
    setPath([...path, node]);
  }
  function handleBack() {
    setPath(path.slice(0, -1));
  }
  function handleConfirm() {
    setSelected([...selected, path[path.length - 1]]);
    onDone([...selected, path[path.length - 1]]);
  }
  function handleReset() {
    setPath([]);
    setSelected([]);
    onBack();
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap gap-2">
        {path.map((node, idx) => (
          <span key={node.id} className="rounded-2xl bg-[#23274a] px-3 py-1 text-sm font-medium text-white">
            {node.name}
            {idx < path.length - 1 && <span className="mx-1 text-[#C9C9C9]">→</span>}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {nodes.map(node => (
          <button
            key={node.id}
            className="bg-[#234178] hover:bg-[#2e529b] text-white rounded px-3 py-2 font-semibold text-sm"
            onClick={() => handleSelect(node)}
          >
            {node.name}
          </button>
        ))}
      </div>
      <div className="flex flex-row gap-2 mt-3">
        {path.length > 0 && (
          <>
            <button
              className="flex-1 bg-[#348CFD] text-white py-2 rounded"
              onClick={handleConfirm}
            >
              Zatwierdź ten wybór
            </button>
            <button
              className="flex-1 bg-[#23274a] text-[#C9C9C9] py-2 rounded"
              onClick={handleBack}
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
