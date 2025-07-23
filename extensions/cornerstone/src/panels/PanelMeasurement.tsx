import React, { useEffect, useRef, useState, useCallback } from 'react';
import { utils } from '@ohif/core';
import { MeasurementTable } from '@ohif/ui-next';
import debounce from 'lodash.debounce';
import { useMeasurements } from '../hooks/useMeasurements';
import { DescribeTree } from '../../../../platform/ui-next/src/components/DescribeTree/index'; //zmienie sobie sciezke
import { DescribeModal } from '../../../../platform/ui-next/src/components/DescribeModal/index'; //zmienie sobie sciezke
import { MeasurementModal } from '../../../../platform/ui-next/src/components/DescribeModal/index';
import { useWebSocketSender } from '../hooks/useWebsocketListener';
import { useBroadcastChannelSender } from '../hooks/useBroadcastChannelSender';
import { ReferralDataSelector } from '../../../../platform/ui-next/src/components/ReferralDataSelector/index';

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

  const [referralData, setReferralData] = useState<string[]>([]);
  const [circumstancesData, setCircumstancesData] = useState<Record<string,string>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showJSONModal, setShowJSONModal] = useState(false);

  const [describeMode, setDescribeMode] = useState<{ uid: string } | null>(null);
  const [userHasSelected, setUserHasSelected] = useState(false);
  const [risId, setRisId] = useState<string | null>(null);

  const { measurementService } = servicesManager.services;
  const displayMeasurements = useMeasurements(servicesManager, {
    measurementFilter,
  });

  const handleWsMessage = useCallback(
    (data: any) => {
      console.log('WS MESSAGE ', data);
      if (data?.action === 'DELETE' && typeof data.uid === 'string') {
        measurementService.remove(data.uid);
      }
    },
    [measurementService]
  );


  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const uid = queryParams.get('risID');

    setRisId(uid);
  }, []);

    const { sendMessage } = useBroadcastChannelSender(
    risId ? `radiology-channel-${risId}` : 'radiology-channel-default',
    handleWsMessage
  );

  const handleRaportJson = () => {
    setShowJSONModal(true);
  };
  useEffect(() => {
    if (displayMeasurements) {
      // Musze to przemyslec
      // const recentlyDescribed = displayMeasurements.find(m => m.description?.localization);
      // if (recentlyDescribed) {
      const jsonTest = JSON.stringify(displayMeasurements);
      // console.log('PRzed wyslaniem', jsonTest);
      sendMessage({
        action: 'MEASUREMENT',
        data: jsonTest,
      });
      // }
    }
  }, [displayMeasurements, describeMode]);
  useEffect(() => {
    if (displayMeasurements.length > 0 && measurementsPanelRef.current) {
      debounce(() => {
        measurementsPanelRef.current.scrollTop = measurementsPanelRef.current.scrollHeight;
      }, 300)();
    }
  }, [displayMeasurements.length]);

  // useEffect(() => {
  //   if (!userHasSelected) {
  //     setModalOpen(true);
  //   }
  // }, [userHasSelected]);
  const prevMeasurementCount = useRef(0);

  useEffect(() => {
    const firstMeasurement =
      prevMeasurementCount.current === 0 && displayMeasurements.length > 0 && !userHasSelected;

    if (firstMeasurement) {
      setModalOpen(true);
    }

    prevMeasurementCount.current = displayMeasurements.length;
  }, [displayMeasurements.length, userHasSelected]);
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

  function handleModalDescribe({ skierowanie, warunki }) {
    setReferralData(skierowanie);
    setCircumstancesData(warunki);
    setModalOpen(false);
    setUserHasSelected(true);
  }

  const hasAnyDescriptions = displayMeasurements.some(m => !!m.description);

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
    } else {
      setModalOpen(true);
    }
  }
  return (
    <>
      <DescribeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDescribe={handleModalDescribe}
        forceModal={!userHasSelected}
      />
      <MeasurementModal
        isOpen={showJSONModal}
        onClose={() => setShowJSONModal(false)}
        data={displayMeasurements}
      />
      {describeMode ? (
        <div className="flex h-full w-full flex-col">
          <div className="bg-muted flex-1 overflow-auto p-4">
            <DescribeTree
              uid={describeMode.uid}
              onSelect={description => {
                describeMeasurement(describeMode.uid, {
                  ...description,
                  referral: referralData,
                  circumstances: circumstancesData,
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
          className="invisible-scrollbar h-full overflow-y-auto overflow-x-hidden"
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
          <div className="flex justify-end px-2">
            <button
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
              onClick={handleRaportJson}
            >
              Wyswietl json z raportem
            </button>
          </div>

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
