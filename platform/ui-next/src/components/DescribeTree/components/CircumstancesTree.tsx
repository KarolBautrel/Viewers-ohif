import React, { useState } from "react";

const MOCK_DATA = [
  {
    name: "warunek 1",
    id: "w1",
    uuid:"xyzas",
    children: [
      { name: "warunek 1a", id: "w1a", uuid:"xyzas" },
      { name: "warunek 1b", id: "w1b", uuid:"xyzas"  },
    ]
  },
  {
    name: "warunek 2",
    id: "w2",
    uuid:"xyzas"
  }
];

export default function CircumstancesTree({ onDone, onBack }: { onDone: (selected: any[]) => void, onBack: () => void }) {
  const [path, setPath] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);

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
    <div className="flex flex-col w-full gap-4">
      {/* Breadcrumb / ścieżka wyboru */}
      <div className="flex flex-wrap items-center gap-2 min-h-[36px] mb-2">
        {path.length === 0 && (
          <span className="text-sm text-[#a8adc5]">Wybierz warunek badania</span>
        )}
        {path.map((node, idx) => (
          <React.Fragment key={node.id}>
            <span className="rounded-full bg-[#23274a] px-3 py-1 text-sm font-medium text-white shadow border border-[#2a3053]">
              {node.name}
            </span>
            {idx < path.length - 1 && (
              <span className="mx-1 text-[#5a6686] font-semibold">&rarr;</span>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Lista wyborów */}
      <div className="flex flex-col gap-2">
        {nodes.length === 0 && (
          <div className="text-[#b4bad3] italic px-2 py-1">Brak dalszych opcji</div>
        )}
        {nodes.map(node => (
          <button
            key={node.id}
            className="
              bg-gradient-to-r from-[#234178] to-[#28488f]
              hover:from-[#2e529b] hover:to-[#225BA4]
              text-white rounded-xl px-4 py-2 font-medium text-base
              transition
              shadow-sm border border-[#2a3053] outline-none
              focus:ring-2 focus:ring-[#225BA4] focus:z-10
            "
            onClick={() => handleSelect(node)}
          >
            {node.name}
          </button>
        ))}
      </div>
      {/* Przyciski akcji */}
      <div className="flex flex-row gap-2 mt-4">
        {path.length > 0 && (
          <>
            <button
              className="
                flex-1 rounded-xl bg-[#348CFD]
                hover:bg-[#225BA4]
                text-white font-semibold py-2 transition
                shadow
              "
              onClick={handleConfirm}
            >
              Zatwierdź wybór
            </button>
            <button
              className="
                flex-1 rounded-xl bg-[#23274a] text-[#C9C9C9] hover:bg-[#22264d]
                py-2 font-medium border border-[#2a3053] transition
              "
              onClick={handleBack}
            >
              Wstecz
            </button>
          </>
        )}
        <button
          className="
            flex-1 rounded-xl bg-[#1b1e33] text-[#C9C9C9] hover:bg-[#23274a]
            py-2 font-medium border border-[#23274a] transition
          "
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
