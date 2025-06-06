import React, { useState, useRef, useEffect } from "react";

function MultiSelect({ options, value, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function toggleValue(opt) {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className={`
          w-full min-h-[40px] h-auto flex items-center px-3 bg-[#0B0F2B]
          border border-[#225BA4] rounded cursor-pointer
          ${open ? "ring-2 ring-[#14d6f8]" : ""}
          overflow-x-auto
        `}
        style={{maxHeight: 44}}
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex flex-row flex-wrap gap-1 w-full min-w-0">
          {value.length === 0 && (
            <span className="text-[#828282] text-[16px] font-roboto whitespace-nowrap">
              Wpisz lub wybierz...
            </span>
          )}
          {value.map(val => (
            <span
              key={val}
              className="flex items-center bg-[rgba(134,142,150,0.15)] rounded px-2 py-0.5 text-white text-[15px] mr-1 whitespace-nowrap"
              style={{maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis"}}
              onClick={e => {
                e.stopPropagation();
                toggleValue(val);
              }}
            >
              {val}
              <span className="ml-1 text-[#14d6f8] cursor-pointer">&times;</span>
            </span>
          ))}
        </div>
      </div>
      {open && (
        <div className="absolute z-20 w-full mt-1 max-h-48 overflow-auto bg-[#0B0F2B] border border-[#225BA4] rounded shadow-lg">
          <input
            autoFocus
            className="w-full px-3 py-2 bg-transparent text-white font-roboto text-[16px] outline-none border-b border-[#225BA4]"
            placeholder="Wpisz, by filtrować..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
          />
          <div>
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-[#828282]">Brak wyników</div>
            )}
            {filtered.map(opt => (
              <div
                key={opt}
                className={`px-3 py-2 cursor-pointer text-white hover:bg-[#225BA4] flex items-center ${
                  value.includes(opt) ? "bg-[rgba(134,142,150,0.15)]" : ""
                }`}
                onClick={e => {
                  e.stopPropagation();
                  toggleValue(opt);
                }}
              >
                <input
                  type="checkbox"
                  className="mr-2 accent-[#14d6f8]"
                  checked={value.includes(opt)}
                  readOnly
                />
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default MultiSelect;
