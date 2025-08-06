type AnnotationInput = {
  uid: string;
  data: {
    [imageId: string]: {
      unit: string;
      length: number;
    };
  };
  type: string;
  label: string;
  points: number[][];
  source: any;
  textBox: {
    hasMoved: boolean;
    worldPosition: number[];
    worldBoundingBox: {
      topLeft: number[];
      topRight: number[];
      bottomLeft: number[];
      bottomRight: number[];
    };
  };
  isLocked: boolean;
  metadata: {
    viewUp: number[];
    toolName: string;
    sliceIndex: number;
    cameraPosition?: number[];
    viewPlaneNormal: number[];
    cameraFocalPoint: number[];
    referencedImageId: string;
    FrameOfReferenceUID: string;
  };
  toolName: string;
  isVisible: boolean;
  [key: string]: any;
};

type ConvertedAnnotation = {
  invalidated: false;
  highlighted: false;
  metadata: any;
  data: {
    label: string;
    handles: {
      points: number[][];
      textBox: any;
      activeHandleIndex: null;
    };
  };
  annotationUID: string;
  isLocked: boolean;
  isVisible: boolean;
};
function getHandlesPoints(toolName: string, points: number[][]): number[][] {
  /// Niewiadomo czy potrzeba - mozliwe do usuniecia
  switch (toolName) {
    case 'Length':
      return points.slice(0, 2);

    case 'RectangleROI':
    case 'Rectangle':
      return points.slice(0, 4);

    case 'CircleROI':
    case 'EllipseROI':
    case 'FreehandROI':
    case 'Ellipse':
      return points.slice(0, 2);

    case 'Polygon':
    case 'FreehandROI':
    case 'Freehand':
      return points;

    case 'Point':
      return points.slice(0, 1);

    default:
      return points;
  }
}

export function convertToCornerstoneFormat(annotations: AnnotationInput[]): ConvertedAnnotation[] {
  return annotations.map((ann, i) => {
    const metadata = ann.metadata;
    const { referencedImageId, FrameOfReferenceUID } = metadata;
    // const points = getHandlesPoints(ann.toolName, ann.points);
    const rawPoints = ann.points;
    return {
      invalidated: false,
      highlighted: false,
      metadata: {
        toolName: metadata.toolName ?? 'GenericTool',
        viewPlaneNormal: metadata.viewPlaneNormal,
        viewUp: metadata.viewUp,
        FrameOfReferenceUID: FrameOfReferenceUID,
        referencedImageId: referencedImageId,
        cameraFocalPoint: metadata.cameraFocalPoint,
        sliceIndex: metadata.sliceIndex ?? 0,
      },
      data: {
        label: ann.label ?? '',
        handles: {
          points: rawPoints,
          textBox: {
            hasMoved: ann.textBox?.hasMoved ?? false,
          },
          activeHandleIndex: null,
        },
      },
      annotationUID: ann.uid,
      isLocked: ann.isLocked,
      isVisible: ann.isVisible,
    };
  });
}
