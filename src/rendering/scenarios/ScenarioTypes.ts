import * as THREE from 'three';
import type { GridCoord, MapConfig, ObstacleDef, ObstacleKind } from '../../shared/types';

export interface TileRayUserData {
  kind: 'tile';
  gridCoord: GridCoord;
}

export interface ObstacleRayUserData {
  kind: 'obstacle';
  obstacleKind: ObstacleKind;
  gridCoord: GridCoord;
}

/**
 * Axis-aligned world-space bounding volume used by `scenarioOcclusion.ts`
 * to decide whether a tall perimeter structure blocks the 360° camera view.
 */
export interface OccluderBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
}

export interface OccludingStructure {
  id: string;
  bounds: OccluderBounds;
  upperGroup: THREE.Object3D;
}

export type AnimatedScenarioKind = 'flame' | 'water' | 'waterfall' | 'mist' | 'custom';

export interface AnimatedScenarioObject {
  kind: AnimatedScenarioKind;
  update: (dt: number, elapsed: number) => void;
}

export interface ScenarioPointLightPreset {
  position: [number, number, number];
  color: number;
  intensity: number;
  distance?: number;
  decay?: number;
  flicker?: boolean;
}

export interface ScenarioAtmospherePreset {
  backgroundColor: number;
  fogColor: number;
  fogDensity: number;
  ambientColor: number;
  ambientIntensity: number;
  hemiSkyColor: number;
  hemiGroundColor: number;
  hemiIntensity: number;
  dirLightColor: number;
  dirLightIntensity: number;
  dirLightPosition?: [number, number, number];
  rimLightColor: number;
  rimLightIntensity: number;
  pointLights: ScenarioPointLightPreset[];
}

export interface ScenarioBuildOptions {
  mapId: string;
  gridSize: number;
  obstacleDefs: ObstacleDef[];
  theme?: MapConfig['theme'];
  bridgeCells?: GridCoord[];
  seed?: number;
}

export interface ModularStructureResult {
  root: THREE.Group;
  baseGroup: THREE.Group;
  upperGroup: THREE.Group;
  bounds: OccluderBounds;
  animated: AnimatedScenarioObject[];
}

export interface ScenarioBuildResult {
  group: THREE.Group;
  tileMeshes: THREE.Mesh[];
  obstacleMeshes: THREE.Mesh[];
  occluders: OccludingStructure[];
  animatedObjects: AnimatedScenarioObject[];
  atmosphere: ScenarioAtmospherePreset;
  update: (dt: number, elapsed: number) => void;
  dispose: () => void;
}
