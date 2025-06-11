import React, { useState } from 'react';
import { InputDialog } from '@ohif/ui-next';

type ReportDialogProps = {
  hide: () => void;
  onSave: (data: { reportName: string; dataSource: string | null }) => void;
  onCancel: () => void;
};

function ReportDialog({ hide, onSave, onCancel }: ReportDialogProps) {
  const [reportName, setReportName] = useState('');

  const handleSave = () => {
    onSave({
      reportName,
      dataSource: 'exportToDB', // stała wartość
    });
    hide();
  };

  const handleCancel = () => {
    onCancel();
    hide();
  };

  return (
    <div className="text-foreground mt-2 flex min-w-[400px] max-w-md flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div>
          <div className="mb-2 font-semibold">Save to Database</div>
          <InputDialog
            value={reportName}
            onChange={setReportName}
            submitOnEnter
          >
            <InputDialog.Field>
              <InputDialog.Input placeholder="Report name" />
            </InputDialog.Field>
          </InputDialog>
        </div>

        <div className="flex justify-end gap-2">
          <InputDialog>
            <InputDialog.Actions>
              <InputDialog.ActionsSecondary onClick={handleCancel}>
                Cancel
              </InputDialog.ActionsSecondary>
              <InputDialog.ActionsPrimary onClick={handleSave} disabled={!reportName.trim()}>
                Save
              </InputDialog.ActionsPrimary>
            </InputDialog.Actions>
          </InputDialog>
        </div>
      </div>
    </div>
  );
}

export { ReportDialog };
export default {
  'ohif.createReportDialog': ReportDialog,
};
