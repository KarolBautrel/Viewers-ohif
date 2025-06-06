// DescribeModal.tsx
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
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

export const WARUNKI_BADANIA = [
  'warunek 1',
  'warunek 2',
  'warunek 3',
  'warunek 4',
];

interface DescribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDescribe: (payload: { skierowanie: string[]; warunki: string[] }) => void;
}

const DescribeModal: React.FC<DescribeModalProps> = ({
  isOpen,
  onClose,
  onDescribe,
}) => {
  const [skierowanie, setSkierowanie] = useState<string[]>([]);
  const [warunki, setWarunki] = useState<string[]>([]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#181b33] p-8 shadow-lg border border-[#2a3053]">
          <div className="flex items-center justify-between mb-2">
            <Dialog.Title className="text-2xl font-semibold text-white">Dane wyjściowe</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-200">
                <X size={22} />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-6 text-base text-gray-400">
            Podaj dane ze skierowania, jeśli występują oraz warunki badania. Będą one miały wpływ na rozpoznanie.
          </Dialog.Description>

          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">Dane ze skierowania</label>
            <MultiSelect
              options={DANE_ZE_SKIEROWANIA}
              value={skierowanie}
              onChange={setSkierowanie}
            />
          </div>
          <div className="mb-8">
            <label className="block text-white font-semibold mb-2">Warunki badania</label>
            <MultiSelect
              options={WARUNKI_BADANIA}
              value={warunki}
              onChange={setWarunki}
            />
          </div>

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
