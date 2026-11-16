import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { resolvePickTarget } from '../src/input/InputManager';
import { CameraController } from '../src/rendering/CameraController';
import { archerAt, knightAt, meleeAt, unit } from './helpers';

describe('CameraController: órbita 360° e suavização', () => {
  const createCamera = () => new THREE.OrthographicCamera(-10, 10, 8.75, -8.75, 0.1, 100);

  it('inicializa com altura Y=18.5, raio R=hypot(17,17) e ângulo PI/4', () => {
    const cam = createCamera();
    const ctrl = new CameraController(cam);

    expect(ctrl.currentAzimuth).toBeCloseTo(Math.PI / 4);
    expect(ctrl.targetAzimuth).toBeCloseTo(Math.PI / 4);
    expect(cam.position.y).toBeCloseTo(18.5);
    expect(Math.hypot(cam.position.x, cam.position.z)).toBeCloseTo(Math.hypot(17, 17));
    expect(cam.top - cam.bottom).toBeCloseTo(17.5);
  });

  it('rotaciona continuamente em 360° preservando Y, raio horizontal, lookAt e frustumSize', () => {
    const cam = createCamera();
    const ctrl = new CameraController(cam);
    const initialZoomSpan = cam.top - cam.bottom;

    ctrl.beginRightDrag(100, 100);
    // Arraste grande (~1000px) para ultrapassar 2π radianos sem clamping
    ctrl.moveRightDrag(1100, 120);
    expect(ctrl.isDragging).toBe(true);
    ctrl.endRightDrag();
    expect(ctrl.wasRightDrag).toBe(true);

    // Vários passos de update(dt) convergem currentAzimuth para targetAzimuth
    for (let i = 0; i < 60; i++) {
      ctrl.update(1 / 60);
    }

    expect(Math.abs(ctrl.targetAzimuth - Math.PI / 4)).toBeGreaterThan(Math.PI * 2);
    expect(ctrl.currentAzimuth).toBeCloseTo(ctrl.targetAzimuth, 2);
    expect(cam.position.y).toBeCloseTo(18.5);
    expect(Math.hypot(cam.position.x, cam.position.z)).toBeCloseTo(Math.hypot(17, 17));
    expect(cam.top - cam.bottom).toBeCloseTo(initialZoomSpan);

    // Verifica que a câmera continua olhando para target (0, 0.25, 0)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
    const toTarget = ctrl.target.clone().sub(cam.position).normalize();
    expect(forward.distanceTo(toTarget)).toBeLessThan(1e-5);
  });

  it('suavização interpola gradualmente e diferencia clique direito parado de arraste', () => {
    const cam = createCamera();
    const ctrl = new CameraController(cam);

    // Clique parado (< 4px)
    ctrl.beginRightDrag(50, 50);
    ctrl.moveRightDrag(52, 51);
    expect(ctrl.isDragging).toBe(false);
    ctrl.endRightDrag();
    expect(ctrl.consumeRightDrag()).toBe(false);

    // Arraste real (>= 4px)
    ctrl.beginRightDrag(50, 50);
    ctrl.moveRightDrag(250, 50);
    expect(ctrl.isDragging).toBe(true);
    ctrl.endRightDrag();
    expect(ctrl.consumeRightDrag()).toBe(true);
    expect(ctrl.consumeRightDrag()).toBe(false);

    const before = ctrl.currentAzimuth;
    ctrl.update(0.016);
    expect(ctrl.currentAzimuth).not.toBe(before);
    expect(Math.abs(ctrl.currentAzimuth - ctrl.targetAzimuth)).toBeLessThan(
      Math.abs(before - ctrl.targetAzimuth)
    );
  });
});

describe('resolvePickTarget: seleção de células encobertas e oclusão por obstáculos', () => {
  const knight = unit(knightAt(4, 1));
  const archer = unit(archerAt(2, 0));
  const enemy = unit(meleeAt(4, 2));
  const units = [knight, archer, enemy];

  it('no modo default, seleciona célula livre mesmo encoberta pelo modelo de uma unidade', () => {
    const res = resolvePickTarget(
      {
        unitHits: [{ distance: 5, userData: { unitId: 'knight-1' } }],
        obstacleHits: [],
        tileHits: [{ distance: 7, userData: { gridCoord: { x: 4, y: 2 } } }],
      },
      units,
      {
        mode: 'default',
        canBasicAttack: true,
        attackableIds: new Set(['melee-skeleton-1']),
      }
    );

    expect(res).toEqual({ unitId: null, cell: { x: 4, y: 2 } });
  });

  it('no modo default, seleciona inimigo atacável clicado diretamente se não houver obstáculo na frente', () => {
    const res = resolvePickTarget(
      {
        unitHits: [{ distance: 5, userData: { unitId: 'melee-skeleton-1' } }],
        obstacleHits: [],
        tileHits: [{ distance: 7, userData: { gridCoord: { x: 4, y: 1 } } }],
      },
      units,
      {
        mode: 'default',
        canBasicAttack: true,
        attackableIds: new Set(['melee-skeleton-1']),
      }
    );

    expect(res).toEqual({ unitId: 'melee-skeleton-1', cell: enemy.pos });
  });

  it('obstáculo sólido na frente bloqueia seleção da célula ou unidade atrás dele', () => {
    const res = resolvePickTarget(
      {
        unitHits: [{ distance: 6, userData: { unitId: 'melee-skeleton-1' } }],
        obstacleHits: [{ distance: 4 }],
        tileHits: [{ distance: 7, userData: { gridCoord: { x: 4, y: 2 } } }],
      },
      units,
      {
        mode: 'default',
        canBasicAttack: true,
        attackableIds: new Set(['melee-skeleton-1']),
      }
    );

    expect(res).toEqual({ unitId: null, cell: null });
  });

  it('no modo attack, prioriza inimigo atacável ignorando aliado na frente', () => {
    const res = resolvePickTarget(
      {
        unitHits: [
          { distance: 4, userData: { unitId: 'knight-1' } },
          { distance: 6, userData: { unitId: 'melee-skeleton-1' } },
        ],
        obstacleHits: [],
        tileHits: [{ distance: 8, userData: { gridCoord: { x: 4, y: 1 } } }],
      },
      units,
      {
        mode: 'attack',
        canBasicAttack: true,
        attackableIds: new Set(['melee-skeleton-1']),
      }
    );

    expect(res).toEqual({ unitId: 'melee-skeleton-1', cell: enemy.pos });
  });

  it('no modo skill de cura, prioriza aliado curável ignorando inimigo na frente', () => {
    const res = resolvePickTarget(
      {
        unitHits: [
          { distance: 4, userData: { unitId: 'melee-skeleton-1' } },
          { distance: 6, userData: { unitId: 'knight-1' } },
        ],
        obstacleHits: [],
        tileHits: [{ distance: 8, userData: { gridCoord: { x: 4, y: 2 } } }],
      },
      units,
      {
        mode: 'skill',
        canBasicAttack: true,
        attackableIds: new Set(),
        healTargetUnitIds: new Set(['knight-1']),
      }
    );

    expect(res).toEqual({ unitId: 'knight-1', cell: knight.pos });
  });
});
