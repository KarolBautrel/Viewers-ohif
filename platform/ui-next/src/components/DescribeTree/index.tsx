import React, { useState } from "react";

interface TreeNode {
  question: string;
  options: {
    label: string;
    next?: TreeNode;
  }[];
}

interface DescribeTreeProps {
  /**
   * Called with the final "description" or path.
   */
  onSelect: (description: string) => void;
}

/**
 * This is our step-by-step wizard, letting users drill down
 * through multiple levels of chest/head imaging options.
 */
const DescribeTree: React.FC<DescribeTreeProps> = ({ onSelect }) => {
  // The root of our wizard steps
  const [currentNode, setCurrentNode] = useState<TreeNode | null>(describeData);
  // Keep track of all selected labels
  const [path, setPath] = useState<string[]>([]);

  if (!currentNode) {
    return <div>No data available</div>;
  }

  const handleOptionClick = (optionLabel: string, nextNode?: TreeNode) => {
    // Add the label to our path
    const newPath = [...path, optionLabel];
    setPath(newPath);

    if (nextNode) {
      // Move on to the next "step" in the wizard
      setCurrentNode(nextNode);
    } else {
      // Final selection: no further steps
      const finalSelection = newPath.join(" > ");
      console.log("Final selection path:", finalSelection);

      // You can pass the final path back to parent
      // or do anything you like with it:
      onSelect(finalSelection);

      // Optionally reset for next usage:
      setPath([]);
      setCurrentNode(describeData);
    }
  };

  return (
    <div className="space-y-4">
      {/* Wizard Question */}
      <h3 className="text-lg font-semibold">{currentNode.question}</h3>

      {/* List the options for this step */}
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

// The top-level data used:
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
