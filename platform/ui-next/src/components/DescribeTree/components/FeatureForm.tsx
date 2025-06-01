import React, { useState } from "react";

// MOCKI
const MOCK_LOCALIZACJE = [
  { value: "Płat górny", label: "Płat górny" },
  { value: "Płat środkowy", label: "Płat środkowy" },
];
const OBJAW_RADIOLOGICZNY = [
  { value: "Zmiana lita", label: "Zmiana lita" },
  { value: "Zmiana matowa", label: "Zmiana matowa" },
];
const DANE_ZE_SKIEROWANIA = [
  { value: "historia palenia", label: "Historia palenia" },
  { value: "duszność", label: "Duszność" },
];

export function FeatureForm({ onSubmit, onEdit }) {
  const [lokalizacja, setLokalizacja] = useState("");
  const [objaw, setObjaw] = useState("");
  const [referral, setReferral] = useState<string[]>([]);

  // Zmienna rozmiaru guza – symulowana
  const tumorSize = "21.7 mm";

  return (
    <div className="flex flex-col items-start px-4 pt-8 pb-6 gap-2 w-[342px] h-[983px] bg-[#090C2A] shadow-[0px_1px_2px_rgba(0,0,0,0.10),0px_1px_3px_rgba(0,0,0,0.05)] rounded-lg">
      <span className="text-[#C9C9C9] text-base font-semibold mb-3">
        Wybierz dane wyjściowe
      </span>

      <div className="flex items-center gap-2 w-full mb-4">
        <div className="text-xs text-white/60">Średnica guza</div>
        <span className="bg-[#212444] px-3 py-1 rounded-xl text-[#D1EBFD] text-sm">{tumorSize}</span>
        <button
          className="ml-auto text-xs text-[#348CFD] font-semibold hover:underline"
          onClick={onEdit}
        >
          Edytuj
        </button>
      </div>

      {/* <label className="text-[#C9C9C9] font-semibold text-sm mt-3 mb-1">
        Lokalizacja<span className="text-[#F03E3E] ml-1">*</span>
      </label>
      <select
        className="w-full h-10 px-4 py-2 bg-[#050615] border border-[#225BA4] rounded text-white"
        value={lokalizacja}
        onChange={(e) => setLokalizacja(e.target.value)}
      >
        <option value="">Pick</option>
        {MOCK_LOCALIZACJE.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select> */}

      <label className="text-[#C9C9C9] font-semibold text-sm mt-3 mb-1">
        Objaw radiologiczny<span className="text-[#F03E3E] ml-1">*</span>
      </label>
      <select
        className="w-full h-10 px-4 py-2 bg-[#050615] border border-[#225BA4] rounded text-white"
        value={objaw}
        onChange={(e) => setObjaw(e.target.value)}
      >
        <option value="">Pick</option>
        {OBJAW_RADIOLOGICZNY.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <label className="text-[#C9C9C9] font-semibold text-sm mt-3 mb-1">
        Dane ze skierowania
      </label>
      <select
        multiple
        className="w-full h-10 px-4 py-2 bg-[#050615] border border-[#225BA4] rounded text-white"
        value={referral}
        onChange={(e) =>
          setReferral(Array.from(e.target.selectedOptions, o => o.value))
        }
      >
        {DANE_ZE_SKIEROWANIA.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <button
        className="w-full mt-8 bg-[#00BFD9] hover:bg-[#5ACCE6] text-black font-semibold rounded py-2 text-base transition"
        disabled={!lokalizacja || !objaw}
        onClick={() => onSubmit({ lokalizacja, objaw, referral, tumorSize })}
      >
        Wybierz
      </button>
    </div>
  );
}
