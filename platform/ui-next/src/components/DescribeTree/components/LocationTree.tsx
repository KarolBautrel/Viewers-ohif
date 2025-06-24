import React, { useState } from 'react';

export default function LocationTree({
  data,
  onDone,
  onBack,
}: {
  data: any[];
  onDone: (selected: any) => void;
  onBack: () => void;
}) {
  const [pathStack, setPathStack] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState([
    { parentNode: data[0], childNodes: data[0].children_lokalizacja || [] },
  ]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);

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
        childNodes: entry.node.children_lokalizacja || [],
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
    setCurrentLevel([{ parentNode: data[0], childNodes: data[0].children_lokalizacja || [] }]);
  }

  function handleFinish() {
    const allSelected = pathStack
      .flatMap(step => step.selected.map(s => s.node))
      .concat(selectedNodes.map(s => s.node));
    onDone(allSelected);
  }

  const hasNextLevel = selectedNodes.some(
    entry => (entry.node.children_lokalizacja || []).length > 0
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <span className="text-lg font-semibold text-[#C9C9C9]">Wybierz lokalizacje</span>
        {pathStack.length > 0 && (
          <button
            className="ml-auto rounded bg-[#23274a] px-3 py-1 text-xs text-white"
            onClick={handleBack}
          >
            Wróć
          </button>
        )}
      </div>

      {currentLevel.map(({ parentNode, childNodes }) => (
        <div
          key={parentNode.element_id_property}
          className="mb-4"
        >
          <div className="mb-1 text-xs text-[#C9C9C9]">
            Lokalizacje pochodzące od: {parentNode.name}
          </div>
          <div className="flex flex-col gap-2">
            {childNodes.map(child => {
              const selected = selectedNodes.find(
                n =>
                  n.node.element_id_property === child.element_id_property &&
                  n.parentName === parentNode.name
              );
              return (
                <button
                  key={child.element_id_property + parentNode.name}
                  className={`rounded px-3 py-2 text-sm font-semibold ${selected ? 'bg-[#14d6f8] text-black' : 'bg-[#23274a] text-white'}`}
                  onClick={() => toggleSelect(child, parentNode)}
                >
                  {child.name} (od: {parentNode.name})
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedNodes.length > 0 && hasNextLevel && (
        <button
          className="mt-4 w-full rounded bg-[#348CFD] py-2 font-bold text-white hover:bg-[#225BA4]"
          onClick={handleNextLevel}
        >
          Dalej
        </button>
      )}

      {selectedNodes.length > 0 && !hasNextLevel && (
        <button
          className="mt-4 w-full rounded bg-green-700 py-2 text-white"
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
