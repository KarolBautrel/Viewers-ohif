import { useCallback } from 'react';

export function useRisWindow() {
  const checkRisWindow = useCallback(refId => {
    const windowName = `ris-${refId}`;
    const url = `/ne/dashboard/referrals/${refId}/description/`;
    const windowFeatures = 'noopener,noreferrer,width=1200,height=800';

    let existingWindow = window.open('', windowName);
    if (existingWindow && !existingWindow.closed) {
      return existingWindow;
    }

    const newWindow = window.open(url, windowName, windowFeatures);
    if (newWindow) {
      newWindow.focus();
    } else {
      console.warn('[RIS] Nie udało się otworzyć okna (pop-up mógł zostać zablokowany).');
    }
    return newWindow;
  }, []);

  return checkRisWindow;
}
