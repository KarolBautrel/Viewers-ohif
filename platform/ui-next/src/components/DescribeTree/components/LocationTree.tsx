import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LocationTree({ data, onDone, onBack, onFinish }) {
  const { t } = useTranslation('MeasurementDescribe');

  const [pathStack, setPathStack] = useState<any[]>([]);
  const [currentLevel, setCurrentLevel] = useState([
    { parentNode: data[0], childNodes: data[0].children_lokalizacja || [] },
  ]);
  const [tree, setTree] = useState<any[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);

  function toggleSelect(node: any, parent: any) {
    const exists = selectedNodes.find(
      n => n.node.uuid === node.uuid && n.parentUuid === parent.uuid
    );
    if (exists) {
      setSelectedNodes(prev =>
        prev.filter(n => !(n.node.uuid === node.uuid && n.parentUuid === parent.uuid))
      );
    } else {
      setSelectedNodes(prev => [...prev, { node, parentUuid: parent.uuid }]);
    }
  }

  function mergeChildIntoTree(baseTree, parentUuid, childNode, depth = 0) {
    return baseTree.map(node => {
      if (node.uuid === parentUuid) {
        const existingChild = (node.children_lokalizacja || []).find(
          c => c.uuid === childNode.uuid
        );
        if (existingChild) return node;
        return {
          ...node,
          children_lokalizacja: [
            ...(node.children_lokalizacja || []),
            { ...childNode, children_lokalizacja: [] },
          ],
        };
      }
      if (node.children_lokalizacja?.length > 0) {
        return {
          ...node,
          children_lokalizacja: mergeChildIntoTree(
            node.children_lokalizacja,
            parentUuid,
            childNode,
            depth + 1
          ),
        };
      }
      return node;
    });
  }

  function findNodeByUuid(tree, uuid) {
    for (const node of tree) {
      if (node.uuid === uuid) return node;
      if (node.children_lokalizacja?.length) {
        const res = findNodeByUuid(node.children_lokalizacja, uuid);
        if (res) return res;
      }
    }
    return null;
  }

  function handleNextLevel() {
    let updatedTree = [...tree];
    selectedNodes.forEach(({ node, parentUuid }) => {
      if (tree.find(t => t.name === node.uuid)) return;

      const existsInTree = findNodeByUuid(updatedTree, parentUuid);
      if (existsInTree) {
        updatedTree = mergeChildIntoTree(updatedTree, parentUuid, node);
      } else {
        updatedTree.push({ ...node, children_lokalizacja: [] });
      }
    });

    const nextLevel = selectedNodes
      .flatMap(entry => ({
        parentNode: entry.node,
        childNodes: entry.node.children_lokalizacja || [],
      }))
      .filter(entry => entry.childNodes.length > 0);

    setTree(updatedTree);
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
    setTree([]);
    setCurrentLevel([{ parentNode: data[0], childNodes: data[0].children_lokalizacja || [] }]);
  }

  function handleFinish() {
    let updatedTree = [...tree];
    selectedNodes.forEach(({ node, parentUuid }) => {
      if (findNodeByUuid(updatedTree, node.uuid)) return;
      const existsInTree = findNodeByUuid(updatedTree, parentUuid);
      if (existsInTree) {
        updatedTree = mergeChildIntoTree(updatedTree, parentUuid, node);
      } else {
        updatedTree.push({ ...node, children_lokalizacja: [] });
      }
    });
    onFinish(updatedTree);
  }

  const hasNextLevel = selectedNodes.some(
    entry => (entry.node.children_lokalizacja || []).length > 0
  );

  const selectedLabels = selectedNodes.map(n => n.node.name);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <span className="text-lg font-semibold text-[#C9C9C9]">{t('locationTree.title')}</span>
        <button
          className="ml-auto rounded bg-[#23274a] px-3 py-1 text-xs text-white hover:bg-[#2f335d]"
          onClick={handleBack}
        >
          {pathStack.length === 0 ? t('locationTree.exit') : t('locationTree.back')}
        </button>
      </div>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLabels.map(label => (
            <span
              key={label}
              className="rounded-2xl bg-blue-900 px-3 py-1 text-xs font-medium text-blue-100"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {currentLevel.map(({ parentNode, childNodes }) => (
        <div
          key={parentNode.uuid}
          className="mb-4"
        >
          <div className="mb-1 text-xs text-[#C9C9C9]">
            {t('locationTree.from', { parent: parentNode.name })}
          </div>
          <div className="flex flex-col gap-3">
            {childNodes.map(child => {
              const selected = selectedNodes.find(
                n => n.node.uuid === child.uuid && n.parentUuid === parentNode.uuid
              );
              return (
                <button
                  key={child.uuid + parentNode.name}
                  className={`rounded px-4 py-3 text-base font-semibold transition ${
                    selected
                      ? 'bg-[#348CFD] text-white hover:bg-[#225BA4]'
                      : 'bg-[#23274a] text-white hover:bg-[#2f335d]'
                  }`}
                  onClick={() => toggleSelect(child, parentNode)}
                >
                  {child.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedNodes.length > 0 && (
        <div className="flex flex-col gap-2">
          {hasNextLevel && (
            <button
              className="mt-4 w-full rounded bg-[#14d6f8] py-3 text-lg font-bold text-black hover:bg-[#0db8d7]"
              onClick={handleNextLevel}
            >
              {t('locationTree.next')}
            </button>
          )}
          <button
            className="mt-2 w-full rounded bg-[#1f3b82] py-3 text-lg text-white hover:bg-[#16285b]"
            onClick={handleFinish}
          >
            {t('locationTree.finish')}
          </button>
        </div>
      )}

      <button
        className="mt-3 w-full text-center text-xs text-[#C9C9C9] hover:underline"
        onClick={handleReset}
      >
        {t('locationTree.reset')}
      </button>
    </div>
  );
}
