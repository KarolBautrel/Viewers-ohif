import { API_URL } from '../constants/';

export async function fetchMeasurement(descriptionId: string, studyId: string) {
  const res = await fetch(
    `${API_URL}/api/study/${studyId}/descriptions/${descriptionId}/measurements/`
  );
  const data = await res.json();
  if (!res.ok || !Array.isArray(data) || data.length === 0) {
    throw new Error('COS NIE');
  }

  return data;
}
