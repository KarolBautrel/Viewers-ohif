import { metaData, utilities } from '@cornerstonejs/core';
import { sendMeasurementsToApi } from './api/apiMesurements';
import OHIF, { DicomMetadataStore } from '@ohif/core';
import dcmjs from 'dcmjs';
import { adaptersSR } from '@cornerstonejs/adapters';

import getFilteredCornerstoneToolState from './utils/getFilteredCornerstoneToolState';
import hydrateStructuredReport from './utils/hydrateStructuredReport';

const { MeasurementReport } = adaptersSR.Cornerstone3D;
const { log } = OHIF;

/**
 * @param measurementData An array of measurements from the measurements service
 * that you wish to serialize.
 * @param additionalFindingTypes toolTypes that should be stored with labels as Findings
 * @param options Naturalized DICOM JSON headers to merge into the displaySet.
 *
 */
const _generateReport = (measurementData, additionalFindingTypes, options = {}) => {
  const filteredToolState = getFilteredCornerstoneToolState(
    measurementData,
    additionalFindingTypes
  );

  const report = MeasurementReport.generateReport(
    filteredToolState,
    metaData,
    utilities.worldToImageCoords,
    options
  );

  const { dataset } = report;

  // Set the default character set as UTF-8
  // https://dicom.innolitics.com/ciods/nm-image/sop-common/00080005
  if (typeof dataset.SpecificCharacterSet === 'undefined') {
    dataset.SpecificCharacterSet = 'ISO_IR 192';
  }
  return dataset;
};

const commandsModule = (props: withAppTypes) => {
  const { servicesManager, extensionManager } = props;
  const { customizationService, viewportGridService, displaySetService } = servicesManager.services;

  const actions = {
    changeColorMeasurement: ({ uid }) => {
      // When this gets supported, it probably belongs in cornerstone, not sr
      throw new Error('Unsupported operation: changeColorMeasurement');
      // const { color } = measurementService.getMeasurement(uid);
      // const rgbaColor = {
      //   r: color[0],
      //   g: color[1],
      //   b: color[2],
      //   a: color[3] / 255.0,
      // };
      // colorPickerDialog(uiDialogService, rgbaColor, (newRgbaColor, actionId) => {
      //   if (actionId === 'cancel') {
      //     return;
      //   }

      //   const color = [newRgbaColor.r, newRgbaColor.g, newRgbaColor.b, newRgbaColor.a * 255.0];
      // segmentationService.setSegmentColor(viewportId, segmentationId, segmentIndex, color);
      // });
    },

    /**
     *
     * @param measurementData An array of measurements from the measurements service
     * @param additionalFindingTypes toolTypes that should be stored with labels as Findings
     * @param options Naturalized DICOM JSON headers to merge into the displaySet.
     * as opposed to Finding Sites.
     * that you wish to serialize.
     */
    downloadReport: ({ measurementData, additionalFindingTypes, options = {} }) => {
      const srDataset = _generateReport(measurementData, additionalFindingTypes, options);
      const reportBlob = dcmjs.data.datasetToBlob(srDataset);

      //Create a URL for the binary.
      const objectUrl = URL.createObjectURL(reportBlob);
      window.location.assign(objectUrl);
    },

    /**
     *
     * @param measurementData An array of measurements from the measurements service
     * that you wish to serialize.
     * @param dataSource The dataSource that you wish to use to persist the data.
     * @param additionalFindingTypes toolTypes that should be stored with labels as Findings
     * @param options Naturalized DICOM JSON headers to merge into the displaySet.
     * @return The naturalized report
     */
     storeMeasurements: async ({
      measurementData,
      dataSource,
      additionalFindingTypes,
      options = {},
    }) => {
      OHIF.log.info('[REST] storeMeasurements (custom REST endpoint)');
      //console.log('Measurement Data wysyłane do backendu:', measurementData);
      console.log(JSON.stringify(measurementData))
    
      try {
        const response = await fetch('http://localhost:8001/api/neo/measurement/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(measurementData),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        OHIF.log.info('[REST] storeMeasurements – odpowiedź z backendu:', result);
        return result;
      } catch (error) {
        OHIF.log.error(`[REST] Error podczas wysyłania measurements: ${error.message}`);
        throw new Error(error.message || 'Error while sending the measurements.');
      }
    },
    
    /**
     * Loads measurements by hydrating and loading the SR for the given display set instance UID
     * and displays it in the active viewport.
     */
    loadSRMeasurements: ({ displaySetInstanceUID }) => {
      const { SeriesInstanceUIDs } = hydrateStructuredReport(
        { servicesManager, extensionManager, commandsManager },
        displaySetInstanceUID
      );

      const displaySets = displaySetService.getDisplaySetsForSeries(SeriesInstanceUIDs[0]);
      if (displaySets.length) {
        viewportGridService.setDisplaySetsForViewports([
          {
            viewportId: viewportGridService.getActiveViewportId(),
            displaySetInstanceUIDs: [displaySets[0].displaySetInstanceUID],
          },
        ]);
      }
    },
  };

  const definitions = {
    downloadReport: {
      commandFn: actions.downloadReport,
    },
    storeMeasurements: {
      commandFn: actions.storeMeasurements,
    },
    loadSRMeasurements: {
      commandFn: actions.loadSRMeasurements,
    },
  };

  return {
    actions,
    definitions,
    defaultContext: 'CORNERSTONE_STRUCTURED_REPORT',
  };
};

export default commandsModule;
