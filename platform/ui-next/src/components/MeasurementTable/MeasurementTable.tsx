import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataRow, PanelSection } from '../../index';
import { createContext } from '../../lib/createContext';
import { Button } from '@ohif/ui-next';

interface MeasurementTableContext {
  data?: any[];
  onClick?: (uid: string) => void;
  onDelete?: (uid: string) => void;
  onToggleVisibility?: (uid: string) => void;
  onToggleLocked?: (uid: string) => void;
  onRename?: (uid: string) => void;
  onColor?: (uid: string) => void;
  expandAll?: boolean;
  setExpandAll?: (value: boolean) => void;
  onDescribe?: (uid: string, description: string) => void;
  disableEditing?: boolean;
}

const [MeasurementTableProvider, useMeasurementTableContext] =
  createContext<MeasurementTableContext>('MeasurementTable', { data: [] });

interface MeasurementDataProps extends MeasurementTableContext {
  title: string;
  children: React.ReactNode;
}

const MeasurementTable = ({
  data = [],
  onClick,
  onDelete,
  onToggleVisibility,
  onToggleLocked,
  onRename,
  onColor,
  onDescribe,
  title,
  children,
  disableEditing = false,
}: MeasurementDataProps) => {
  const { t } = useTranslation('MeasurementTable');
  const amount = data.length;

  useEffect(() => {
    data;
  });
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

  return (
    <MeasurementTableProvider
      data={data}
      onClick={onClick}
      onDelete={onDelete}
      onToggleVisibility={onToggleVisibility}
      onToggleLocked={onToggleLocked}
      onRename={onRename}
      onColor={onColor}
      disableEditing={disableEditing}
      onDescribe={onDescribe}
      expandAll={expandAll}
      setExpandAll={setExpandAll}
    >
      <PanelSection defaultOpen={true}>
        <PanelSection.Header className="bg-secondary-dark flex items-center justify-between">
          <span>{`${t(title)} (${amount})`}</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpandAll(!expandAll)}
            ></Button>
          </div>
        </PanelSection.Header>
        <PanelSection.Content>{children}</PanelSection.Content>
      </PanelSection>
    </MeasurementTableProvider>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <div className="measurement-table-header">{children}</div>;
};

const Body = () => {
  const { data } = useMeasurementTableContext('MeasurementTable.Body');

  if (!data || data.length === 0) {
    return (
      <div className="text-primary-light mb-1 flex flex-1 items-center px-2 py-2 text-base">
        No tracked measurements
      </div>
    );
  }

  return (
    <div className="measurement-table-body space-y-px">
      {data.map((item, index) => (
        <Row
          key={item.uid}
          item={item}
          index={index}
          measurementUID={item.uid}
        />
      ))}
    </div>
  );
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return <div className="measurement-table-footer">{children}</div>;
};

interface MeasurementItem {
  uid: string;
  label: string;
  colorHex: string;
  isSelected: boolean;
  displayText: { primary: string[]; secondary: string[] };
  isVisible: boolean;
  isLocked: boolean;
  toolName: string;
  description: string;
}

interface RowProps {
  item: MeasurementItem;
  index: number;
  measurementUID: string;
}

const Row = ({ item, index }: RowProps) => {
  const {
    onClick,
    onDelete,
    onToggleVisibility,
    onToggleLocked,
    onRename,
    onColor,
    onDescribe,
    disableEditing,
  } = useMeasurementTableContext('MeasurementTable.Row');

  return (
    <DataRow
      key={item.uid}
      measurementUID={item.uid}
      description={item.label}
      number={index + 1}
      title={item.label}
      colorHex={item.colorHex}
      isSelected={item.isSelected}
      details={item.displayText}
      onSelect={() => onClick(item.uid)}
      onDelete={() => onDelete(item.uid)}
      disableEditing={disableEditing}
      isVisible={item.isVisible}
      isLocked={item.isLocked}
      onToggleVisibility={() => onToggleVisibility(item.uid)}
      onToggleLocked={() => onToggleLocked(item.uid)}
      onRename={() => onRename(item.uid)}
      onDescribe={(uid, description) => onDescribe?.(uid, description)}
      measurementDescription={item?.description}
      // onColor={() => onColor(item.uid)}
    />
  );
};

MeasurementTable.Header = Header;
MeasurementTable.Body = Body;
MeasurementTable.Footer = Footer;
MeasurementTable.Row = Row;

export default MeasurementTable;
