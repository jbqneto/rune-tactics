import type { PlayerSeat, PvPHeroClass } from '../shared/pvpTypes';
import type { OpponentDraftInfo, PvPLobbyOverlay } from './PvPLobbyOverlay';

export interface SeatDraftSnapshot {
  displayName?: string;
  connected?: boolean;
  ready?: boolean;
  selectedClasses?: { length: number };
  actorType?: string;
}

export type SeatCollection =
  | Record<string, SeatDraftSnapshot | undefined>
  | { get(key: string): SeatDraftSnapshot | undefined };

export interface SyncPvPDraftParams {
  overlay: PvPLobbyOverlay | null;
  mySeat: PlayerSeat;
  draftClasses: PvPHeroClass[];
  phase: string | undefined;
  seats: SeatCollection | undefined;
  onOpponentUpdate: (info: { displayName?: string; actorType: string }) => void;
  onOpenMenu: (open: boolean) => void;
  /**
   * Sends the lineup shown in the draft to the server. The server only accepts
   * Ready once it holds three classes, so the preselected defaults must be published.
   */
  publishDraft?: (classes: PvPHeroClass[]) => void;
}

function getSeatEntry(seats: SeatCollection | undefined, key: PlayerSeat): SeatDraftSnapshot | undefined {
  if (!seats) return undefined;
  if (typeof (seats as { get?: unknown }).get === 'function') {
    return (seats as { get(k: string): SeatDraftSnapshot | undefined }).get(key);
  }
  return (seats as Record<string, SeatDraftSnapshot | undefined>)[key];
}

/**
 * Transitions the PvP overlay from waiting/lobby/none into draft on initial
 * CHARACTER_SELECTION / WAITING_FOR_READY updates, or refreshes the draft if already open.
 */
export function syncPvPDraftOverlay(params: SyncPvPDraftParams): boolean {
  const { overlay, mySeat, draftClasses, phase, seats, onOpponentUpdate, onOpenMenu, publishDraft } = params;
  if (phase !== 'CHARACTER_SELECTION' && phase !== 'WAITING_FOR_READY') {
    return false;
  }

  const oppSeatKey: PlayerSeat = mySeat === 'A' ? 'B' : 'A';
  const oppSeat = getSeatEntry(seats, oppSeatKey);
  const mySeatData = getSeatEntry(seats, mySeat);

  const isMyReady = !!mySeatData?.ready;
  const oppActorType = oppSeat?.actorType || 'human';
  const myActorType = mySeatData?.actorType || 'human';

  if (publishDraft && mySeatData && (mySeatData.selectedClasses?.length ?? 0) !== 3 && draftClasses.length === 3) {
    publishDraft([...draftClasses]);
  }

  onOpponentUpdate({ displayName: oppSeat?.displayName, actorType: oppActorType });

  const opponentInfo: OpponentDraftInfo = {
    displayName: oppSeat?.displayName || 'Opponent',
    connected: oppSeat?.connected ?? true,
    ready: !!oppSeat?.ready,
    selectedCount: oppSeat?.selectedClasses?.length ?? 0,
    actorType: oppActorType,
  };

  if (overlay && overlay.isInDraft()) {
    overlay.updateDraftState(draftClasses, isMyReady, opponentInfo, myActorType);
  } else {
    onOpenMenu(true);
    overlay?.showDraft(mySeat, draftClasses, isMyReady, opponentInfo, myActorType);
  }

  return true;
}
