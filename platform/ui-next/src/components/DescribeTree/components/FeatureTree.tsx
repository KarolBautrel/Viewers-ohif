import React, { useState } from 'react';

export default function FeatureTree({ data, onDone, onBack }) {
  const [path, setPath] = useState<string[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);

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
    const conclusions: any[] = [];
    const diagnoses: any[] = [];
    if (!node) return { conclusions, diagnoses };

    (node.sugeruje_wnioski ?? []).forEach(w =>
      conclusions.push({
        name: w.name,
        uuid: w.uuid || w.element_id_property || w.id,
        type: 'wnioski',
        weight: w.weight ?? 1,
      })
    );
    (node.sugeruje_rozpoznanie ?? []).forEach(r =>
      diagnoses.push({
        name: r.name,
        uuid: r.uuid || r.element_id_property || r.id,
        type: 'rozpoznanie',
        weight: r.weight ?? 1,
      })
    );
    (node.suggested_rozpoznanie ?? []).forEach(r =>
      diagnoses.push({
        name: r.name,
        uuid: r.uuid || r.element_id_property || r.id,
        type: 'rozpoznanie',
        weight: r.weight ?? 1,
      })
    );
    (node.children_dane_z_pomiaru ?? []).forEach(d => {
      (d.sugeruje_wnioski ?? []).forEach(w =>
        conclusions.push({
          name: w.name,
          uuid: w.uuid || w.element_id_property || w.id,
          type: 'wnioski',
          weight: w.weight ?? 1,
        })
      );
      (d.sugeruje_rozpoznanie ?? []).forEach(r =>
        diagnoses.push({
          name: r.name,
          uuid: r.uuid || r.element_id_property || r.id,
          type: 'rozpoznanie',
          weight: r.weight ?? 1,
        })
      );
    });

    conclusions.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    diagnoses.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    return { conclusions, diagnoses };
  }

  const currentNode = getCurrentNode();
  const currentChildren = currentNode?.children_cecha || [];

  function handleSelectFeature(node: any) {
    setSelectedNodes(prev => [...prev, node]);
    setPath(prev => [...prev, node.element_id_property]);
  }

  function handleBack() {
    setPath(prev => prev.slice(0, -1));
    setSelectedNodes(prev => prev.slice(0, -1));
  }

  function handleReset() {
    setPath([]);
    setSelectedNodes([]);
    onBack();
  }

  function handleFinish() {
    const features = selectedNodes.map((node, index) => ({
      name: node.name,
      uuid: node.uuid || node.element_id_property || node.id,
      type: node.type || 'feature',
      step: index + 1,
    }));

    const rootFinding = data?.[0];
    const finding = rootFinding
      ? {
          name: rootFinding.name,
          uuid: rootFinding.uuid || rootFinding.element_id_property || rootFinding.id,
          type: rootFinding.type || 'finding',
        }
      : null;

    const { conclusions, diagnoses } = extractFinalSuggestions(currentNode);

    onDone({
      features,
      conclusions,
      diagnoses,
      finding,
    });
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <span className="text-lg font-semibold text-[#C9C9C9]">Wybierz cechę</span>
        {(path.length > 0 || selectedNodes.length > 0) && (
          <button
            className="ml-auto rounded bg-[#23274a] px-3 py-1 text-xs text-white"
            onClick={handleBack}
          >
            Wróć
          </button>
        )}
      </div>

      {selectedNodes.length > 0 && (
        <>
          <div className="mb-1 flex flex-wrap gap-2">
            {selectedNodes.map((node, index) => (
              <span
                key={node.element_id_property || node.name}
                className="rounded-xl bg-[#23274a] px-3 py-1 text-xs font-medium text-white"
              >
                {node.name}
                {index !== selectedNodes.length - 1 && (
                  <span className="mx-1 text-gray-400">➝</span>
                )}
              </span>
            ))}
          </div>

          <div className="my-3 flex w-full flex-col gap-2">
            {extractFinalSuggestions(currentNode).conclusions.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-semibold text-pink-300">Wnioski</div>
                <div className="flex flex-col gap-1">
                  {extractFinalSuggestions(currentNode).conclusions.map(c => (
                    <div
                      key={c.id}
                      className="flex items-center rounded bg-pink-900/50 px-3 py-1 text-xs font-medium text-pink-100"
                    >
                      <span>{c.name}</span>
                      <span className="ml-2 text-pink-300 opacity-70">
                        {c.weight && `(waga: ${c.weight})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractFinalSuggestions(currentNode).diagnoses.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-semibold text-[#eeb980]">
                  Rozpoznania różnicowe
                </div>
                <div className="flex flex-col gap-1">
                  {extractFinalSuggestions(currentNode).diagnoses.map(d => (
                    <div
                      key={d.id}
                      className="flex items-center rounded bg-[#653828]/80 px-3 py-1 text-xs font-medium text-[#eeb980]"
                    >
                      <span>{d.name}</span>
                      <span className="ml-2 opacity-80">{d.weight && `(waga: ${d.weight})`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {currentChildren.length > 0 && (
        <>
          <div className="mb-1 text-xs text-[#C9C9C9]">Cechy</div>
          <div className="flex flex-col gap-2">
            {currentChildren.map((node: any) => (
              <button
                key={node.element_id_property}
                className="rounded bg-[#23274a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2d314f]"
                onClick={() => handleSelectFeature(node)}
              >
                {node.name}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedNodes.length > 0 && (
        <button
          className="mt-4 w-full rounded bg-[#00BFD9] py-2 font-bold text-black hover:bg-[#14d6f8]"
          onClick={handleFinish}
        >
          Zakończ wybór
        </button>
      )}

      <button
        className="mt-3 w-full rounded bg-[#23274a] py-2 text-xs text-[#C9C9C9]"
        onClick={handleReset}
      >
        Reset
      </button>
    </div>
  );
}
