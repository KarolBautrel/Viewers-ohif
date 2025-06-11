import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import CircumstancesTree from '../DescribeTree/components/CircumstancesTree';
import MultiSelect from '../MultiSelect/MultiSelect';

export const DANE_ZE_SKIEROWANIA = [
  'nikotynizm',
  'nowotwór złośliwy w wywiadzie',
  'pacjent w immunosupresji',
  'zakażenie wirusem HIV/AIDS',
  'stan po przeszczepie allogenicznym narządu/szpiku',
  'czynniki ryzyka',
  'kontrola po roku',
  'kontrola po >600 dniach',
  'kontrola po 400-600 dniach',
  'kontrola po <=400 dniach',
  'kontrola po >400 dniach',
  'kontrola po 4 latach ',
  'kontrola po 3 miesiącach',
  'badanie kontrolne',
  'kontrola po 3=>=6 miesiącach',
];

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

  // Block esc/close when forceModal
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
            {/* --- MULTISELECT DLA SKIEROWANIA --- */}
            <section>
              <label className="mb-2 block text-sm font-semibold text-white">
                Dane ze skierowania
              </label>
              <MultiSelect
                options={DANE_ZE_SKIEROWANIA}
                value={skierowanie}
                onChange={setSkierowanie}
              />
            </section>

            <div className="my-1 border-t border-[#2a3053]" />

            {/* --- DRZEWO DLA WARUNKÓW BADANIA --- */}
            {/* <section>
              <label className="mb-2 block text-sm font-semibold text-white">Warunki badania</label>
              <button
                type="button"
                className="rounded-xl bg-[#348CFD] px-4 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-[#225BA4] disabled:opacity-60"
                onClick={handleCircumstancesTreeOpen}
                disabled={loadingCirc}
              >
                {loadingCirc
                  ? 'Ładowanie...'
                  : warunki.length
                    ? 'Zmień'
                    : 'Wybierz warunki badania'}
              </button>
              {warunki.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {warunki.map(w => (
                    <span
                      key={w}
                      className="rounded-2xl border border-[#2a3053] bg-[#212649] px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-[#28305b]"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </section> */}
          </div>

          {/* {showCircumstancesTree && circTreeData && (
            <div className="animate-fade-in fixed left-8 bottom-8 z-[60] min-w-[340px] max-w-[400px] rounded-2xl border border-[#2a3053] bg-[#23274a] p-6 shadow-2xl">
              <CircumstancesTree
                data={circTreeData}
                onDone={handleCircumstancesTreeDone}
                onBack={handleCircumstancesTreeBack}
              />
            </div>
          )} */}

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
