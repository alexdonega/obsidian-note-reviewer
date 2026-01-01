#!/usr/bin/env bun
/**
 * Manual Security Testing Script for /api/save Endpoint
 *
 * This script performs comprehensive path traversal attack testing against the
 * running server. It tests various attack vectors and documents the results.
 *
 * Usage:
 *   1. Start the server with test stdin input:
 *      echo '{"tool_input":{"content":"test"}}' | bun run apps/hook/server/index.ts
 *
 *   2. In another terminal, run this test script:
 *      bun run apps/hook/server/__tests__/manual-security-test.ts
 *
 * Expected: All attack paths should return HTTP 400 with appropriate error messages.
 * Valid paths should succeed (HTTP 200) when pointing to writable directories.
 */

interface TestCase {
  category: string;
  description: string;
  path: string;
  expectedStatus: 400 | 200;
  expectedErrorContains?: string;
}

interface TestResult {
  test: TestCase;
  passed: boolean;
  actualStatus: number;
  responseBody: unknown;
  error?: string;
}

// Server URL - adjust if server runs on different port
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5173";

// Attack vectors to test
const testCases: TestCase[] = [
  // ============================================================================
  // CATEGORY 1: Simple Path Traversal
  // ============================================================================
  {
    category: "Simple Traversal",
    description: "Single level up",
    path: "../etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Simple Traversal",
    description: "Double level up",
    path: "../../etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Simple Traversal",
    description: "Triple level up",
    path: "../../../etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Simple Traversal",
    description: "Nested in path",
    path: "vault/notes/../../../etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Simple Traversal",
    description: "Deep nesting",
    path: "a/b/c/d/../../../../../etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },

  // ============================================================================
  // CATEGORY 2: Windows-Style Traversal
  // ============================================================================
  {
    category: "Windows Traversal",
    description: "Backslash single level",
    path: "..\\Windows\\System32\\config\\SAM",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Windows Traversal",
    description: "Backslash double level",
    path: "..\\..\\Windows\\System32\\config\\SAM",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Windows Traversal",
    description: "Windows boot ini",
    path: "..\\..\\boot.ini",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Windows Traversal",
    description: "Windows hosts file",
    path: "..\\..\\Windows\\System32\\drivers\\etc\\hosts",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },

  // ============================================================================
  // CATEGORY 3: Mixed Separator Attacks
  // ============================================================================
  {
    category: "Mixed Separators",
    description: "Forward then back",
    path: "../..\\etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Mixed Separators",
    description: "Back then forward",
    path: "..\\../etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Mixed Separators",
    description: "Alternating throughout",
    path: "..\\../..\\../etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },

  // ============================================================================
  // CATEGORY 4: URL Encoded Attacks
  // ============================================================================
  {
    category: "URL Encoded",
    description: "Encoded ../ (%2e%2e%2f)",
    path: "%2e%2e%2fetc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "URL Encoded",
    description: "Encoded slash only",
    path: "..%2fetc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "URL Encoded",
    description: "Encoded dots only",
    path: "%2e%2e/etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "URL Encoded",
    description: "Full path encoded",
    path: "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "URL Encoded",
    description: "Encoded backslash (%5c)",
    path: "%2e%2e%5cWindows%5cSystem32",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },

  // ============================================================================
  // CATEGORY 5: Double Encoded Attacks
  // ============================================================================
  {
    category: "Double Encoded",
    description: "Double encoded ../ (%252e%252e%252f)",
    path: "%252e%252e%252fetc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Double Encoded",
    description: "Double encoded dots",
    path: "%252e%252e/etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Double Encoded",
    description: "Double encoded slash",
    path: "..%252fetc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },

  // ============================================================================
  // CATEGORY 6: Triple Encoded Attacks
  // ============================================================================
  {
    category: "Triple Encoded",
    description: "Triple encoded ../",
    path: "%25252e%25252e%25252f/etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },

  // ============================================================================
  // CATEGORY 7: Unicode/Overlong Encoding Attacks
  // ============================================================================
  {
    category: "Unicode Overlong",
    description: "C0 overlong encoding for dot (%c0%ae)",
    path: "%c0%ae%c0%ae/etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Unicode Overlong",
    description: "Mixed C0 encoding (.%c0%ae)",
    path: ".%c0%ae/etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Unicode Overlong",
    description: "E0 3-byte overlong for dot",
    path: "%e0%80%ae%e0%80%ae/etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Unicode Overlong",
    description: "C0 overlong slash (%c0%af)",
    path: "..%c0%afetc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },

  // ============================================================================
  // CATEGORY 8: Null Byte Injection
  // ============================================================================
  {
    category: "Null Byte",
    description: "Extension bypass with null byte",
    path: "file.txt\0.jpg",
    expectedStatus: 400,
    expectedErrorContains: "Invalid characters",
  },
  {
    category: "Null Byte",
    description: "URL encoded null byte (%00)",
    path: "file.txt%00.jpg",
    expectedStatus: 400,
    expectedErrorContains: "Invalid characters",
  },
  {
    category: "Null Byte",
    description: "Null byte with traversal",
    path: "../etc/passwd%00.md",
    expectedStatus: 400,
    // Could match either error depending on which check fails first
  },
  {
    category: "Null Byte",
    description: "Null byte in middle of path",
    path: "folder%00/file.txt",
    expectedStatus: 400,
    expectedErrorContains: "Invalid characters",
  },

  // ============================================================================
  // CATEGORY 9: Empty/Invalid Paths
  // ============================================================================
  {
    category: "Invalid Paths",
    description: "Empty path",
    path: "",
    expectedStatus: 400,
    expectedErrorContains: "required",
  },
  {
    category: "Invalid Paths",
    description: "Only dots",
    path: "..",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Invalid Paths",
    description: "Just dot-dot-slash",
    path: "../",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },

  // ============================================================================
  // CATEGORY 10: Real-World Attack Payloads (from security scanners)
  // ============================================================================
  {
    category: "Real-World Attacks",
    description: "Linux /etc/passwd attempt",
    path: "....//....//....//etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Real-World Attacks",
    description: "Dotdot bypass attempt",
    path: "..././..././etc/passwd",
    expectedStatus: 400,
    expectedErrorContains: "traversal",
  },
  {
    category: "Real-World Attacks",
    description: "Absolute path to sensitive file",
    path: "/etc/passwd",
    // Note: This might succeed if the directory exists - testing behavior varies by system
    expectedStatus: 200, // May succeed unless ALLOWED_SAVE_PATHS is set
  },

  // ============================================================================
  // CATEGORY 11: Valid Paths (should succeed)
  // ============================================================================
  {
    category: "Valid Paths",
    description: "Simple relative path",
    path: "note.md",
    expectedStatus: 200,
  },
  {
    category: "Valid Paths",
    description: "Nested relative path",
    path: "folder/subfolder/note.md",
    expectedStatus: 200,
  },
  {
    category: "Valid Paths",
    description: "Path with current dir",
    path: "./notes/daily.md",
    expectedStatus: 200,
  },
  {
    category: "Valid Paths",
    description: "Path with spaces",
    path: "My Notes/Daily Note 2024.md",
    expectedStatus: 200,
  },
  {
    category: "Valid Paths",
    description: "Path with Unicode",
    path: "Notas/Título com Acentuação.md",
    expectedStatus: 200,
  },
];

async function runTest(test: TestCase): Promise<TestResult> {
  try {
    const response = await fetch(`${SERVER_URL}/api/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "# Security Test\nThis is a test file.",
        path: test.path,
      }),
    });

    const body = await response.json();

    // Check if the test passed
    let passed = response.status === test.expectedStatus;

    // If expecting 400, also verify error message doesn't leak sensitive info
    if (test.expectedStatus === 400 && passed) {
      const errorMsg = typeof body.error === "string" ? body.error : "";

      // Verify error contains expected text if specified
      if (test.expectedErrorContains) {
        passed = passed && errorMsg.toLowerCase().includes(test.expectedErrorContains.toLowerCase());
      }

      // Verify error doesn't leak sensitive paths
      const sensitiveLeaks = [
        "/etc/passwd",
        "/etc/shadow",
        "System32",
        "C:\\Users",
        "C:\\Windows",
        process.cwd(),
      ];

      for (const sensitive of sensitiveLeaks) {
        if (errorMsg.includes(sensitive)) {
          passed = false;
          return {
            test,
            passed: false,
            actualStatus: response.status,
            responseBody: body,
            error: `Error message leaks sensitive info: "${sensitive}"`,
          };
        }
      }
    }

    return {
      test,
      passed,
      actualStatus: response.status,
      responseBody: body,
    };
  } catch (error) {
    return {
      test,
      passed: false,
      actualStatus: 0,
      responseBody: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function formatResults(results: TestResult[]): string {
  let output = "";
  let currentCategory = "";
  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    if (result.test.category !== currentCategory) {
      currentCategory = result.test.category;
      output += `\n### ${currentCategory}\n\n`;
    }

    const statusIcon = result.passed ? "✅" : "❌";
    const status = result.passed ? "PASS" : "FAIL";

    if (result.passed) {
      passCount++;
    } else {
      failCount++;
    }

    output += `${statusIcon} **${result.test.description}**\n`;
    output += `   - Path: \`${result.test.path}\`\n`;
    output += `   - Expected: HTTP ${result.test.expectedStatus}\n`;
    output += `   - Actual: HTTP ${result.actualStatus}\n`;

    if (result.responseBody && typeof result.responseBody === "object") {
      const body = result.responseBody as Record<string, unknown>;
      if (body.error) {
        output += `   - Error: "${body.error}"\n`;
      }
    }

    if (result.error) {
      output += `   - Test Error: ${result.error}\n`;
    }

    output += "\n";
  }

  // Summary
  const summary = `
## Summary

- **Total Tests**: ${results.length}
- **Passed**: ${passCount} ✅
- **Failed**: ${failCount} ❌
- **Pass Rate**: ${((passCount / results.length) * 100).toFixed(1)}%
`;

  return summary + output;
}

async function main() {
  console.log("🔒 Path Traversal Security Test Suite");
  console.log("=====================================\n");
  console.log(`Testing against: ${SERVER_URL}\n`);

  // Check if server is running
  try {
    await fetch(`${SERVER_URL}/api/content`);
  } catch {
    console.error("❌ Error: Cannot connect to server at", SERVER_URL);
    console.error("   Please start the server first:");
    console.error('   echo \'{"tool_input":{"content":"test"}}\' | bun run apps/hook/server/index.ts');
    process.exit(1);
  }

  console.log("✅ Server is running\n");
  console.log("Running security tests...\n");

  const results: TestResult[] = [];

  // Run tests sequentially to avoid overwhelming the server
  for (const test of testCases) {
    const result = await runTest(test);
    results.push(result);

    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} [${test.category}] ${test.description}`);
  }

  console.log("\n" + "=".repeat(50) + "\n");
  console.log(formatResults(results));

  // Exit with error code if any tests failed
  const failedCount = results.filter((r) => !r.passed).length;
  if (failedCount > 0) {
    console.log(`\n⚠️  ${failedCount} test(s) failed!`);
    process.exit(1);
  } else {
    console.log("\n🎉 All security tests passed!");
    process.exit(0);
  }
}

main().catch(console.error);
