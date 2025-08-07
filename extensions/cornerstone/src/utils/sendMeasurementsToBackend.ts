import { API_URL } from '../constants';

export function getCSRFTokenFromCookie(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

export async function sendMeasurements({
  referralId,
  descriptionId,
  measurements,
}: {
  referralId: number | string;
  descriptionId: number | string;
  measurements: any[];
}) {
  if (!Array.isArray(measurements) || measurements.length === 0) return;

  const allDiagnoses = Array.from(
    new Set(measurements.flatMap(m => m?.description?.rozpoznania || []))
  );

  try {
    await fetch(
      `${API_URL}/api/referrals/${referralId}/descriptions/${descriptionId}/measurements/`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFTokenFromCookie(),
        },
        body: JSON.stringify({
          measurements,
          machine_description: allDiagnoses.join(', '),
          force: true,
        }),
      }
    );
  } catch (err) {
    console.error('Failed to save measurements:', err);
  }
}
