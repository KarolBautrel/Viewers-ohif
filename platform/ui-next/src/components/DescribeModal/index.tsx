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
          onClick={forceModal ? (e) => e.stopPropagation() : onClose}
        />
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 z-50
            w-full max-w-md
            -translate-x-1/2 -translate-y-1/2
            rounded-2xl
            bg-[#181b33]
            shadow-2xl
            border border-[#2a3053]
            px-7 py-7
            flex flex-col
            gap-5
            transition-all
          "
          {...contentProps}
        >
          <div className="flex items-center justify-between mb-1">
            <Dialog.Title className="text-xl font-bold tracking-tight text-white">
              Dane wyjściowe
            </Dialog.Title>
            {!forceModal && (
              <Dialog.Close asChild>
                <button className="p-1 rounded hover:bg-white/10 transition" aria-label="Zamknij">
                  <X size={22} className="text-gray-400 hover:text-gray-200" />
                </button>
              </Dialog.Close>
            )}
          </div>
          <Dialog.Description className="mb-1 text-base text-gray-400">
            Podaj dane ze skierowania oraz warunki badania.<br />
            <span className="text-gray-300 text-sm">Mają wpływ na rozpoznanie i cechy pomiarów.</span>
          </Dialog.Description>

          <div className="space-y-4">
            {/* --- MULTISELECT DLA SKIEROWANIA --- */}
            <section>
              <label className="block text-sm font-semibold text-white mb-2">
                Dane ze skierowania
              </label>
              <MultiSelect
                options={DANE_ZE_SKIEROWANIA}
                value={skierowanie}
                onChange={setSkierowanie}
              />
              {skierowanie.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skierowanie.map(w => (
                    <span
                      key={w}
                      className="
                        bg-[#212649]
                        text-white/90
                        px-3 py-1 rounded-2xl
                        text-xs font-medium
                        border border-[#2a3053]
                        hover:bg-[#28305b] transition
                      "
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <div className="border-t border-[#2a3053] my-1" />

            {/* --- DRZEWO DLA WARUNKÓW BADANIA --- */}
            <section>
              <label className="block text-sm font-semibold text-white mb-2">
                Warunki badania
              </label>
              <button
                type="button"
                className="
                  rounded-xl bg-[#348CFD]
                  px-4 py-1.5 font-semibold text-white text-sm
                  hover:bg-[#225BA4] shadow
                  transition disabled:opacity-60
                "
                onClick={handleCircumstancesTreeOpen}
                disabled={loadingCirc}
              >
                {loadingCirc ? 'Ładowanie...' : (warunki.length ? 'Zmień' : 'Wybierz warunki badania')}
              </button>
              {warunki.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {warunki.map(w => (
                    <span
                      key={w}
                      className="
                        bg-[#212649]
                        text-white/90
                        px-3 py-1 rounded-2xl
                        text-xs font-medium
                        border border-[#2a3053]
                        hover:bg-[#28305b] transition
                      "
                    >
                      {w}
                    </span>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* DRZEWO - Modal w rogu */}
          {showCircumstancesTree && circTreeData && (
            <div className="
              fixed left-8 bottom-8 z-[60]
              bg-[#23274a] rounded-2xl p-6
              min-w-[340px] max-w-[400px]
              shadow-2xl border border-[#2a3053]
              animate-fade-in
            ">
              <CircumstancesTree
                data={circTreeData}
                onDone={handleCircumstancesTreeDone}
                onBack={handleCircumstancesTreeBack}
              />
            </div>
          )}

          <div className="flex justify-between gap-2 mt-6">
            <button
              className="rounded-xl px-6 py-2 bg-transparent border border-[#2a3053] text-base text-white/90 hover:bg-[#22264d] transition"
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
              className="rounded-xl px-6 py-2 bg-[#234178] text-base font-semibold text-white shadow hover:bg-[#2e529b] transition"
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
