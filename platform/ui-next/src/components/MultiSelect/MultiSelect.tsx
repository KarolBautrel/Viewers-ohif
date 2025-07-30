import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (newValues: string[]) => void;
}

function MultiSelect({ options, value, onChange }: MultiSelectProps) {
  const { t } = useTranslation('MeasurementDescribe');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter(opt => opt.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function toggleValue(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  }

  return (
    <div
      className="relative"
      ref={ref}
    >
      <div
        className={`flex h-auto min-h-[40px] w-full cursor-pointer items-center rounded border border-[#225BA4] bg-[#0B0F2B] px-3 ${
          open ? 'ring-2 ring-[#14d6f8]' : ''
        }`}
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex w-full min-w-0 flex-row flex-wrap gap-1">
          {value.length === 0 && (
            <span className="font-roboto whitespace-nowrap text-[16px] text-[#828282]">
              {t('multiSelect.placeholder')}
            </span>
          )}
          {value.map(val => (
            <span
              key={val}
              className="mr-1 flex items-center rounded bg-[rgba(134,142,150,0.15)] px-2 py-0.5 text-[15px] text-white"
              onClick={e => {
                e.stopPropagation();
                toggleValue(val);
              }}
            >
              {val}
              <span className="ml-1 cursor-pointer text-[#14d6f8]">&times;</span>
            </span>
          ))}
        </div>
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded border border-[#225BA4] bg-[#0B0F2B] shadow-lg">
          <input
            autoFocus
            className="font-roboto w-full border-b border-[#225BA4] bg-transparent px-3 py-2 text-[16px] text-white outline-none"
            placeholder={t('multiSelect.filterPlaceholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
          />
          <div>
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-[#828282]">{t('multiSelect.noResults')}</div>
            )}
            {filtered.map(opt => (
              <div
                key={opt}
                className={`flex cursor-pointer items-center px-3 py-2 text-white hover:bg-[#225BA4] ${
                  value.includes(opt) ? 'bg-[rgba(134,142,150,0.15)]' : ''
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
