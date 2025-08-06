// Volume loader schemes
export const VOLUME_LOADER_SCHEME = 'cornerstoneStreamingImageVolume';
export const DYNAMIC_VOLUME_LOADER_SCHEME = 'cornerstoneStreamingDynamicImageVolume';
export const WS_ACTIONS = {
  EDIT: 'EDIT',
  DELETE: 'DELETE',
  MEASUREMENT: 'MEASUREMENT',
} as const;
export const API_URL = 'https://ohif.bbbit.io/app';
// export const API_URL = 'http://localhost:8001';

export type WsAction = (typeof WS_ACTIONS)[keyof typeof WS_ACTIONS];
