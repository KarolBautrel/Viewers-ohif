import React, { useState } from "react";
import type { CechaNode, Suggestion } from "../types";

const suggestionColor = {
  wnioski: "bg-pink-800",
  rozpoznanie: "bg-[#653828]",
  objaw: "bg-indigo-800",
} as const;

function extractSuggestionsFlat(node: any | null): Suggestion[] {
  if (!node) return [];
  const list: Suggestion[] = [];
  (node.suggested_rozpoznanie ?? []).forEach((r: any) =>
    list.push({ name: r.name, category: "rozpoznanie", weight: r.weight }),
  );
  (node.sugeruje_wnioski ?? []).forEach((w: any) =>
    list.push({ name: w.name, category: "wnioski", weight: w.weight }),
  );
  (node.sugeruje_rozpoznanie ?? []).forEach((r: any) =>
    list.push({ name: r.name, category: "rozpoznanie", weight: r.weight }),
  );
  (node.sugeruje_objaw ?? []).forEach((o: any) =>
    list.push({ name: o.name, category: "objaw", weight: o.weight }),
  );
  (node.children_dane_z_pomiaru ?? []).forEach((d: any) => {
    (d.sugeruje_wnioski ?? []).forEach((w: any) =>
      list.push({ name: w.name, category: "wnioski", weight: w.weight }),
    );
    (d.sugeruje_rozpoznanie ?? []).forEach((r: any) =>
      list.push({ name: r.name, category: "rozpoznanie", weight: r.weight }),
    );
    (d.sugeruje_objaw ?? []).forEach((o: any) =>
      list.push({ name: o.name, category: "objaw", weight: o.weight }),
    );
  });
  // UWAGA: NIC ze skierowania!
  // (node.skierowanie && ...)
  const uniq = new Map<string, Suggestion>();
  const key = (s: Suggestion) => `${s.category}:${s.name}:${s.source ?? ''}`;
  list.forEach((s) => {
    const k = key(s);
    const existing = uniq.get(k);
    if (!existing || (s.weight ?? 0) > (existing?.weight ?? 0)) {
      uniq.set(k, s);
    }
  });
  return Array.from(uniq.values()).sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
}

export default function FeatureTree({
  data,
  onDone,
  onBack,
}: {
  data: any[];
  onDone: (selected: any[]) => void;
  onBack: () => void;
}) {
  const [path, setPath] = useState<string[]>([]);
  const [selected, setSelected] = useState<any[]>([]);

  // Helper do wyszukania node po ścieżce
  function getCurrentNode() {
    if (!data) return null;
    if (path.length === 0) return data[0];
    let node = data[0];
    for (const id of path) {
      node =
        (node.children_cecha || []).find((c: any) => c.element_id_property === id) || node;
    }
    return node;
  }
  const currentNode = getCurrentNode();
  const currentLevel = currentNode?.children_cecha || [];
  const suggestions = extractSuggestionsFlat(currentNode);

  function handleSelectCecha(node: any) {
    setSelected(prev => [...prev, node]);
    setPath(prev => [...prev, node.element_id_property]);
  }
  function handleSelectSuggestion(sug: any) {
    setSelected(prev => [...prev, sug]);
    onDone([...selected, sug]);
  }
  function goBack() {
    setPath(prev => prev.slice(0, -1));
    setSelected(prev => prev.slice(0, -1));
  }
  function resetAll() {
    setPath([]);
    setSelected([]);
    onBack();
  }
  function finishSelection() {
    onDone(selected);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row items-center gap-2">
        <span className="font-semibold text-[#C9C9C9] text-lg">Wybierz cechę</span>
        {(path.length > 0 || selected.length > 0) && (
          <button className="ml-auto text-xs bg-[#23274a] text-white px-3 py-1 rounded"
            onClick={goBack}>Wróć</button>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {selected.map((n, i) => (
            <span key={n.element_id_property || n.name}
              className="bg-[#23274a] text-white rounded-xl px-3 py-1 text-xs font-medium">
              {n.name}
              {i !== selected.length - 1 && (
                <span className="mx-1 text-gray-400">➝</span>
              )}
            </span>
          ))}
        </div>
      )}
      {suggestions.length > 0 && (
        <>
          <div className="text-[#C9C9C9] text-xs mb-1">Sugestie (po wadze)</div>
          <div className="flex flex-col gap-2">
            {suggestions.map((sug, idx) => (
              <button
                key={sug.category + "-" + sug.name + "-" + idx}
                className={`${suggestionColor[sug.category]} text-white font-semibold rounded px-3 py-2 text-left text-sm`}
                onClick={() => handleSelectSuggestion(sug)}
              >
                {sug.name}
                {sug.weight !== undefined && (
                  <span className="text-xs font-normal ml-2 opacity-80">
                    ({sug.category}{sug.weight !== undefined ? `, ${sug.weight}` : ""})
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
      {currentLevel.length > 0 && (
        <>
          <div className="text-[#C9C9C9] text-xs mb-1">Cechy</div>
          <div className="flex flex-col gap-2">
            {currentLevel.map((node: any) => (
              <button
                key={node.element_id_property}
                className="bg-[#23274a] hover:bg-[#2d314f] text-white rounded px-3 py-2 font-semibold text-sm"
                onClick={() => handleSelectCecha(node)}
              >{node.name}</button>
            ))}
          </div>
        </>
      )}
      {selected.length > 0 && (
        <button className="mt-4 w-full bg-[#00BFD9] hover:bg-[#14d6f8] text-black font-bold py-2 rounded"
          onClick={finishSelection}>
          Zakończ wybór
        </button>
      )}
      <button className="mt-3 w-full text-xs bg-[#23274a] text-[#C9C9C9] py-2 rounded"
        onClick={resetAll}>
        Reset
      </button>
    </div>
  );
}
