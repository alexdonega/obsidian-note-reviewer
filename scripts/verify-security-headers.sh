#!/bin/bash
#
# Security Headers Verification Script
#
# Verifies that all required security headers are properly configured
# on the deployed portal application.
#
# Usage:
#   ./scripts/verify-security-headers.sh <url>
#   ./scripts/verify-security-headers.sh https://obsidian-note-reviewer.vercel.app
#
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default URL if not provided
DEFAULT_URL="https://obsidian-note-reviewer.vercel.app"

if [ -z "$1" ]; then
    echo -e "${YELLOW}No URL provided, using default: ${DEFAULT_URL}${NC}"
    URL="$DEFAULT_URL"
else
    URL="$1"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Security Headers Verification${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Target URL: ${URL}"
echo ""

# Fetch headers
echo -e "${BLUE}Fetching headers...${NC}"
HEADERS=$(curl -sI -L --max-redirs 5 "$URL" 2>/dev/null)

if [ -z "$HEADERS" ]; then
    echo -e "${RED}ERROR: Failed to fetch headers from ${URL}${NC}" >&2
    exit 1
fi

# Track results
PASSED=0
FAILED=0

# Function to check a header
check_header() {
    local header_name="$1"
    local expected_value="$2"
    local description="$3"

    # Get the header value (case-insensitive)
    local header_value
    header_value=$(echo "$HEADERS" | grep -i "^${header_name}:" | head -1 | cut -d: -f2- | sed 's/^[[:space:]]*//' | tr -d '\r')

    if [ -z "$header_value" ]; then
        echo -e "${RED}FAIL${NC} - ${header_name}"
        echo -e "       Expected: ${expected_value}"
        echo -e "       Actual: ${RED}(not set)${NC}"
        echo -e "       Purpose: ${description}"
        echo ""
        FAILED=$((FAILED + 1))
        return 1
    elif [ -n "$expected_value" ]; then
        # Check if the expected value is present (partial match for complex headers like CSP)
        if echo "$header_value" | grep -qi "$expected_value" 2>/dev/null; then
            echo -e "${GREEN}PASS${NC} - ${header_name}"
            echo -e "       Value: ${header_value}"
            echo ""
            PASSED=$((PASSED + 1))
            return 0
        else
            echo -e "${RED}FAIL${NC} - ${header_name}"
            echo -e "       Expected to contain: ${expected_value}"
            echo -e "       Actual: ${header_value}"
            echo -e "       Purpose: ${description}"
            echo ""
            FAILED=$((FAILED + 1))
            return 1
        fi
    else
        # Just check presence
        echo -e "${GREEN}PASS${NC} - ${header_name}"
        echo -e "       Value: ${header_value}"
        echo ""
        PASSED=$((PASSED + 1))
        return 0
    fi
}

echo -e "${BLUE}Checking security headers...${NC}"
echo ""

# Check all required security headers
check_header "X-Frame-Options" "DENY" "Prevents clickjacking by disallowing page embedding in iframes" || true
check_header "X-Content-Type-Options" "nosniff" "Prevents MIME type sniffing attacks" || true
check_header "Referrer-Policy" "strict-origin-when-cross-origin" "Controls referrer information leakage" || true
check_header "X-XSS-Protection" "1; mode=block" "Enables XSS filtering in older browsers" || true
check_header "Permissions-Policy" "geolocation=()" "Restricts dangerous browser features" || true
check_header "Strict-Transport-Security" "max-age=" "Forces HTTPS connections (HSTS)" || true
check_header "Content-Security-Policy" "default-src" "Prevents XSS and data injection attacks" || true

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Total Checks: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}All security headers are properly configured!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}Some security headers are missing or misconfigured.${NC}"
    echo ""
    echo -e "${YELLOW}Note: If testing locally with Vite dev server, security headers${NC}"
    echo -e "${YELLOW}will not be present as they are configured in vercel.json${NC}"
    echo -e "${YELLOW}and only applied in Vercel deployments.${NC}"
    echo ""
    exit 1
fi
