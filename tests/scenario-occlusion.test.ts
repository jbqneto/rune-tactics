import { describe, expect, it } from 'vitest';
import {
  computeOccludedIds,
  isPerimeterOccluderBlocking,
  type OcclusionItem,
} from '../src/rendering/scenarioOcclusion';

const deg = (degrees: number): number => (degrees * Math.PI) / 180;

describe('scenarioOcclusion', () => {
  const northTall: OcclusionItem = {
    id: 'north-gate',
    centerX: 0,
    centerZ: -7.1,
    halfWidth: 2.2,
    halfDepth: 0.6,
    height: 3.4,
    category: 'tall',
  };

  const southTall: OcclusionItem = {
    id: 'south-arch',
    centerX: 0,
    centerZ: 7.1,
    halfWidth: 2.0,
    halfDepth: 0.6,
    height: 3.0,
    category: 'tall',
  };

  const eastTall: OcclusionItem = {
    id: 'east-wall',
    centerX: 7.1,
    centerZ: 0,
    halfWidth: 0.6,
    halfDepth: 2.0,
    height: 2.8,
    category: 'tall',
  };

  const westTall: OcclusionItem = {
    id: 'west-tower',
    centerX: -7.1,
    centerZ: 0,
    halfWidth: 0.8,
    halfDepth: 0.8,
    height: 4.2,
    category: 'tall',
  };

  const cardinalItems = [northTall, southTall, eastTall, westTall];

  it.each([
    { angleDeg: 0, expectedOccluded: ['south-arch'], expectedVisible: ['north-gate', 'east-wall', 'west-tower'] },
    { angleDeg: 90, expectedOccluded: ['east-wall'], expectedVisible: ['west-tower', 'north-gate', 'south-arch'] },
    { angleDeg: 180, expectedOccluded: ['north-gate'], expectedVisible: ['south-arch', 'east-wall', 'west-tower'] },
    { angleDeg: 270, expectedOccluded: ['west-tower'], expectedVisible: ['east-wall', 'north-gate', 'south-arch'] },
  ])(
    'occludes only the camera-side tall structure at azimuth $angleDeg deg',
    ({ angleDeg, expectedOccluded, expectedVisible }) => {
      const occluded = computeOccludedIds(cardinalItems, deg(angleDeg));

      for (const id of expectedOccluded) {
        expect(occluded.has(id)).toBe(true);
      }
      for (const id of expectedVisible) {
        expect(occluded.has(id)).toBe(false);
      }
    },
  );

  it('never occludes low pieces with height <= 0.45 even on the camera side', () => {
    const lowCurbAtBoundary: OcclusionItem = {
      id: 'low-curb',
      centerX: 0,
      centerZ: 6.5,
      halfWidth: 5.0,
      halfDepth: 0.3,
      height: 0.45,
      category: 'mid',
    };
    const flatStep: OcclusionItem = {
      id: 'flat-step',
      centerX: 0,
      centerZ: 6.8,
      halfWidth: 1.5,
      halfDepth: 0.4,
      height: 0.25,
      category: 'mid',
    };

    for (const angle of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const occluded = computeOccludedIds([lowCurbAtBoundary, flatStep], deg(angle));
      expect(occluded.size).toBe(0);
    }
  });

  it('occludes mid-height perimeter walls on the camera side when their projection crosses the board', () => {
    const midWall: OcclusionItem = {
      id: 'south-mid-wall',
      centerX: 0,
      centerZ: 6.8,
      halfWidth: 3.0,
      halfDepth: 0.3,
      height: 1.2,
      category: 'mid',
    };

    expect(isPerimeterOccluderBlocking(midWall, deg(0))).toBe(true);
    expect(isPerimeterOccluderBlocking(midWall, deg(180))).toBe(false);
  });

  it('does not occlude distant structures on the camera side whose projection misses the board', () => {
    const distantRidge: OcclusionItem = {
      id: 'distant-ridge',
      centerX: 0,
      centerZ: 15.0,
      halfWidth: 4.0,
      halfDepth: 1.0,
      height: 3.0,
      category: 'tall',
    };

    // At height 3.0, projection travels 3.0 / 0.6225 ~= 4.82 units toward -Z:
    // minZ (14.0) - 4.82 = 9.18 > 6.2, so it never overlaps [-6.2, +6.2]^2.
    expect(isPerimeterOccluderBlocking(distantRidge, deg(0))).toBe(false);
  });

  it('does not occlude structures laterally outside the board corridor', () => {
    const farSidePillar: OcclusionItem = {
      id: 'far-side-pillar',
      centerX: 9.0,
      centerZ: 7.0,
      halfWidth: 0.5,
      halfDepth: 0.5,
      height: 3.5,
      category: 'tall',
    };

    expect(isPerimeterOccluderBlocking(farSidePillar, deg(0))).toBe(false);
  });

  it('handles diagonal azimuths (45 deg) accurately for corner structures', () => {
    const seCornerTower: OcclusionItem = {
      id: 'se-corner-tower',
      centerX: 6.9,
      centerZ: 6.9,
      halfWidth: 0.8,
      halfDepth: 0.8,
      height: 3.6,
      category: 'tall',
    };
    const nwCornerTower: OcclusionItem = {
      id: 'nw-corner-tower',
      centerX: -6.9,
      centerZ: -6.9,
      halfWidth: 0.8,
      halfDepth: 0.8,
      height: 3.6,
      category: 'tall',
    };

    // Camera at 45 deg is in the (+X, +Z) quadrant looking toward (-X, -Z).
    const occluded = computeOccludedIds([seCornerTower, nwCornerTower], deg(45));
    expect(occluded.has('se-corner-tower')).toBe(true);
    expect(occluded.has('nw-corner-tower')).toBe(false);
  });
});
