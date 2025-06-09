import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import CircumstancesTree from '../DescribeTree/components/CircumstancesTree';
import MultiSelect from '../MultiSelect/MultiSelect';

export const DANE_ZE_SKIEROWANIA = [
  "nikotynizm",
  "nowotwór złośliwy w wywiadzie",
  "pacjent w immunosupresji",
  "zakażenie wirusem HIV/AIDS",
  "stan po przeszczepie allogenicznym narządu/szpiku",
  "czynniki ryzyka",
  "kontrola po roku",
  "kontrola po >600 dniach",
  "kontrola po 400-600 dniach",
  "kontrola po <=400 dniach",
  "kontrola po >400 dniach",
  "kontrola po 4 latach ",
  "kontrola po 3 miesiącach",
  "badanie kontrolne",
  "kontrola po 3=>=6 miesiącach",
];

// Fake fetch (podmień na endpoint gdy będzie gotowy)
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

interface DescribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDescribe: (payload: { skierowanie: string[]; warunki: string[] }) => void;
  forceModal?: boolean; // nowy prop!
}

const DescribeModal: React.FC<DescribeModalProps> = ({
  isOpen,
  onClose,
  onDescribe,
  forceModal = false,
}) => {
  const [skierowanie, setSkierowanie] = useState<string[]>([]);
  const [warunki, setWarunki] = useState<string[]>([]);
  const [showCircumstancesTree, setShowCircumstancesTree] = useState(false);
  const [circTreeData, setCircTreeData] = useState<any[] | null>(null);
  const [loadingCirc, setLoadingCirc] = useState(false);

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

  // ForceModal: blokuj esc i klik poza modalem
  const contentProps: any = {};
  if (forceModal) {
    contentProps.onEscapeKeyDown = (e: any) => e.preventDefault();
    contentProps.onPointerDownOutside = (e: any) => e.preventDefault();
  }

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={forceModal ? (e) => e.stopPropagation() : onClose}
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#181b33] p-8 shadow-lg border border-[#2a3053]"
          {...contentProps}
        >
          <div className="flex items-center justify-between mb-2">
            <Dialog.Title className="text-2xl font-semibold text-white">
              Dane wyjściowe
            </Dialog.Title>
            {!forceModal && (
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-200">
                  <X size={22} />
                </button>
              </Dialog.Close>
            )}
          </div>
          <Dialog.Description className="mb-6 text-base text-gray-400">
            Podaj dane ze skierowania oraz warunki badania. Będą one miały wpływ na rozpoznanie.
          </Dialog.Description>

          {/* --- MULTISELECT DLA SKIEROWANIA --- */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Dane ze skierowania
            </label>
            <MultiSelect
              options={DANE_ZE_SKIEROWANIA}
              value={skierowanie}
              onChange={setSkierowanie}
            />
            {skierowanie.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skierowanie.map(w => (
                  <span
                    key={w}
                    className="bg-[#2a3053] text-white px-3 py-1 rounded-xl text-xs font-medium"
                  >
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* --- DRZEWO DLA WARUNKÓW BADANIA --- */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-2">
              Warunki badania
            </label>
            <button
              type="button"
              className="rounded bg-[#348CFD] px-3 py-1 text-white font-semibold text-sm hover:bg-[#225BA4]"
              onClick={handleCircumstancesTreeOpen}
              disabled={loadingCirc}
            >
              {loadingCirc ? 'Ładowanie...' : 'Wybierz warunki badania'}
            </button>
            {warunki.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {warunki.map(w => (
                  <span
                    key={w}
                    className="bg-[#2a3053] text-white px-3 py-1 rounded-xl text-xs font-medium"
                  >
                    {w}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* DRZEWO W LEWYM DOLNYM ROGU */}
          {showCircumstancesTree && circTreeData && (
            <div className="fixed left-6 bottom-6 z-50 bg-[#23274a] rounded-xl p-6 min-w-[340px] max-w-[400px] shadow-2xl border border-[#2a3053]">
              <CircumstancesTree
                data={circTreeData}
                onDone={handleCircumstancesTreeDone}
                onBack={handleCircumstancesTreeBack}
              />
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              className="rounded px-7 py-2 bg-transparent border-none text-lg text-white hover:underline"
              onClick={() => {
                setSkierowanie([]);
                setWarunki([]);
                onDescribe({ skierowanie: [], warunki: [] });
                onClose();
              }}
              type="button"
            >
              Nie wybieram
            </button>
            <button
              className="rounded px-7 py-2 bg-[#234178] text-lg text-white hover:bg-[#2e529b]"
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
