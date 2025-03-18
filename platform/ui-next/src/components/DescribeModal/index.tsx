import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import DescribeTree from '../DescribeTree/index';

interface DescribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDescribe: (description:string, uid:string) => void;
  uid:string
}

const DescribeModal: React.FC<DescribeModalProps> = ({ isOpen, onClose, onDescribe, uid }) => {

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={onClose}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-96 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">Add Description</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600">
              Please select relevant findings from the wizard below. {uid}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-800">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <DescribeTree
            onSelect={fullPath => {
              console.log('Wizard completed path:', fullPath);
              onDescribe(uid, fullPath);
            }}
          />

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DescribeModal;
