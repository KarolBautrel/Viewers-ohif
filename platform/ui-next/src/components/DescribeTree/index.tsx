import React, { useState } from "react";

interface TreeNode {
  question: string;
  options: {
    label: string;
    next?: TreeNode;
  }[];
}

interface DescribeTreeProps {

  onSelect: (description: string) => void;
}


const DescribeTree: React.FC<DescribeTreeProps> = ({ onSelect }) => {
  const [currentNode, setCurrentNode] = useState<TreeNode | null>(describeData);
  const [path, setPath] = useState<string[]>([]);

  if (!currentNode) {
    return <div>No data available</div>;
  }

  const handleOptionClick = (optionLabel: string, nextNode?: TreeNode) => {
    const newPath = [...path, optionLabel];
    setPath(newPath);

    if (nextNode) {
      setCurrentNode(nextNode);
    } else {
      const finalSelection = newPath.join(" > ");

      onSelect(finalSelection);

      setPath([]);
      setCurrentNode(describeData);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{currentNode.question}</h3>

      <div className="space-y-2">
        {currentNode.options.map((option) => (
          <div
            key={option.label}
            className="cursor-pointer rounded-md p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => handleOptionClick(option.label, option.next)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DescribeTree;

/// JUST HARDCODED EXAMPLE DATA
const describeData = {
  question: "Which region would you like to describe?",
  options: [
    {
      label: "Chest",
      next: {
        question: "Which part of the chest?",
        options: [
          {
            label: "Lung Fields",
            next: {
              question: "Any specific finding in the lung fields?",
              options: [
                { label: "Consolidation" },
                { label: "Nodules" },
                { label: "No abnormality" },
              ],
            },
          },
          {
            label: "Heart Region",
            next: {
              question: "Any specific finding in the heart region?",
              options: [
                { label: "Enlargement" },
                { label: "Normal Size" },
              ],
            },
          },
        ],
      },
    },
    {
      label: "Head",
      next: {
        question: "Which part of the head?",
        options: [
          {
            label: "Brain Tissue",
            next: {
              question: "Any specific finding in the brain tissue?",
              options: [
                { label: "Lesion" },
                { label: "Hemorrhage" },
                { label: "No abnormality" },
              ],
            },
          },
          {
            label: "Skull",
            next: {
              question: "Any specific finding in the skull?",
              options: [
                { label: "Fracture" },
                { label: "Normal bone" },
              ],
            },
          },
        ],
      },
    },
  ],
};
