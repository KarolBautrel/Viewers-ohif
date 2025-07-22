import React from 'react';

export default function FormStep({
  symptomOptions,
  findingName,
  setFindingName,
  loading,
  error,
  onBack,
  onFetchFeatures,
}) {
  return (
    <form
      onSubmit={e => e.preventDefault()}
      className="flex flex-col gap-4"
    >
      <label className="flex w-full flex-col gap-1">
        <span className="mb-0.5 flex flex-row items-center text-[14px] font-semibold text-[#C9C9C9]">
          Wybierz objaw<span className="ml-1 text-[#F03E3E]">*</span>
        </span>
        <select
          className="h-10 w-full rounded border border-[#225BA4] bg-[#0B0F2B] px-3 text-[16px] text-white outline-none"
          value={findingName}
          onChange={e => setFindingName(e.target.value)}
          required
        >
          <option value="">Wybierz objaw</option>
          {symptomOptions.map(name => (
            <option
              key={name}
              value={name}
            >
              {name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded bg-[#23274a] py-2 text-white"
        >
          Wyjdź
        </button>
        <button
          type="button"
          onClick={onFetchFeatures}
          disabled={!findingName || loading}
          className="flex-1 rounded bg-[#348CFD] py-2 text-white"
        >
          {loading ? 'Ładowanie...' : 'Pobierz cechy'}
        </button>
      </div>
      {error && <div className="rounded bg-red-800 p-2 text-sm text-white">{error}</div>}
    </form>
  );
}
