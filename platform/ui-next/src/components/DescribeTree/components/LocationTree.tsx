import React, { useState } from "react";

export default function LocationTree({
  data,
  onDone,
  onBack,
}: {
  data: any[];
  onDone: (selected: any[]) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<any[]>([]);
  function handleSelect(node: any) {
    setSelected([node]);
    onDone([node]);
  }
  function resetAll() {
    setSelected([]);
    onBack();
  }
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row items-center gap-2">
        <span className="font-semibold text-[#C9C9C9] text-lg">Wybierz lokalizację</span>
      </div>
      <div className="flex flex-col gap-2">
        {data.map(node => (
          <button
            key={node.element_id_property}
            className="bg-[#23274a] hover:bg-[#2d314f] text-white rounded px-3 py-2 font-semibold text-sm"
            onClick={() => handleSelect(node)}
          >{node.name}</button>
        ))}
      </div>
      <button className="mt-3 w-full text-xs bg-[#23274a] text-[#C9C9C9] py-2 rounded"
        onClick={resetAll}>
        Reset
      </button>
    </div>
  );
}
