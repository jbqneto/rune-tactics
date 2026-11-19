# Rune Tactics — PvP draft transition bugfix

## Coordinator context

- Repository: `/home/jbqneto/Documentos/development/projects/games/rune-tactics`
- Bugfix branch: `bugfix/pvp-draft-transition` (already created; do not create/switch branches).
- QA evidence: `.coordination/qa-evidence-v6/`
- QA report: `t18` browser QA, captured in the agent history. It reports that after Seat B joins, Colyseus reaches `CHARACTER_SELECTION` and emits lobby/state updates, but Seat A stays on “Waiting for Player B to join...” and Seat B stays on “Connecting to match...”. Same failure also occurred when an MCP agent joined.
- Root cause confirmed by source inspection: in `src/main.ts`, both `onLobbyState` and `onRoomStateChange` treat any open overlay as if it were already showing the draft and call `updateDraftState`. `PvPLobbyOverlay.isOpen()` is true for any non-`none` view, including `waiting`/`lobby`; `updateDraftState()` returns unless `currentView === 'draft'`. Thus the initial transition to draft is silently discarded.
- Project overview: browser-based TypeScript/Three.js turn-based tactical RPG; V4 PvE campaign/quick battle, V5 Colyseus-authoritative online 3v3 PvP, V6 MCP server/AI matches. The UI is in `src/ui`, client/network composition is in `src/main.ts` and `src/network`, authoritative PvP rules live in `src/game/pvp` and `server/`.
- The worktree is already very dirty with existing V5/V6 implementation, docs, generated files, and untracked assets. Do not reset, revert, stage, or overwrite unrelated work. Touch only files required by the assigned task. Do not commit, push, deploy, or alter production data.

## Task 1 — t8 (implementation owner)

Implement the smallest robust fix for the failed transition from waiting/lobby to hero draft on both human-vs-human and human-vs-MCP joins.

1. Read `AGENTS.md` and the relevant PvP docs: `docs/multiplayer-architecture.md`, `docs/colyseus-integration.md`, `docs/game-command-contracts.md`, `docs/pvp-game-design.md`, `docs/mcp-v6-architecture.md`; obey their layer boundaries.
2. Verify the event ordering/call paths in `src/main.ts` and view-state behavior in `src/ui/PvPLobbyOverlay.ts`. Do not broaden scope into server/rules changes unless evidence disproves the confirmed UI cause.
3. Follow TDD: add a regression test that fails for the initial transition from `waiting` and/or `lobby` to draft, run it and confirm the expected failure, then implement the minimal fix. Cover both room-state and lobby-state pathways if feasible; ensure repeated updates while already in draft still update the draft without duplicate or stale state.
4. Run the focused regression test, `npm run typecheck`, `npm test`, and `npm run build` (or report precisely which are blocked). Do not claim browser QA; that is assigned separately.
5. Report exact files changed, RED/GREEN test output, checks run and results, and any remaining risk. Leave all unrelated dirty files untouched; no commit/push.

## Task 2 — t16 (independent read-only reviewer)

Independently validate the reported root cause and identify the minimal behavioral acceptance criteria and best regression-test seam. Do not edit any files, stage, or commit. Inspect current source and report concise evidence with file/line references. The core acceptance condition is that a `CHARACTER_SELECTION`/`WAITING_FOR_READY` update must transition an overlay currently in `waiting` or `lobby` into draft, while subsequent updates in draft refresh its data. Also note event ordering/race concerns if present. Do not prescribe unrelated refactors.

## Task 3 — t18 (browser QA; dispatch only after Task 1 is implemented and checked)

Using the local/test environment only and two isolated browser contexts, re-run the invite-code/direct-link multiplayer flow on the implementation branch. First capture a QA baseline with `git status --short` and `git diff --stat`; the worktree already has unrelated pre-existing changes. Verify Seat A and Seat B both transition from waiting/connecting into the draft, can select three unique classes, receive ready-state updates, and proceed to match start if possible. Also test MCP-agent join if the local MCP harness is available. Record exact PASS/FAIL/BLOCKED counts, browser execution mode, steps, console/network errors, and evidence paths that actually exist. Do not edit code, commit/push, or test production. Mark downstream gameplay checks BLOCKED if draft/ready/start still fails.

## QA result and Task 4 — follow-up blocker (t8)

The first post-fix browser run (Chrome CDP, two isolated browser contexts) verified the original transition on Seat A and Seat B and draft reordering. It then found a separate protocol-contract blocker before ready/start: `ColyseusMatchClient.selectClasses()` sends `{ classes }` while `PvPRoom.selectClasses()` expects a raw array; `ColyseusMatchClient.setReady()` sends `{ ready }` while `PvPRoom.setReady()` expects a raw boolean. This is independently confirmed in source and explains why server state never records the picks/readiness. Evidence/report: `.coordination/bugfix-pvp-draft-transition/qa-evidence/` and the t18 terminal report. QA marked match launch, turns, and MCP flow BLOCKED by this issue; do not treat the old `qa_report.json` as final because its initial counts are stale.

Implement the smallest client/server contract correction:

1. Read `AGENTS.md`, `docs/colyseus-integration.md`, and inspect both adapter and server message handlers plus existing integration tests.
2. Keep one explicit payload contract across `ColyseusMatchClient` and `PvPRoom`; prefer changing only the client send shapes to match current server expectations unless investigation finds another public contract requires compatibility.
3. Use TDD. Add tests proving `selectClasses` sends the expected 3-class array and `setReady` sends a boolean, and/or an end-to-end test through `ColyseusMatchClient` showing both seats draft, become ready, and receive `matchInit`. Confirm the regression test fails for the current object payloads before implementing.
4. Run relevant client/server tests, `npm run typecheck:all`, `npm run test:all`, and `npm run build:all` if feasible. Preserve the existing dirty worktree; no reset, stage, commit, push, production data, or unrelated cleanup.
5. Report exact files, RED/GREEN results, verification output, and any residual risk. After implementation, t18 should rerun only draft selection → ready sync → match start in two isolated browser contexts, plus MCP join if feasible; update final report/counts and mark downstream checks accurately.

## Task 5 — t18 (focused browser verification after Task 4)

After t8 reports Task 4 complete and its client/server checks pass, re-run the local browser flow with two isolated contexts. Confirm both seats transition into draft, submit three unique classes each, observe the server move to `WAITING_FOR_READY`, toggle Ready on both, and confirm `matchInit` / `IN_PROGRESS` appears in both tabs. Do not repeat unrelated menu exploration. If available, validate MCP-agent auto-draft/readiness against a human seat; otherwise mark that path BLOCKED. Do not edit source/tests. Update `.coordination/bugfix-pvp-draft-transition/qa_report.json` to reflect the final run (do not leave the earlier stale counts); write concise outcomes, exact PASS/FAIL/BLOCKED counts that reconcile to the cases, browser mode, console/network errors, verified evidence paths, and before/after worktree status. No code fixes, stage, commit, push, or production testing.
