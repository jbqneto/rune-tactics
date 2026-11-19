import '../config/env.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { format } from 'node:util';
import { RuneTacticsMcpServer } from './RuneTacticsMcpServer.js';

for (const method of ['log', 'info', 'debug'] as const) console[method] = (...args: unknown[]) => { process.stderr.write(`${format(...args)}\n`); };
const server = new RuneTacticsMcpServer({ defaultServerUrl: process.env.VITE_PVP_SERVER_URL ?? 'http://localhost:2567' });
server.connect(new StdioServerTransport()).catch((error: unknown) => { process.stderr.write(`[rune-tactics-mcp] ${error instanceof Error ? error.stack : String(error)}\n`); process.exitCode = 1; });
