import React, { useEffect, useRef, useState, useCallback } from 'react';
import { utils } from '@ohif/core';
import { MeasurementTable } from '@ohif/ui-next';
import debounce from 'lodash.debounce';
import { useMeasurements } from '../hooks/useMeasurements';
import { DescribeTree } from '../../../../platform/ui-next/src/components/DescribeTree/index';
import { DescribeModal } from '../../../../platform/ui-next/src/components/DescribeModal/index';
import { MeasurementModal } from '../../../../platform/ui-next/src/components/DescribeModal/index';
import { useBroadcastChannelSender } from '../hooks/useBroadcastChannelSender';
import { ReferralDataSelector } from '../../../../platform/ui-next/src/components/ReferralDataSelector/index';
import { useCornerstoneMeasurements } from '../hooks/useCornerStoneMeasurements';
import { useViewerUrlParams } from '../hooks/useViewerUrlParams';
import { OpenPatientReportButton } from '../../../../platform/ui-next/src/components/SupportButtons/SupportButtons';
import { ShowReportJsonButton } from '../../../../platform/ui-next/src/components/SupportButtons/SupportButtons';
import { useRisWindow } from '../hooks/useCheckRisWindow';
import { useTranslation } from 'react-i18next';
import { sendMeasurements } from '../utils/sendMeasurementsToBackend';

const { filterAdditionalFindings: filterAdditionalFinding, filterAny } = utils.MeasurementFilters;

export default function PanelMeasurement({
  servicesManager,
  commandsManager,
  customHeader,
  measurementFilter = filterAny,
}) {
  const measurementsPanelRef = useRef(null);

  const [referralData, setReferralData] = useState<string[]>([]);
  const [circumstancesData, setCircumstancesData] = useState<Record<string, string>[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showJSONModal, setShowJSONModal] = useState(false);
  const [describeMode, setDescribeMode] = useState<{ uid: string } | null>(null);
  const [userHasSelected, setUserHasSelected] = useState(false);
  const { measurementService } = servicesManager.services;
  const displayMeasurements = useMeasurements(servicesManager, { measurementFilter });
  const { t } = useTranslation('MeasurementDescribe');

  const handleWsMessage = useCallback(
    (data: any) => {
      if (data?.action === 'DELETE' && typeof data.uid === 'string') {
        measurementService.remove(data.uid);
      }
    },
    [measurementService]
  );
  const { descriptionId, studyId, patientGender, patientAge, refId } = useViewerUrlParams();

  const { sendMessage } = useBroadcastChannelSender(
    descriptionId ? `radiology-channel-${descriptionId}` : 'radiology-channel-default',
    handleWsMessage
  );

  useEffect(() => {
    if (displayMeasurements) {
      const jsonTest = JSON.stringify(displayMeasurements);
      sendMessage({ action: 'MEASUREMENT', data: jsonTest });
      sendMeasurements({
        referralId: refId,
        descriptionId,
        measurements: displayMeasurements,
      });
    }
  }, [displayMeasurements, describeMode]);

  useEffect(() => {
    if (displayMeasurements.length > 0 && measurementsPanelRef.current) {
      debounce(() => {
        measurementsPanelRef.current.scrollTop = measurementsPanelRef.current.scrollHeight;
      }, 300)();
    }
  }, [displayMeasurements.length]);

  const prevMeasurementCount = useRef(0);
  const { referral, circumstances, isLoadedFromBackend } = useCornerstoneMeasurements({
    descriptionId,
    studyId,
    measurementService,
  });

  useEffect(() => {
    const firstMeasurement =
      prevMeasurementCount.current === 0 &&
      displayMeasurements.length > 0 &&
      !userHasSelected &&
      !isLoadedFromBackend;

    if (firstMeasurement) setModalOpen(true);

    prevMeasurementCount.current = displayMeasurements.length;
  }, [displayMeasurements.length, userHasSelected]);

  const bindCommand = (name, options?) => {
    return (...args) => {
      const [uid, description] = args;
      commandsManager.run(name, { ...options, uid, description });
    };
  };
  const checkRisWindow = useRisWindow();

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

  useEffect(() => {
    setReferralData(referral);
    setCircumstancesData(circumstances.map(w => ({ warunek: w })));
  }, [referral, circumstances]);

  function handleOpenModalWithConfirm() {
    if (
      displayMeasurements.some(m => !!m.description) &&
      window.confirm(t('describeModal.modifyAlertMessage'))
    ) {
      clearAllDescriptions();
      setReferralData([]);
      setCircumstancesData([]);
      setUserHasSelected(false);
      setModalOpen(true);
    } else {
      setModalOpen(false);
    }
  }
  useEffect(() => {
    if (refId) {
      checkRisWindow(refId);
    }
  }, [refId, checkRisWindow]);
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
              patientAge={patientAge}
              patientGender={patientGender}
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
            onOpenModal={handleOpenModalWithConfirm}
          />
          <div className="my-2 flex justify-end gap-2 px-2">
            <OpenPatientReportButton refId={refId} />
            <ShowReportJsonButton onClick={() => setShowJSONModal(true)} />
          </div>
          <MeasurementTable
            key="tracked"
            title="Measurements"
            data={measurements}
            {...onArgs}
          >
            <MeasurementTable.Header>
              {customHeader &&
                (typeof customHeader === 'function'
                  ? customHeader({ additionalFindings, measurements })
                  : customHeader)}
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
