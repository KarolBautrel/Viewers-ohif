import React, { useState } from 'react';

export default function FeatureTree({ data, onDone, onBack, gatingUuids }) {
  const [pathStack, setPathStack] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState([
    { parentNode: data[0], childNodes: data[0].children_cecha || [] },
  ]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);

  function isUuidInGating(element) {
    if (!element?.gating_uuid) return true;
    return gatingUuids.includes(element.gating_uuid);
  }

  function toggleSelect(node: any, parent: any) {
    const exists = selectedNodes.find(
      n => n.node.element_id_property === node.element_id_property && n.parentName === parent.name
    );
    if (exists) {
      setSelectedNodes(prev =>
        prev.filter(
          n =>
            !(
              n.node.element_id_property === node.element_id_property &&
              n.parentName === parent.name
            )
        )
      );
    } else {
      setSelectedNodes(prev => [...prev, { node, parentName: parent.name }]);
    }
  }

  function handleNextLevel() {
    const nextLevel = selectedNodes
      .flatMap(entry => ({
        parentNode: entry.node,
        childNodes: (entry.node.children_cecha || []).filter(child => isUuidInGating(child)),
      }))
      .filter(entry => entry.childNodes.length > 0);

    setPathStack(prev => [...prev, { level: currentLevel, selected: selectedNodes }]);
    setCurrentLevel(nextLevel);
    setSelectedNodes([]);
  }

  function handleBack() {
    if (pathStack.length === 0) {
      onBack();
      return;
    }
    const last = pathStack[pathStack.length - 1];
    setCurrentLevel(last.level);
    setSelectedNodes(last.selected);
    setPathStack(prev => prev.slice(0, -1));
  }

  function handleReset() {
    setPathStack([]);
    setSelectedNodes([]);
    setCurrentLevel([{ parentNode: data[0], childNodes: data[0].children_cecha || [] }]);
  }

  function handleFinish() {
    const allSelected = pathStack
      .flatMap(step => step.selected.map(s => s.node))
      .concat(selectedNodes.map(s => s.node));
    const features = allSelected.map((node, index) => ({
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

    const { conclusions, diagnoses } = extractAllSuggestions(allSelected);

    onDone({ features, conclusions, diagnoses, finding });
  }

  function extractAllSuggestions(selectedNodes: any[]) {
    const conclusionMap = new Map();
    const diagnosisMap = new Map();

    selectedNodes.forEach(node => {
      extractNodeSuggestions(node, conclusionMap, diagnosisMap);
    });

    const conclusions = Array.from(conclusionMap.values())
      .filter(c => isUuidInGating(c))
      .sort((a, b) => b.weight - a.weight);

    const diagnoses = Array.from(diagnosisMap.values())
      .filter(d => isUuidInGating(d))
      .sort((a, b) => b.weight - a.weight);

    return { conclusions, diagnoses };
  }

  function extractNodeSuggestions(
    node: any,
    conclusionMap: Map<string, any>,
    diagnosisMap: Map<string, any>
  ) {
    (node.sugeruje_wnioski ?? []).forEach(w => {
      if (!isUuidInGating(w)) return;

      const key = w.name;
      if (conclusionMap.has(key)) {
        const existing = conclusionMap.get(key);
        conclusionMap.set(key, { ...w, weight: existing.weight + 1 });
      } else {
        conclusionMap.set(key, { ...w, weight: w.weight ?? 1 });
      }
    });

    (node.sugeruje_rozpoznanie ?? []).forEach(r => {
      if (!isUuidInGating(r)) return;

      const key = r.name;
      if (diagnosisMap.has(key)) {
        const existing = diagnosisMap.get(key);
        diagnosisMap.set(key, { ...r, weight: existing.weight + 1 });
      } else {
        diagnosisMap.set(key, { ...r, weight: r.weight ?? 1 });
      }
    });

    (node.suggested_rozpoznanie ?? []).forEach(r => {
      if (!isUuidInGating(r)) return;

      const key = r.name;
      if (diagnosisMap.has(key)) {
        const existing = diagnosisMap.get(key);
        diagnosisMap.set(key, { ...r, weight: existing.weight + 1 });
      } else {
        diagnosisMap.set(key, { ...r, weight: r.weight ?? 1 });
      }
    });

    (node.children_dane_z_pomiaru ?? []).forEach(d => {
      (d.sugeruje_wnioski ?? []).forEach(w => {
        if (!isUuidInGating(w)) return;

        const key = w.name;
        if (conclusionMap.has(key)) {
          const existing = conclusionMap.get(key);
          conclusionMap.set(key, { ...w, weight: existing.weight + 1 });
        } else {
          conclusionMap.set(key, { ...w, weight: w.weight ?? 1 });
        }
      });

      (d.sugeruje_rozpoznanie ?? []).forEach(r => {
        if (!isUuidInGating(r)) return;

        const key = r.name;
        if (diagnosisMap.has(key)) {
          const existing = diagnosisMap.get(key);
          diagnosisMap.set(key, { ...r, weight: existing.weight + 1 });
        } else {
          diagnosisMap.set(key, { ...r, weight: r.weight ?? 1 });
        }
      });
    });
  }

  const allConclusions = extractAllSuggestions(
    pathStack.flatMap(step => step.selected.map(s => s.node)).concat(selectedNodes.map(s => s.node))
  ).conclusions;

  const allDiagnoses = extractAllSuggestions(
    pathStack.flatMap(step => step.selected.map(s => s.node)).concat(selectedNodes.map(s => s.node))
  ).diagnoses;

  const hasNextLevel = selectedNodes.some(entry => {
    const availableChildren = (entry.node.children_cecha || []).filter(child =>
      isUuidInGating(child)
    );
    return availableChildren.length > 0;
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <span className="text-lg font-semibold text-[#C9C9C9]">Wybierz cechy</span>
        <button
          className="ml-auto rounded bg-[#23274a] px-3 py-1 text-xs text-white hover:bg-[#2f335d]"
          onClick={handleBack}
        >
          {pathStack.length === 0 ? 'Wyjdź' : 'Wróć'}
        </button>
      </div>

      {currentLevel.map(({ parentNode, childNodes }) => (
        <div
          key={parentNode.element_id_property}
          className="mb-4"
        >
          <div className="mb-1 text-xs text-[#C9C9C9]">Cechy pochodzące od: {parentNode.name}</div>
          <div className="flex flex-col gap-2">
            {childNodes
              .filter(child => isUuidInGating(child))
              .map(child => {
                const selected = selectedNodes.find(
                  n =>
                    n.node.element_id_property === child.element_id_property &&
                    n.parentName === parentNode.name
                );
                return (
                  <button
                    key={child.element_id_property + parentNode.name}
                    className={`rounded px-3 py-2 text-sm font-semibold ${
                      selected ? 'bg-[#14d6f8] text-black' : 'bg-[#23274a] text-white'
                    }`}
                    onClick={() => toggleSelect(child, parentNode)}
                  >
                    {child.name} (od: {parentNode.name})
                  </button>
                );
              })}
          </div>
        </div>
      ))}

      {allConclusions.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-semibold text-pink-300">Wnioski</div>
          <div className="flex flex-col gap-1">
            {allConclusions.map(c => (
              <div
                key={c.name}
                className="flex items-center rounded bg-pink-900/50 px-3 py-1 text-xs font-medium text-pink-100"
              >
                <span>{c.name}</span>
                <span className="ml-2 text-pink-300 opacity-70">(waga: {c.weight})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allDiagnoses.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-semibold text-[#eeb980]">Rozpoznania różnicowe</div>
          <div className="flex flex-col gap-1">
            {allDiagnoses.map(d => (
              <div
                key={d.name}
                className="flex items-center rounded bg-[#653828]/80 px-3 py-1 text-xs font-medium text-[#eeb980]"
              >
                <span>{d.name}</span>
                <span className="ml-2 opacity-80">(waga: {d.weight})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedNodes.length > 0 && (
        <div className="flex flex-col gap-2">
          {hasNextLevel && (
            <button
              className="mt-4 w-full rounded bg-[#348CFD] py-2 font-bold text-white hover:bg-[#225BA4]"
              onClick={handleNextLevel}
            >
              Dalej
            </button>
          )}

          <button
            className="mt-2 w-full rounded bg-green-700 py-2 text-white"
            onClick={handleFinish}
          >
            Zakończ wybór
          </button>
        </div>
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
