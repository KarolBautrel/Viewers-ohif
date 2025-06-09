import React, { useEffect, useRef, useState } from 'react';
import { utils } from '@ohif/core';
import { MeasurementTable } from '@ohif/ui-next';
import debounce from 'lodash.debounce';
import { useMeasurements } from '../hooks/useMeasurements';
import { DescribeTree } from '../../../../platform/ui-next/src/components/DescribeTree/index'; //zmienisz sobie sciezke
import  DescribeModal from '../../../../platform/ui-next/src/components/DescribeModal/index'; //zmienisz sobie sciezke
import { ReferralDataSelector } from '../../../../platform/ui-next/src/components/ReferralDataSelector/index';

const { filterAdditionalFindings: filterAdditionalFinding, filterAny } = utils.MeasurementFilters;

export type withAppAndFilters = withAppTypes & {
  measurementFilter: (item) => boolean;
};

export const DANE_ZE_SKIEROWANIA = [
  "nikotynizm",
  "nowotwór złośliwy w wywiadzie",
  "pacjent w immunosupresji",
  "zakażenie wirusem HIV/AIDS",
  "stan po przeszczepie allogenicznym narządu/szpiku",
  "czynniki ryzyka",
  "kontrola po 3 miesiącach",
  "kontrola po roku",
  "nikotynizm",
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

export default function PanelMeasurement({
  servicesManager,
  commandsManager,
  customHeader,
  measurementFilter = filterAny,
}: withAppAndFilters): React.ReactNode {
  const measurementsPanelRef = useRef(null);

  // Globalny state dla danych ze skierowania i warunków
  const [referralData, setReferralData] = useState<string[]>([]);
  const [circumstancesData, setCircumstancesData] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [describeMode, setDescribeMode] = useState<{ uid: string } | null>(null);
  const [userHasSelected, setUserHasSelected] = useState(false);

  const { measurementService } = servicesManager.services;
  const displayMeasurements = useMeasurements(servicesManager, {
    measurementFilter,
  });

  useEffect(() => {
    if (displayMeasurements.length > 0 && measurementsPanelRef.current) {
      debounce(() => {
        measurementsPanelRef.current.scrollTop = measurementsPanelRef.current.scrollHeight;
      }, 300)();
    }
  }, [displayMeasurements.length]);

  useEffect(() => {
    if (!userHasSelected) {
      setModalOpen(true);
    }
  }, [userHasSelected]);
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
  const describeMeasurement = bindCommand('describeMeasurement');
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

  // Obsługa submitu modala
  function handleModalDescribe({ skierowanie, warunki }) {
    setReferralData(skierowanie);
    setCircumstancesData(warunki);
    setModalOpen(false);
    setUserHasSelected(true); 
  }

  const hasAnyDescriptions = displayMeasurements.some(
    m => !!m.description 
  );

  function clearAllDescriptions() {
    displayMeasurements.forEach(m => {
      if (m.description) {
        measurementService.update(m.uid, {
          ...m,
          description: {
            ...m.description,
            description: [],
            wnioski: [],
            rozpoznania: [],
          },
        });
      }
    });
  }
  function handleOpenModalWithConfirm() {
    if (hasAnyDescriptions) {
      if (
        window.confirm(
          'Zmiana danych ze skierowania lub warunków spowoduje usunięcie wszystkich opisów pomiarów. Kontynuować?'
        )
      ) {
        clearAllDescriptions();
        setReferralData([]);
        setCircumstancesData([]);
        setUserHasSelected(false);
        setModalOpen(true);
      }
      // jeśli NIE - nie rób nic
    } else {
      setModalOpen(true);
    }
  } 
  return (
    <>
      {/* Modal z wyborem danych wyjściowych */}
      <DescribeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDescribe={handleModalDescribe}
        forceModal={!userHasSelected}
      />
      

      {describeMode ? (
        <div className="h-full w-full flex flex-col">
          <div className="flex-1 overflow-auto p-4 bg-muted">
            <DescribeTree
              uid={describeMode.uid}
              onSelect={description => {
                describeMeasurement(describeMode.uid, {
                  ...description,
                  skierowanie: referralData,
                  warunki: circumstancesData,
                });
                setDescribeMode(null);
              }}
              onCancel={() => setDescribeMode(null)}
              measurements={measurements}
              referralData={referralData}
              circumstancecData={circumstancesData}
            />
          </div>
        </div>
      ) : (
        <div
          className="invisible-scrollbar overflow-y-auto overflow-x-hidden h-full"
          ref={measurementsPanelRef}
          data-cy={'trackedMeasurements-panel'}
        >
          <ReferralDataSelector
            referralData={referralData}
            circumstancesData={circumstancesData}
            // OLD: onOpenModal={() => setModalOpen(true)}
            // NEW:
            onOpenModal={handleOpenModalWithConfirm}
          />

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