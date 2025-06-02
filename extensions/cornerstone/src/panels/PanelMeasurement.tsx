import React, { useEffect, useRef, useState } from 'react';
import { utils } from '@ohif/core';
import { MeasurementTable } from '@ohif/ui-next';
import debounce from 'lodash.debounce';
import { useMeasurements } from '../hooks/useMeasurements';
import { DescribeTree } from '../../../../platform/ui-next/src/components/DescribeTree/index'; //zmienie to potem

const { filterAdditionalFindings: filterAdditionalFinding, filterAny } = utils.MeasurementFilters;

export type withAppAndFilters = withAppTypes & {
  measurementFilter: (item) => boolean;
};

export default function PanelMeasurement({
  servicesManager,
  commandsManager,
  customHeader,
  measurementFilter = filterAny,
}: withAppAndFilters): React.ReactNode {
  const measurementsPanelRef = useRef(null);

  const { measurementService } = servicesManager.services;
  const [describeMode, setDescribeMode] = useState<{ uid: string } | null>(null);

  const displayMeasurements = useMeasurements(servicesManager, {
    measurementFilter,
  });

  useEffect(() => {
    if (displayMeasurements.length > 0) {
      debounce(() => {
        measurementsPanelRef.current.scrollTop = measurementsPanelRef.current.scrollHeight;
      }, 300)();
    }
  }, [displayMeasurements.length]);

  const bindCommand = (name: string | string[], options?) => {
    return (...args: any[]) => {
      const [uid, description] = args;
  
      commandsManager.run(name, { ...options, uid, description });
    };
  };
  
  const jumpToImage = bindCommand('jumpToMeasurement', { displayMeasurements });
  const removeMeasurement = bindCommand('removeMeasurement');
  const renameMeasurement = bindCommand(['jumpToMeasurement', 'renameMeasurement'], {
    displayMeasurements,
  });
  const toggleLockMeasurement = bindCommand('toggleLockMeasurement');
  const toggleVisibilityMeasurement = bindCommand('toggleVisibilityMeasurement');
  /// Here I need to add action connected to creating description (not opening modal)
  const describeMeasurement = bindCommand("describeMeasurement")
  /// 
  const additionalFilter = filterAdditionalFinding(measurementService);

  const measurements = displayMeasurements.filter(
    item => !additionalFilter(item) && measurementFilter(item)
  );
  const additionalFindings = displayMeasurements.filter(
    item => additionalFilter(item) && measurementFilter(item)
  );

  const onArgs = {
    onClick: jumpToImage,
    onDelete: removeMeasurement,
    onToggleVisibility: toggleVisibilityMeasurement,
    onToggleLocked: toggleLockMeasurement,
    onRename: renameMeasurement,
    onDescribe: (uid, _desc) => setDescribeMode({ uid }),
  };

  return (
    <>
      {describeMode ? (
        <div className="h-full w-full flex flex-col">
          <div className="flex-1 overflow-auto p-4 bg-muted">
            <DescribeTree
              uid={describeMode.uid}
              onSelect={description => {
                describeMeasurement(describeMode.uid, description);
                setDescribeMode(null);
              }}
              onCancel={() => setDescribeMode(null)}
              measurements={measurements}
            />
          </div>
        </div>
      ) : (
        <div
          className="invisible-scrollbar overflow-y-auto overflow-x-hidden h-full"
          ref={measurementsPanelRef}
          data-cy={'trackedMeasurements-panel'}
        >
          <MeasurementTable
            key="tracked"
            title="Measurements"
            data={measurements}
            {...onArgs}
          >
            <MeasurementTable.Header>
              {customHeader && (
                <>
                  {typeof customHeader === 'function'
                    ? customHeader({
                        additionalFindings,
                        measurements,
                      })
                    : customHeader}
                </>
              )}
            </MeasurementTable.Header>
            <MeasurementTable.Body />
          </MeasurementTable>
          {additionalFindings.length > 0 && (
            <MeasurementTable
              key="additional"
              data={additionalFindings}
              title="Additional Findings"
              {...onArgs}
            >
              <MeasurementTable.Body />
            </MeasurementTable>
          )}
        </div>
      )}
    </>
  );
}
