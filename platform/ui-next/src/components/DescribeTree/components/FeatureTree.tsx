import React, { useState } from 'react';

export default function FeatureTree({ data, onDone, onBack }) {
  const [path, setPath] = useState<string[]>([]);
  const [selected, setSelected] = useState<any[]>([]);

  function getCurrentNode() {
    if (!data) return null;
    if (path.length === 0) return data[0];
    let node = data[0];
    for (const id of path) {
      node = (node.children_cecha || []).find((c: any) => c.element_id_property === id) || node;
    }
    return node;
  }

  function extractFinalSuggestions(node) {
    const wnioski: any[] = [];
    const rozpoznania: any[] = [];
    if (!node) return { wnioski, rozpoznania };

    (node.sugeruje_wnioski ?? []).forEach(w =>
      wnioski.push({
        name: w.name,
        uuid: w.uuid || w.element_id_property || w.id,
        type: 'wnioski',
        weight: w.weight ?? 1,
      })
    );
    (node.sugeruje_rozpoznanie ?? []).forEach(r =>
      rozpoznania.push({
        name: r.name,
        uuid: r.uuid || r.element_id_property || r.id,
        type: 'rozpoznanie',
        weight: r.weight ?? 1,
      })
    );
    (node.suggested_rozpoznanie ?? []).forEach(r =>
      rozpoznania.push({
        name: r.name,
        uuid: r.uuid || r.element_id_property || r.id,
        type: 'rozpoznanie',
        weight: r.weight ?? 1,
      })
    );
    (node.children_dane_z_pomiaru ?? []).forEach(d => {
      (d.sugeruje_wnioski ?? []).forEach(w =>
        wnioski.push({
          name: w.name,
          uuid: w.uuid || w.element_id_property || w.id,
          type: 'wnioski',
          weight: w.weight ?? 1,
        })
      );
      (d.sugeruje_rozpoznanie ?? []).forEach(r =>
        rozpoznania.push({
          name: r.name,
          uuid: r.uuid || r.element_id_property || r.id,
          type: 'rozpoznanie',
          weight: r.weight ?? 1,
        })
      );
    });

    // Sortuj malejąco po wadze
    wnioski.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    rozpoznania.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    return { wnioski, rozpoznania };
  }

  const currentNode = getCurrentNode();
  const currentLevel = currentNode?.children_cecha || [];

  function handleSelectCecha(node: any) {
    setSelected(prev => [...prev, node]);
    setPath(prev => [...prev, node.element_id_property]);
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
    const cechy = selected.map((node, idx) => ({
      name: node.name,
      uuid: node.uuid || node.element_id_property || node.id,
      type: node.type || 'cecha',
      step: idx + 1,
    }));
    const objawRoot = data?.[0];
    const objaw = objawRoot
      ? {
          name: objawRoot.name,
          uuid: objawRoot.uuid || objawRoot.element_id_property || objawRoot.id,
          type: objawRoot.type || 'objaw',
        }
      : null;

    const { wnioski, rozpoznania } = extractFinalSuggestions(currentNode);

    onDone({
      cechy,
      wnioski,
      rozpoznania,
      objaw,
    });
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
        <>
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
          <div className="my-3 flex w-full flex-col gap-2">
            {extractFinalSuggestions(currentNode).wnioski.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-semibold text-pink-300">Wnioski</div>
                <div className="flex flex-col gap-1">
                  {extractFinalSuggestions(currentNode).wnioski.map(w => (
                    <div
                      key={w.id}
                      className="flex items-center rounded bg-pink-900/50 px-3 py-1 text-xs font-medium text-pink-100"
                    >
                      <span>{w.name}</span>
                      <span className="ml-2 text-pink-300 opacity-70">
                        {w.weight && `(waga: ${w.weight})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {extractFinalSuggestions(currentNode).rozpoznania.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-semibold text-[#eeb980]">
                  Rozpoznania różnicowe
                </div>
                <div className="flex flex-col gap-1">
                  {extractFinalSuggestions(currentNode).rozpoznania.map(r => (
                    <div
                      key={r.id}
                      className="flex items-center rounded bg-[#653828]/80 px-3 py-1 text-xs font-medium text-[#eeb980]"
                    >
                      <span>{r.name}</span>
                      <span className="ml-2 opacity-80">{r.weight && `(waga: ${r.weight})`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
