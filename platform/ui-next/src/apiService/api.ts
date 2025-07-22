import { API_URL } from '../consts';

export async function fetchCircumstancesTree() {
  // To jest proteza tymczasowa
  return [
    {
      name: 'Pozycja pacjenta',
      id: 'a1',
      children: [
        { name: 'Leżąca', id: 'a1.1', children: [] },
        { name: 'Stojąca', id: 'a1.2', children: [] },
      ],
    },
    {
      name: 'Czynność oddechowa',
      id: 'b1',
      children: [
        { name: 'Wdech', id: 'b1.1', children: [] },
        { name: 'Wydech', id: 'b1.2', children: [] },
      ],
    },
    {
      name: 'Kontrast',
      id: 'c1',
      children: [
        { name: 'Tak', id: 'c1.1', children: [] },
        { name: 'Nie', id: 'c1.2', children: [] },
      ],
    },
  ];
}

export async function fetchReferralOptions(): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/neo/referrals`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const names = [...new Set(data.map((item: any) => item.name))]
    .filter(Boolean)
    .map((name: string) =>
      name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    );

  return names;
}

export async function fetchLocalizationTree(): Promise<any[]> {
  const res = await fetch(`${API_URL}/api/neo/localizations/all`);
  const data = await res.json();

  if (!res.ok || !Array.isArray(data) || data.length === 0) {
    throw new Error('Brak lokalizacji lub niepoprawna odpowiedź.');
  }

  return data;
}

export async function fetchFeatureTree({
  findingName,
  size,
  unitDimension,
  referralData,
}: {
  findingName: string;
  size: string;
  unitDimension: string;
  referralData: string[];
}): Promise<any[]> {
  const params = new URLSearchParams({
    finding_name: findingName,
    size,
    unit_dimension: unitDimension ?? '',
  });

  const res = await fetch(`${API_URL}/api/neo/symptoms/by-name/chars/?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referral_data: referralData }),
  });

  const data = await res.json();

  if (!res.ok || !Array.isArray(data) || data.length === 0) {
    throw new Error('Brak danych cech lub niepoprawna odpowiedź.');
  }

  return data;
}

export async function fetchSymptoms() {
  const res = await fetch(`${API_URL}/api/neo/symptoms`);

  const data = await res.json();

  if (!res.ok || !Array.isArray(data) || data.length === 0) {
    throw new Error('Wystapil blad przy pobieraniu objawow radiologicznych.');
  }

  return data;
}
