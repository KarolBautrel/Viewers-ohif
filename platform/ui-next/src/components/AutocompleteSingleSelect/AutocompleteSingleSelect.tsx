import React, { useState, useRef, useEffect } from 'react';

function AutocompleteSingleSelect({ options, value, onChange, placeholder = 'Wpisz lub wybierz...' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const filtered = options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    if (value) setQuery(value);
    else setQuery('');
  }, [value]);

  function handleSelect(opt) {
    onChange(opt);
    setQuery(opt);
    setOpen(false);
    if (inputRef.current) inputRef.current.blur();
  }

  return (
    <div className="relative" ref={ref}>
      <div
        className={`flex h-10 w-full cursor-pointer items-center rounded border border-[#225BA4] bg-[#0B0F2B] px-3 ${open ? 'ring-2 ring-[#14d6f8]' : ''}`}
        onClick={() => { if (!open) setOpen(true); }}
      >
        <input
          ref={inputRef}
          className="w-full bg-transparent text-[16px] text-white outline-none"
          placeholder={placeholder}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            onChange('');
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded border border-[#225BA4] bg-[#0B0F2B] shadow-lg">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-[#828282]">Brak wyników</div>
          )}
          {filtered.map(opt => (
            <div
              key={opt}
              className={`flex cursor-pointer items-center px-3 py-2 text-white hover:bg-[#225BA4] ${
                value === opt ? 'bg-[rgba(134,142,150,0.15)]' : ''
              }`}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(opt);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AutocompleteSingleSelect;
