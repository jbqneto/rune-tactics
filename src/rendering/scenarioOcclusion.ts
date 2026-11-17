export interface OcclusionItem {
  id: string;
  centerX: number;
  centerZ: number;
  halfWidth: number;
  halfDepth: number;
  height: number;
  category: 'tall' | 'mid';
}

export const OCCLUSION_BOARD_HALF_EXTENT = 6.2;
export const OCCLUSION_BASE_CUTOFF_Y = 0.45;
export const OCCLUSION_CAMERA_TAN_PITCH = 12.45 / 20.0; // 0.6225

function constrainAxisRange(
  minCoord: number,
  maxCoord: number,
  slope: number,
  boardHalf: number,
  yLow: number,
  yHigh: number,
): [number, number] | null {
  if (Math.abs(slope) < 1e-8) {
    if (minCoord > boardHalf || maxCoord < -boardHalf) {
      return null;
    }
    return [yLow, yHigh];
  }

  let nextLow = yLow;
  let nextHigh = yHigh;

  if (slope > 0) {
    nextLow = Math.max(nextLow, (-boardHalf - maxCoord) / slope);
    nextHigh = Math.min(nextHigh, (boardHalf - minCoord) / slope);
  } else {
    nextLow = Math.max(nextLow, (boardHalf - minCoord) / slope);
    nextHigh = Math.min(nextHigh, (-boardHalf - maxCoord) / slope);
  }

  if (nextLow > nextHigh) {
    return null;
  }

  return [nextLow, nextHigh];
}

/**
 * Returns true when a perimeter occluder sits on the camera side of the board
 * and its orthographic projection between y = 0.45 and y = height intersects
 * the playable board square [-6.2, +6.2]^2.
 */
export function isPerimeterOccluderBlocking(
  item: OcclusionItem,
  cameraAzimuthRad: number,
): boolean {
  if (item.height <= OCCLUSION_BASE_CUTOFF_Y) {
    return false;
  }

  const sinAz = Math.sin(cameraAzimuthRad);
  const cosAz = Math.cos(cameraAzimuthRad);

  // Never occlude structures on the side opposite the camera.
  const dot = item.centerX * sinAz + item.centerZ * cosAz;
  if (dot <= 0) {
    return false;
  }

  const dx = -sinAz / OCCLUSION_CAMERA_TAN_PITCH;
  const dz = -cosAz / OCCLUSION_CAMERA_TAN_PITCH;

  const xRange = constrainAxisRange(
    item.centerX - item.halfWidth,
    item.centerX + item.halfWidth,
    dx,
    OCCLUSION_BOARD_HALF_EXTENT,
    OCCLUSION_BASE_CUTOFF_Y,
    item.height,
  );
  if (!xRange) {
    return false;
  }

  const zRange = constrainAxisRange(
    item.centerZ - item.halfDepth,
    item.centerZ + item.halfDepth,
    dz,
    OCCLUSION_BOARD_HALF_EXTENT,
    xRange[0],
    xRange[1],
  );

  return zRange !== null;
}

export function computeOccludedIds(
  items: readonly OcclusionItem[],
  cameraAzimuthRad: number,
): Set<string> {
  const occluded = new Set<string>();
  for (const item of items) {
    if (isPerimeterOccluderBlocking(item, cameraAzimuthRad)) {
      occluded.add(item.id);
    }
  }
  return occluded;
}
