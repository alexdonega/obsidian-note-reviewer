/**
 * Test Server Helper
 *
 * Provides utilities for starting/stopping the hook server for integration tests.
 */

import { $ } from "bun";

let serverProcess: Bun.Process | null = null;

export interface TestServerOptions {
	/** Port for the test server (default: random) */
	port?: number;
	/** Test content to simulate PostToolUse input */
	testContent?: string;
}

/**
 * Start the hook server for integration testing
 */
export async function startTestServer(options: TestServerOptions = {}): Promise<string> {
	const { port = 0, testContent = "# Test Note\n\nTest content." } = options;

	// Create mock PostToolUse event input
	const mockEvent = JSON.stringify({
		tool_input: {
			content: testContent,
			file_path: "C:/dev/tools/obsidian-note-reviewer/.temp/test-note.md",
		},
	});

	// Start the server with mock input
	serverProcess = Bun.spawn({
		cmd: ["bun", "run", "index.ts"],
		cwd: import.meta.dir,
		stdin: Buffer.from(mockEvent + "\n"),
		stdout: "pipe",
		stderr: "pipe",
	});

	// Wait for server to start and extract port from stderr
	await Bun.sleep(500);

	const stderr = await new TextDecoder().decode(serverProcess.stderr.peek());
	const portMatch = stderr.match(/running on http:\/\/localhost:(\d+)/);

	if (portMatch) {
		return `http://localhost:${portMatch[1]}`;
	}

	// Fallback: return localhost with specified port
	return `http://localhost:${port || 5173}`;
}

/**
 * Stop the test server
 */
export async function stopTestServer(): Promise<void> {
	if (serverProcess) {
		serverProcess.kill();
		serverProcess = null;
	}
}

/**
 * Run a test with a temporary server
 */
export async function withTestServer<T>(
	testFn: (serverUrl: string) => Promise<T>,
	options?: TestServerOptions
): Promise<T> {
	const serverUrl = await startTestServer(options);
	try {
		return await testFn(serverUrl);
	} finally {
		await stopTestServer();
	}
}
