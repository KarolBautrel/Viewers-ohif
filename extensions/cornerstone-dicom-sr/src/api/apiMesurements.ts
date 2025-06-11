export async function sendMeasurementsToApi(measurementData) {
  try {
    const response = await fetch("GonnabeEndpoint", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ measurementData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Error while sending the measurements.');
  }
}
