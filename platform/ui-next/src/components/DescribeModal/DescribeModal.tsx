import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import MultiSelect from '../MultiSelect/MultiSelect';
import { fetchReferralOptions, fetchConditions } from '../../apiService/api';

interface DescribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDescribe: (payload: { skierowanie: string[]; warunki: any[] }) => void;
  forceModal?: boolean;
}

const DescribeModal: React.FC<DescribeModalProps> = ({
  isOpen,
  onClose,
  onDescribe,
  forceModal = false,
}) => {
  const [skierowanie, setSkierowanie] = useState<string[]>([]);
  const [referralOptions, setReferralOptions] = useState<string[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  const [conditionOptions, setConditionOptions] = useState<any[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<any[]>([]);
  const [loadingConditions, setLoadingConditions] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadReferrals() {
      setLoadingReferrals(true);
      try {
        const names = await fetchReferralOptions();
        setReferralOptions(names);
      } catch (error) {
        alert('Błąd podczas pobierania danych ze skierowania.');
        console.error(error);
      } finally {
        setLoadingReferrals(false);
      }
    }

    async function loadConditions() {
      setLoadingConditions(true);
      try {
        const conds = await fetchConditions();
        setConditionOptions(conds);
      } catch (err) {
        alert('Błąd podczas pobierania warunków.');
        setConditionOptions([]);
      } finally {
        setLoadingConditions(false);
      }
    }

    loadReferrals();
    loadConditions();
  }, [isOpen]);

  // MultiSelect warunki: operujemy na stringach, ale stan to obiekty
  function handleConditionsChange(selectedNames: string[]) {
    const selectedObjects = conditionOptions.filter(opt => selectedNames.includes(opt.warunek));
    setSelectedConditions(selectedObjects);
  }

  const contentProps: any = {};
  if (forceModal) {
    contentProps.onEscapeKeyDown = (e: any) => e.preventDefault();
    contentProps.onPointerDownOutside = (e: any) => e.preventDefault();
  }

  function handleClear() {
    setSkierowanie([]);
    setSelectedConditions([]);
    onDescribe({ skierowanie: [], warunki: [] });
    onClose();
  }

  function handleSubmit() {
    onDescribe({ skierowanie, warunki: selectedConditions });
    onClose();
  }

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-all"
          onClick={forceModal ? e => e.stopPropagation() : onClose}
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-2xl border border-[#2a3053] bg-[#181b33] px-7 py-7 shadow-2xl transition-all"
          {...contentProps}
        >
          <div className="mb-1 flex items-center justify-between">
            <Dialog.Title className="text-xl font-bold tracking-tight text-white">
              Dane wyjściowe
            </Dialog.Title>
            {!forceModal && (
              <Dialog.Close asChild>
                <button
                  className="rounded p-1 transition hover:bg-white/10"
                  aria-label="Zamknij"
                >
                  <X
                    size={22}
                    className="text-gray-400 hover:text-gray-200"
                  />
                </button>
              </Dialog.Close>
            )}
          </div>
          <Dialog.Description className="mb-1 text-base text-gray-400">
            Podaj dane ze skierowania oraz warunki badania.
            <br />
            <span className="text-sm text-gray-300">
              Mają wpływ na rozpoznanie i cechy pomiarów.
            </span>
          </Dialog.Description>

          <div className="space-y-4">
            <section>
              <label className="mb-2 block text-sm font-semibold text-white">
                Dane ze skierowania
              </label>
              {loadingReferrals ? (
                <div className="text-sm text-gray-400">Ładowanie danych...</div>
              ) : (
                <MultiSelect
                  options={referralOptions}
                  value={skierowanie}
                  onChange={setSkierowanie}
                />
              )}
            </section>

            <section>
              <label className="mb-2 block text-sm font-semibold text-white">Warunki badania</label>
              {loadingConditions ? (
                <div className="text-sm text-gray-400">Ładowanie warunków...</div>
              ) : (
                <MultiSelect
                  options={conditionOptions.map(opt => opt.warunek)}
                  value={selectedConditions.map(c => c.warunek)}
                  onChange={handleConditionsChange}
                />
              )}
            </section>

            <div className="my-1 border-t border-[#2a3053]" />
          </div>

          <div className="mt-6 flex justify-between gap-2">
            <button
              className="rounded-xl border border-[#2a3053] bg-transparent px-6 py-2 text-base text-white/90 transition hover:bg-[#22264d]"
              onClick={handleClear}
              type="button"
            >
              Wyczyść
            </button>
            <button
              className="rounded-xl bg-[#234178] px-6 py-2 text-base font-semibold text-white shadow transition hover:bg-[#2e529b]"
              onClick={handleSubmit}
              type="button"
            >
              Wybierz
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DescribeModal;
