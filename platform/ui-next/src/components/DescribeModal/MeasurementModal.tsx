import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy } from 'lucide-react';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const MeasurementModal: React.FC<MeasurementModalProps> = ({ isOpen, onClose, data }) => {
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      alert('Skopiowano JSON do schowka');
    });
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-2xl border border-[#2a3053] bg-[#181b33] px-6 py-6 shadow-2xl transition-all">
          <div className="mb-1 flex items-center justify-between">
            <Dialog.Title className="text-xl font-bold tracking-tight text-white">
              Dane pomiarowe (JSON)
            </Dialog.Title>
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
          </div>

          <div className="relative">
            <button
              onClick={handleCopy}
              className="absolute right-0 top-0 z-10 m-2 flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            >
              <Copy size={16} /> Kopiuj
            </button>
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded bg-gray-100 p-4 text-sm text-black">
              {jsonString}
            </pre>
          </div>

          <div className="flex justify-end">
            <button
              className="rounded-xl bg-[#234178] px-5 py-2 text-base font-semibold text-white shadow transition hover:bg-[#2e529b]"
              onClick={onClose}
            >
              Zamknij
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default MeasurementModal;
