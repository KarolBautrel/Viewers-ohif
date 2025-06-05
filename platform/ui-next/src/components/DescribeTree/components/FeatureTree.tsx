import React, { useState } from 'react';
import type { CechaNode, Suggestion } from '../types';
import { cleanChoice } from '../helpers';

const suggestionColor = {
  wnioski: 'bg-pink-800',
  rozpoznanie: 'bg-[#653828]',
  objaw: 'bg-indigo-800',
} as const;

function extractSuggestionsFlat(node: any | null): Suggestion[] {
  if (!node) return [];
  const list: Suggestion[] = [];
  (node.suggested_rozpoznanie ?? []).forEach((r: any) =>
    list.push({ name: r.name, type: 'rozpoznanie', weight: r.weight, uuid: r.uuid })
  );
  (node.sugeruje_wnioski ?? []).forEach((w: any) =>
    list.push({ name: w.name, type: 'wnioski', weight: w.weight, uuid: w.uuid })
  );
  (node.sugeruje_rozpoznanie ?? []).forEach((r: any) =>
    list.push({ name: r.name, type: 'rozpoznanie', weight: r.weight, uuid: r.uuid })
  );
  (node.sugeruje_objaw ?? []).forEach((o: any) =>
    list.push({ name: o.name, type: 'objaw', weight: o.weight, uuid: o.uuid })
  );
  (node.children_dane_z_pomiaru ?? []).forEach((d: any) => {
    (d.sugeruje_wnioski ?? []).forEach((w: any) =>
      list.push({ name: w.name, type: 'wnioski', weight: w.weight, uuid: w.uuid })
    );
    (d.sugeruje_rozpoznanie ?? []).forEach((r: any) =>
      list.push({ name: r.name, type: 'rozpoznanie', weight: r.weight, uuid: r.uuid })
    );
    (d.sugeruje_objaw ?? []).forEach((o: any) =>
      list.push({ name: o.name, type: 'objaw', weight: o.weight, uuid: o.uuid })
    );
  });
  // UWAGA: NIC ze skierowania!
  // (node.skierowanie && ...)
  const uniq = new Map<string, Suggestion>();
  const key = (s: Suggestion) => `${s.type}:${s.name}:${s.source ?? ''}`;
  list.forEach(s => {
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
      node = (node.children_cecha || []).find((c: any) => c.element_id_property === id) || node;
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
    const merged = [...selected, sug];
    const cleanedMerged = cleanChoice(merged);
    onDone(cleanedMerged);
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
    const cleanedSelection = cleanChoice(selected);
    onDone(cleanedSelection);
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <span className="text-lg font-semibold text-[#C9C9C9]">Wybierz cechę</span>
        {(path.length > 0 || selected.length > 0) && (
          <button
            className="ml-auto rounded bg-[#23274a] px-3 py-1 text-xs text-white"
            onClick={goBack}
          >
            Wróć
          </button>
        )}
      </div>
      {selected.length > 0 && (
        <div className="mb-1 flex flex-wrap gap-2">
          {selected.map((n, i) => (
            <span
              key={n.element_id_property || n.name}
              className="rounded-xl bg-[#23274a] px-3 py-1 text-xs font-medium text-white"
            >
              {n.name}
              {i !== selected.length - 1 && <span className="mx-1 text-gray-400">➝</span>}
            </span>
          ))}
        </div>
      )}
      {suggestions.length > 0 && (
        <>
          <div className="mb-1 text-xs text-[#C9C9C9]">Sugestie (po wadze)</div>
          <div className="flex flex-col gap-2">
            {suggestions.map((sug, idx) => (
              <button
                key={sug.type + '-' + sug.name + '-' + idx}
                className={`${suggestionColor[sug.type]} rounded px-3 py-2 text-left text-sm font-semibold text-white`}
                onClick={() => handleSelectSuggestion(sug)}
              >
                {sug.name}
                {sug.weight !== undefined && (
                  <span className="ml-2 text-xs font-normal opacity-80">
                    ({sug.type}
                    {sug.weight !== undefined ? `, ${sug.weight}` : ''})
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
      {currentLevel.length > 0 && (
        <>
          <div className="mb-1 text-xs text-[#C9C9C9]">Cechy</div>
          <div className="flex flex-col gap-2">
            {currentLevel.map((node: any) => (
              <button
                key={node.element_id_property}
                className="rounded bg-[#23274a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2d314f]"
                onClick={() => handleSelectCecha(node)}
              >
                {node.name}
              </button>
            ))}
          </div>
        </>
      )}
      {selected.length > 0 && (
        <button
          className="mt-4 w-full rounded bg-[#00BFD9] py-2 font-bold text-black hover:bg-[#14d6f8]"
          onClick={finishSelection}
        >
          Zakończ wybór
        </button>
      )}
      <button
        className="mt-3 w-full rounded bg-[#23274a] py-2 text-xs text-[#C9C9C9]"
        onClick={resetAll}
      >
        Reset
      </button>
    </div>
  );
}
