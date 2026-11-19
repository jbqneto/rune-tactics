import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { UnitType } from '../shared/types';

interface ModelSpec {
  path: string;
  targetHeight: number;
  tintHex?: number;
  tintStrength?: number;
}

const MODEL_SPECS: Record<UnitType, ModelSpec> = {
  knight: { path: '/assets/models/Knight.glb', targetHeight: 1.02 },
  archer: { path: '/assets/models/Rogue_Hooded.glb', targetHeight: 0.98 },
  mage: { path: '/assets/models/Mage.glb', targetHeight: 1.05 },
  cleric: {
    path: '/assets/models/Rogue.glb',
    targetHeight: 0.96,
    tintHex: 0xfef08a,
    tintStrength: 0.38,
  },
  'melee-skeleton': { path: '/assets/models/Skeleton_Minion.glb', targetHeight: 0.96 },
  'skeleton-archer': { path: '/assets/models/Skeleton_Rogue.glb', targetHeight: 0.96 },
  'armored-skeleton': { path: '/assets/models/Skeleton_Warrior.glb', targetHeight: 1.16 },
  'cultist-mage': { path: '/assets/models/Skeleton_Mage.glb', targetHeight: 1.02 },
  'goblin-scout': {
    path: '/assets/models/Rogue.glb',
    targetHeight: 0.82,
    tintHex: 0x6b8e23,
    tintStrength: 0.55,
  },
  'goblin-stalker': {
    path: '/assets/models/Rogue_Hooded.glb',
    targetHeight: 0.85,
    tintHex: 0x365314,
    tintStrength: 0.58,
  },
  'skeleton-shieldbearer': {
    path: '/assets/models/Skeleton_Warrior.glb',
    targetHeight: 1.06,
    tintHex: 0x94a3b8,
    tintStrength: 0.35,
  },
  'necromancer-acolyte': {
    path: '/assets/models/Skeleton_Mage.glb',
    targetHeight: 0.98,
    tintHex: 0x10b981,
    tintStrength: 0.42,
  },
  'ashen-guardian': {
    path: '/assets/models/Skeleton_Warrior.glb',
    targetHeight: 1.42,
    tintHex: 0x7f1d1d,
    tintStrength: 0.45,
  },
};

const gltfLoader = new GLTFLoader();
const gltfCache = new Map<string, Promise<GLTF>>();

function loadGltfCached(path: string): Promise<GLTF> {
  let promise = gltfCache.get(path);
  if (!promise) {
    promise = gltfLoader.loadAsync(path);
    gltfCache.set(path, promise);
  }
  return promise;
}

export class CharacterVisualController {
  private readonly bodyGroup: THREE.Group;
  private readonly proceduralGroup: THREE.Group;
  private glbGroup: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions = new Map<string, THREE.AnimationAction>();
  private currentAction: THREE.AnimationAction | null = null;
  private currentClipName = 'Idle';
  private clonedMaterials: THREE.MeshStandardMaterial[] = [];
  private disposed = false;

  constructor(
    type: UnitType,
    bodyGroup: THREE.Group,
    proceduralGroup: THREE.Group,
    onLoaded?: () => void
  ) {
    this.bodyGroup = bodyGroup;
    this.proceduralGroup = proceduralGroup;

    const spec = MODEL_SPECS[type];
    loadGltfCached(spec.path)
      .then((gltf) => {
        if (this.disposed) return;
        this.mountGlb(gltf, spec);
        onLoaded?.();
      })
      .catch((err) => {
        if (!this.disposed) {
          console.warn(`[CharacterVisualController] Fallback procedural para ${type}:`, err);
        }
      });
  }

  get hasGlb(): boolean {
    return this.glbGroup !== null;
  }

  getMaterials(): THREE.MeshStandardMaterial[] {
    if (this.clonedMaterials.length > 0) {
      return this.clonedMaterials;
    }
    const mats: THREE.MeshStandardMaterial[] = [];
    this.proceduralGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
        mats.push(obj.material);
      }
    });
    return mats;
  }

  playClip(clipName: string, loop: boolean, timeScale = 1): void {
    if (!this.mixer) return;
    const action =
      this.actions.get(clipName) ??
      (clipName === 'Spellcast_Shoot' ? this.actions.get('1H_Melee_Attack_Slice_Diagonal') : undefined) ??
      this.actions.get('Idle');

    if (!action) return;

    if (this.currentAction === action && loop && this.currentClipName === clipName) {
      action.timeScale = timeScale;
      return;
    }

    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    action.clampWhenFinished = !loop;
    action.timeScale = timeScale;
    action.enabled = true;

    if (this.currentAction && this.currentAction !== action) {
      action.crossFadeFrom(this.currentAction, 0.08, false);
    }
    action.play();
    this.currentAction = action;
    this.currentClipName = clipName;
  }

  resetToIdle(): void {
    this.playClip('Idle', true, 1);
  }

  update(dt: number): void {
    this.mixer?.update(dt);
  }

  dispose(): void {
    this.disposed = true;
    this.mixer?.stopAllAction();
    this.mixer = null;
    this.actions.clear();
    if (this.glbGroup) {
      this.bodyGroup.remove(this.glbGroup);
      this.glbGroup = null;
    }
    for (const mat of this.clonedMaterials) {
      mat.dispose();
    }
    this.clonedMaterials = [];
  }

  private mountGlb(gltf: GLTF, spec: ModelSpec): void {
    const cloned = SkeletonUtils.clone(gltf.scene) as THREE.Group;

    // Normalize scale and ground pivot (y = 0)
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = size.y > 0.001 ? spec.targetHeight / size.y : 1;
    cloned.scale.setScalar(scale);

    // Recompute bounds after scaling to center X/Z and rest Y at 0
    const scaledBox = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    cloned.position.set(-center.x, -scaledBox.min.y, -center.z);

    const wrapper = new THREE.Group();
    wrapper.add(cloned);

    const tintColor = spec.tintHex !== undefined ? new THREE.Color(spec.tintHex) : null;
    const tintStrength = spec.tintStrength ?? 0;

    wrapper.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (Array.isArray(obj.material)) {
          obj.material = obj.material.map((m) => this.cloneMaterial(m, tintColor, tintStrength));
        } else if (obj.material) {
          obj.material = this.cloneMaterial(obj.material, tintColor, tintStrength);
        }
      }
    });

    this.mixer = new THREE.AnimationMixer(cloned);
    for (const clip of gltf.animations) {
      const action = this.mixer.clipAction(clip);
      this.actions.set(clip.name, action);
    }

    this.glbGroup = wrapper;
    this.proceduralGroup.visible = false;
    this.bodyGroup.add(wrapper);
    this.playClip('Idle', true, 1);
  }

  private cloneMaterial(
    source: THREE.Material,
    tintColor: THREE.Color | null,
    tintStrength: number
  ): THREE.Material {
    const cloned = source.clone();
    if (cloned instanceof THREE.MeshStandardMaterial) {
      if (tintColor && tintStrength > 0) {
        cloned.color.lerp(tintColor, tintStrength);
      }
      this.clonedMaterials.push(cloned);
    }
    return cloned;
  }
}
