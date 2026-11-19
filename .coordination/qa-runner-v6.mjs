import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WebSocket = require('/home/jbqneto/Documentos/development/projects/games/rune-tactics/server/node_modules/ws');

const EVIDENCE_DIR = '/home/jbqneto/Documentos/development/projects/games/rune-tactics/.coordination/qa-evidence-v6';
fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.networkErrors = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.method === 'Runtime.consoleAPICalled') {
          const text = msg.params.args.map(a => a.value ?? a.description ?? JSON.stringify(a)).join(' ');
          this.consoleLogs.push({ type: msg.params.type, text });
        } else if (msg.method === 'Network.responseReceived') {
          const status = msg.params.response.status;
          if (status >= 400) {
            this.networkErrors.push({ url: msg.params.response.url, status });
          }
        } else if (msg.method === 'Network.loadingFailed') {
          this.networkErrors.push({ url: msg.params.requestId, errorText: msg.params.errorText });
        }

        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
      });
    });
  }

  send(method, params = {}, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => {
        this.callbacks.delete(id);
        reject(new Error(`CDP command ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.callbacks.set(id, {
        resolve: (res) => { clearTimeout(timer); resolve(res); },
        reject: (err) => { clearTimeout(timer); reject(err); }
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await delay(1500);
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result ? res.result.value : undefined;
  }

  async waitForSelector(selector, timeoutMs = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const exists = await this.evaluate(`!!document.querySelector('${selector}')`);
        if (exists) return true;
      } catch (err) {
        // ignore navigation/context destruction errors
      }
      await delay(300);
    }
    throw new Error(`Timeout waiting for selector: ${selector}`);
  }

  async waitForFunction(fnStr, timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const res = await this.evaluate(`(${fnStr})()`);
      if (res) return res;
      await delay(200);
    }
    throw new Error(`Timeout waiting for function: ${fnStr}`);
  }

  async click(selector) {
    await this.waitForSelector(selector);
    const success = await this.evaluate(`
      (() => {
        const el = document.querySelector('${selector}');
        if (!el) return false;
        el.click();
        return true;
      })()
    `);
    if (!success) throw new Error(`Could not click selector: ${selector}`);
  }

  async type(selector, text) {
    await this.waitForSelector(selector);
    await this.evaluate(`
      (() => {
        const el = document.querySelector('${selector}');
        if (!el) return false;
        el.value = ${JSON.stringify(text)};
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()
    `);
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const fullPath = path.join(EVIDENCE_DIR, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`[Screenshot] Saved ${filename} (${buffer.length} bytes)`);
    return fullPath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runQA() {
  console.log('=== Starting Rune Tactics V6 Manual Browser QA ===');
  const results = [];

  const versionInfo = await getJson('http://127.0.0.1:9223/json/version');
  const browserWs = new WebSocket(versionInfo.webSocketDebuggerUrl);
  await new Promise(r => browserWs.on('open', r));

  let browserContextAId = null;
  let browserContextBId = null;
  let targetAId = null;
  let targetBId = null;

  async function callBrowser(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 1000000);
      const onMsg = (data) => {
        const m = JSON.parse(data.toString());
        if (m.id === id) {
          browserWs.off('message', onMsg);
          if (m.error) reject(new Error(m.error.message));
          else resolve(m.result);
        }
      };
      browserWs.on('message', onMsg);
      browserWs.send(JSON.stringify({ id, method, params }));
    });
  }

  // Create Context A
  const ctxA = await callBrowser('Target.createBrowserContext');
  browserContextAId = ctxA.browserContextId;
  const tgtA = await callBrowser('Target.createTarget', { url: 'about:blank', browserContextId: browserContextAId });
  targetAId = tgtA.targetId;

  // Create Context B
  const ctxB = await callBrowser('Target.createBrowserContext');
  browserContextBId = ctxB.browserContextId;
  const tgtB = await callBrowser('Target.createTarget', { url: 'about:blank', browserContextId: browserContextBId });
  targetBId = tgtB.targetId;

  const pageA = new CdpClient(`ws://127.0.0.1:9223/devtools/page/${targetAId}`);
  await pageA.connect();
  await pageA.send('Page.enable');
  await pageA.send('Runtime.enable');
  await pageA.send('Console.enable');
  await pageA.send('Network.enable');
  await pageA.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  const pageB = new CdpClient(`ws://127.0.0.1:9223/devtools/page/${targetBId}`);
  await pageB.connect();
  await pageB.send('Page.enable');
  await pageB.send('Runtime.enable');
  await pageB.send('Console.enable');
  await pageB.send('Network.enable');
  await pageB.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // -------------------------------------------------------------
  // Test 1: UI Load & Main Menu
  // -------------------------------------------------------------
  console.log('\n--- Test 1: Loading Frontend UI & Main Menu ---');
  await pageA.navigate('http://localhost:5173');
  await pageA.waitForSelector('#game-canvas');
  await pageA.waitForSelector('#btn-pvp-battle');
  await delay(1000);

  const titleA = await pageA.evaluate('document.title');
  const btnPvpText = await pageA.evaluate(`document.querySelector('#btn-pvp-battle .hud-menu-btn-title').textContent`);
  const btnPvpDesc = await pageA.evaluate(`document.querySelector('#btn-pvp-battle .hud-menu-btn-desc').textContent`);

  console.log(`Document title: "${titleA}"`);
  console.log(`PvP button title: "${btnPvpText}" | desc: "${btnPvpDesc}"`);

  await pageA.screenshot('01_main_menu.png');

  const test1Pass = titleA.includes('Rune Tactics') && btnPvpText.includes('Multiplayer PvP (3v3)');
  results.push({
    testId: 'TC-01',
    description: 'Initial UI Load & Main Menu PvP Button',
    status: test1Pass ? 'PASS' : 'FAIL',
    details: `Loaded title "${titleA}", button "${btnPvpText}"`,
  });

  // -------------------------------------------------------------
  // Test 2: Create Room & Invite Code & MCP Tip (Tab A - Alice)
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Create PvP Room & Verify Invite Code + MCP Tip ---');
  await pageA.click('#btn-pvp-battle');
  await pageA.waitForSelector('#pvp-player-name');
  await pageA.type('#pvp-player-name', 'Alice (Human)');
  await delay(300);
  await pageA.click('#btn-pvp-create-room');

  await pageA.waitForSelector('.hud-pvp-waiting-modal');
  await pageA.waitForSelector('.hud-pvp-code-badge');
  const inviteCode = await pageA.evaluate(`document.querySelector('.hud-pvp-code-badge').textContent.trim()`);
  console.log(`Room created with invite code: ${inviteCode}`);

  const mcpTipPresent = await pageA.evaluate(`!!document.querySelector('.hud-pvp-mcp-tip')`);
  const mcpTipText = await pageA.evaluate(`document.querySelector('.hud-pvp-mcp-tip')?.textContent?.trim() || ''`);
  console.log(`MCP tip present: ${mcpTipPresent}`);
  console.log(`MCP tip text: "${mcpTipText}"`);

  await pageA.screenshot('02_room_created_waiting_mcp_tip.png');

  const codeValid = /^RT-[A-HJ-NP-Z2-9]{6}$/.test(inviteCode);
  const test2Pass = codeValid && mcpTipPresent && mcpTipText.includes('join_pvp_room');
  results.push({
    testId: 'TC-02',
    description: 'Room Creation, RT-XXXXXX Code & MCP Agent Tip Display',
    status: test2Pass ? 'PASS' : 'FAIL',
    details: `Invite code: ${inviteCode} (valid: ${codeValid}), MCP tip present: ${mcpTipPresent}`,
  });

  // -------------------------------------------------------------
  // Test 3: Join via URL parameter ?pvp=RT-XXXXXX in Tab B (Bob)
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Join Room via ?pvp=RT-XXXXXX URL Parameter ---');
  await pageB.navigate(`http://localhost:5173/?pvp=${inviteCode}`);
  await pageB.waitForSelector('#pvp-invite-code');

  const populatedCode = await pageB.evaluate(`document.querySelector('#pvp-invite-code').value.trim()`);
  console.log(`Tab B pre-populated invite code from URL: "${populatedCode}"`);

  await pageB.type('#pvp-player-name', 'Bob (Human)');
  await delay(300);
  await pageB.click('#btn-pvp-join-room');

  // Both tabs should transition to Draft screen
  await pageA.waitForSelector('.hud-pvp-draft-modal', 10000);
  await pageB.waitForSelector('.hud-pvp-draft-modal', 10000);
  console.log('Both Tab A and Tab B entered 3v3 Draft Screen!');

  const test3Pass = populatedCode === inviteCode;
  results.push({
    testId: 'TC-03',
    description: 'Join Room via URL Parameter (?pvp=RT-XXXXXX)',
    status: test3Pass ? 'PASS' : 'FAIL',
    details: `URL param populated code "${populatedCode}" matching "${inviteCode}" and joined successfully`,
  });

  // -------------------------------------------------------------
  // Test 4: 3v3 Draft, Slots & Opponent Details
  // -------------------------------------------------------------
  console.log('\n--- Test 4: 3v3 Draft & Activation Sequence Preview ---');
  await delay(800);

  const tabASeatTag = await pageA.evaluate(`document.querySelector('.hud-pvp-seat-tag').textContent.trim()`);
  const tabAOpponentText = await pageA.evaluate(`document.querySelector('.hud-pvp-opponent-status').textContent.trim()`);
  const tabAMcpBadge = await pageA.evaluate(`!!document.querySelector('.hud-pvp-opponent-status .hud-mcp-badge')`);

  const tabBSeatTag = await pageB.evaluate(`document.querySelector('.hud-pvp-seat-tag').textContent.trim()`);
  const tabBOpponentText = await pageB.evaluate(`document.querySelector('.hud-pvp-opponent-status').textContent.trim()`);
  const tabBMcpBadge = await pageB.evaluate(`!!document.querySelector('.hud-pvp-opponent-status .hud-mcp-badge')`);

  console.log(`Tab A Seat Tag: "${tabASeatTag}" | Opponent: "${tabAOpponentText}" | MCP badge: ${tabAMcpBadge}`);
  console.log(`Tab B Seat Tag: "${tabBSeatTag}" | Opponent: "${tabBOpponentText}" | MCP badge: ${tabBMcpBadge}`);

  await pageA.screenshot('03_draft_tab_a_human.png');
  await pageB.screenshot('04_draft_tab_b_human.png');

  // Verify pills
  const pillsCountA = await pageA.evaluate(`document.querySelectorAll('.hud-pvp-preview-pill').length`);
  console.log(`Tab A activation sequence pills count: ${pillsCountA} (expected 6)`);

  // Both lock in Ready
  await pageA.click('#btn-pvp-toggle-ready');
  await delay(500);

  const tabBSeesReady = await pageB.waitForFunction(() => {
    return document.querySelector('.hud-pvp-ready-badge')?.textContent?.includes('Ready');
  }, 5000);
  console.log(`Tab B observes Tab A ready state: ${tabBSeesReady}`);

  await pageB.click('#btn-pvp-toggle-ready');

  const test4Pass = tabASeatTag.includes('Seat A') &&
                    tabBSeatTag.includes('Seat B') &&
                    tabAOpponentText.includes('Bob (Human)') &&
                    tabBOpponentText.includes('Alice (Human)') &&
                    !tabAMcpBadge && !tabBMcpBadge && // no MCP badge for human opponents
                    pillsCountA === 6;

  results.push({
    testId: 'TC-04',
    description: '3v3 Draft Screen, Slot Ordering & Readiness Synchronization',
    status: test4Pass ? 'PASS' : 'FAIL',
    details: `Tab A (${tabASeatTag}) vs Tab B (${tabBSeatTag}), 6 sequence pills, mutual ready sync`,
  });

  // -------------------------------------------------------------
  // Test 5: 3D Match Launch, 180° Camera & In-Match HUD
  // -------------------------------------------------------------
  console.log('\n--- Test 5: 3D Match Launch & 180° Camera Perspective ---');
  // Wait for board and match active
  await pageA.waitForSelector('#hud-phase-badge', 10000);
  await pageB.waitForSelector('#hud-phase-badge', 10000);
  await delay(1200);

  const tabAPhase = await pageA.evaluate(`document.querySelector('#hud-phase-badge').textContent.trim()`);
  const tabBPhase = await pageB.evaluate(`document.querySelector('#hud-phase-badge').textContent.trim()`);
  const tabAForfeit = await pageA.evaluate(`document.querySelector('#btn-reset').textContent.trim()`);
  const tabBForfeit = await pageB.evaluate(`document.querySelector('#btn-reset').textContent.trim()`);
  const tabAEnemyTitle = await pageA.evaluate(`document.querySelector('#hud-enemies-title').textContent.trim()`);
  const tabBEnemyTitle = await pageB.evaluate(`document.querySelector('#hud-enemies-title').textContent.trim()`);

  // Check camera azimuths directly from sceneManager
  // Wait: sceneManager is in closure of main.ts, but we can verify visual perspective via screenshot
  console.log(`Tab A Phase: "${tabAPhase}" | Enemy Title: "${tabAEnemyTitle}" | Reset Btn: "${tabAForfeit}"`);
  console.log(`Tab B Phase: "${tabBPhase}" | Enemy Title: "${tabBEnemyTitle}" | Reset Btn: "${tabBForfeit}"`);

  await pageA.screenshot('05_match_tab_a_turn1.png');
  await pageB.screenshot('06_match_tab_b_turn1.png');

  const test5Pass = tabAPhase === 'Your Turn' &&
                    tabBPhase === 'Opponent Turn' &&
                    tabAForfeit === 'Forfeit' &&
                    tabBForfeit === 'Forfeit' &&
                    tabAEnemyTitle.includes('Opponent');

  results.push({
    testId: 'TC-05',
    description: '3D Match Launch, Relative HUD ("Your Turn" vs "Opponent Turn") & Forfeit Button',
    status: test5Pass ? 'PASS' : 'FAIL',
    details: `Tab A: "${tabAPhase}", Tab B: "${tabBPhase}", Action Button: "${tabAForfeit}"`,
  });

  // -------------------------------------------------------------
  // Test 6: Turn Progression & State Sync across Two Tabs
  // -------------------------------------------------------------
  console.log('\n--- Test 6: Turn Progression & State Sync ---');
  // Tab A active unit performs Defend
  await pageA.click('#btn-defend');
  await delay(600);

  const tabAUnitGuarding = await pageA.evaluate(`
    !!document.querySelector('.hud-unit-badge--guard')
  `);
  console.log(`Tab A unit entered defensive guard stance: ${tabAUnitGuarding}`);

  // Tab A ends turn
  await pageA.click('#btn-end-turn');
  await delay(1000);

  // Tab B should now have "Your Turn"
  const tabBPhaseAfter = await pageB.evaluate(`document.querySelector('#hud-phase-badge').textContent.trim()`);
  const tabAPhaseAfter = await pageA.evaluate(`document.querySelector('#hud-phase-badge').textContent.trim()`);
  console.log(`After End Turn -> Tab B Phase: "${tabBPhaseAfter}" | Tab A Phase: "${tabAPhaseAfter}"`);

  await pageB.screenshot('07_match_tab_b_turn2.png');

  // Tab B forfeits match
  await pageB.click('#btn-reset');
  await delay(1000);

  // Results overlay should show Victory on Tab A and Defeat on Tab B
  const tabAResult = await pageA.evaluate(`document.querySelector('#hud-result-title')?.textContent?.trim() || ''`);
  const tabBResult = await pageB.evaluate(`document.querySelector('#hud-result-title')?.textContent?.trim() || ''`);
  console.log(`Match Result -> Tab A: "${tabAResult}" | Tab B: "${tabBResult}"`);

  await pageA.screenshot('08_match_result_victory_defeat.png');

  const test6Pass = tabBPhaseAfter === 'Your Turn' &&
                    tabAPhaseAfter === 'Opponent Turn' &&
                    tabAResult.includes('Victory') &&
                    tabBResult.includes('Defeat');

  results.push({
    testId: 'TC-06',
    description: 'Turn Progression, Action Synchronization & Forfeit Battle Resolution',
    status: test6Pass ? 'PASS' : 'FAIL',
    details: `Turn handed off to Tab B successfully; Forfeit resulted in Victory (Tab A) / Defeat (Tab B)`,
  });

  // -------------------------------------------------------------
  // Test 7: Human vs MCP Agent Scenario ([MCP] Badge & MCP Tools)
  // -------------------------------------------------------------
  console.log('\n--- Test 7: Human vs MCP Agent Scenario ([MCP] Badge & MCP Tool Join) ---');
  // Return Tab A to menu
  await pageA.click('#btn-result-menu');
  await delay(800);

  // Tab A creates a new room for MCP agent test
  await pageA.click('#btn-pvp-battle');
  await pageA.waitForSelector('#pvp-player-name');
  await pageA.type('#pvp-player-name', 'Alice (Human)');
  await delay(200);
  await pageA.click('#btn-pvp-create-room');

  await pageA.waitForSelector('.hud-pvp-waiting-modal');
  const mcpTestCode = await pageA.evaluate(`document.querySelector('.hud-pvp-code-badge').textContent.trim()`);
  console.log(`Created room for MCP Agent: ${mcpTestCode}`);

  // Connect an MCP agent using RuneTacticsMcpServer
  let mcpServerModule = null;
  let mcpConnected = false;
  try {
    const { RuneTacticsMcpServer } = await import('/home/jbqneto/Documentos/development/projects/games/rune-tactics/server/src/mcp/RuneTacticsMcpServer.ts');
    const mcpServer = new RuneTacticsMcpServer();

    // Call join_pvp_room tool directly through the server handler
    const joinRes = await mcpServer['joinRoom'](
      'http://localhost:2567',
      mcpTestCode,
      false,
      'Nexus-MCP',
      ['knight', 'archer', 'cleric']
    );
    console.log('MCP Agent joined room successfully:', joinRes);
    mcpConnected = true;

    // Tab A should now be in Draft screen with opponent "Nexus-MCP [MCP]"
    await pageA.waitForSelector('.hud-pvp-draft-modal', 8000);
    await delay(1000);

    const mcpOpponentText = await pageA.evaluate(`document.querySelector('.hud-pvp-opponent-status').textContent.trim()`);
    const mcpBadgeExists = await pageA.evaluate(`!!document.querySelector('.hud-pvp-opponent-status .hud-mcp-badge')`);
    const mcpBadgeText = await pageA.evaluate(`document.querySelector('.hud-pvp-opponent-status .hud-mcp-badge')?.textContent?.trim() || ''`);

    console.log(`Draft Opponent text: "${mcpOpponentText}"`);
    console.log(`Draft MCP Badge exists: ${mcpBadgeExists} | text: "${mcpBadgeText}"`);

    await pageA.screenshot('09_draft_with_mcp_badge.png');

    // Tab A readies up
    await pageA.click('#btn-pvp-toggle-ready');
    await delay(1500);

    // Verify In-Match HUD displays MCP badge on opponent header
    await pageA.waitForSelector('#hud-enemies-title', 8000);
    const inMatchEnemyTitle = await pageA.evaluate(`document.querySelector('#hud-enemies-title').innerHTML.trim()`);
    const inMatchBadgeExists = await pageA.evaluate(`!!document.querySelector('#hud-enemies-title .hud-mcp-badge')`);
    console.log(`In-Match Opponent Header HTML: "${inMatchEnemyTitle}"`);
    console.log(`In-Match MCP Badge exists: ${inMatchBadgeExists}`);

    await pageA.screenshot('10_match_hud_with_mcp_badge.png');

    // Close MCP server connection cleanly
    await mcpServer.close();

    const test7Pass = mcpConnected && mcpBadgeExists && mcpBadgeText === '[MCP]' && inMatchBadgeExists;
    results.push({
      testId: 'TC-07',
      description: 'MCP Agent Integration & [MCP] Badge Rendering (Draft & Match HUD)',
      status: test7Pass ? 'PASS' : 'FAIL',
      details: `MCP agent joined via ColyseusRoomBackend; verified [MCP] badge in Draft (${mcpBadgeExists}) and in HUD (${inMatchBadgeExists})`,
    });
  } catch (err) {
    console.error('Error during MCP test:', err);
    results.push({
      testId: 'TC-07',
      description: 'MCP Agent Integration & [MCP] Badge Rendering',
      status: 'FAIL',
      details: `Failed to join or render MCP agent: ${err.message}`,
    });
  }

  // Check console and network errors
  console.log('\n--- Console Logs and Network Health ---');
  const errorsA = pageA.consoleLogs.filter(l => l.type === 'error');
  const errorsB = pageB.consoleLogs.filter(l => l.type === 'error');
  console.log(`Tab A Console Errors: ${errorsA.length}`, errorsA);
  console.log(`Tab B Console Errors: ${errorsB.length}`, errorsB);
  console.log(`Tab A Network Failures: ${pageA.networkErrors.length}`, pageA.networkErrors);
  console.log(`Tab B Network Failures: ${pageB.networkErrors.length}`, pageB.networkErrors);

  const test8Pass = errorsA.length === 0 && errorsB.length === 0 && pageA.networkErrors.length === 0 && pageB.networkErrors.length === 0;
  results.push({
    testId: 'TC-08',
    description: 'Console Logs & Network Hygiene (Zero Uncaught Errors)',
    status: test8Pass ? 'PASS' : 'FAIL',
    details: `Console errors: Tab A (${errorsA.length}), Tab B (${errorsB.length}) | Network errors: Tab A (${pageA.networkErrors.length}), Tab B (${pageB.networkErrors.length})`,
  });

  // Cleanup
  pageA.close();
  pageB.close();
  browserWs.close();

  // Print results table
  console.log('\n========================================');
  console.log('           QA TEST RESULTS MATRIX       ');
  console.log('========================================');
  for (const r of results) {
    console.log(`[${r.status}] ${r.testId}: ${r.description} -> ${r.details}`);
  }

  fs.writeFileSync(
    path.join(EVIDENCE_DIR, 'qa_report.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
  );
  console.log('\nQA report written to qa_report.json');
}

runQA().catch(err => {
  console.error('QA Runner fatal error:', err);
  process.exit(1);
});
