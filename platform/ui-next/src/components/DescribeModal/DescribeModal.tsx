import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import CircumstancesTree from '../DescribeTree/components/CircumstancesTree';
import MultiSelect from '../MultiSelect/MultiSelect';
import { fetchReferralOptions } from '../../apiService/api';

interface DescribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDescribe: (payload: { skierowanie: string[]; warunki: string[] }) => void;
  forceModal?: boolean;
}

const DescribeModal: React.FC<DescribeModalProps> = ({
  isOpen,
  onClose,
  onDescribe,
  forceModal = false,
}) => {
  const [skierowanie, setSkierowanie] = useState<string[]>([]);
  const [warunki, setWarunki] = useState<string[]>([]);
  const [referralOptions, setReferralOptions] = useState<string[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [showCircumstancesTree, setShowCircumstancesTree] = useState(false);
  const [circTreeData, setCircTreeData] = useState<any[] | null>(null);
  const [loadingCirc, setLoadingCirc] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    /// In the future wymigruje wszystko do api serwisu
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

    loadReferrals();
  }, [isOpen]);

  async function handleCircumstancesTreeOpen() {
    setLoadingCirc(true);
    const data = await fetchCircumstancesTree();
    setCircTreeData(data);
    setShowCircumstancesTree(true);
    setLoadingCirc(false);
  }

  function handleCircumstancesTreeDone(selectedPath: any[]) {
    setWarunki(selectedPath.map(node => node.name));
    setShowCircumstancesTree(false);
  }

  function handleCircumstancesTreeBack() {
    setShowCircumstancesTree(false);
  }

  const contentProps: any = {};
  if (forceModal) {
    contentProps.onEscapeKeyDown = (e: any) => e.preventDefault();
    contentProps.onPointerDownOutside = (e: any) => e.preventDefault();
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

            <div className="my-1 border-t border-[#2a3053]" />
          </div>

          <div className="mt-6 flex justify-between gap-2">
            <button
              className="rounded-xl border border-[#2a3053] bg-transparent px-6 py-2 text-base text-white/90 transition hover:bg-[#22264d]"
              onClick={() => {
                setSkierowanie([]);
                setWarunki([]);
                onDescribe({ skierowanie: [], warunki: [] });
                onClose();
              }}
              type="button"
            >
              Wyczyść
            </button>
            <button
              className="rounded-xl bg-[#234178] px-6 py-2 text-base font-semibold text-white shadow transition hover:bg-[#2e529b]"
              onClick={() => {
                onDescribe({ skierowanie, warunki });
                onClose();
              }}
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

async function fetchCircumstancesTree() {
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
