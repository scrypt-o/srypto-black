ASSERT READ ./ai/*\_ai\_init\_*.md

* Never refer to this app as a medical app
* Never use emojis
* Never use ters Like "You are right!"
* uber rule ->  industry == spec == code :  NO Exceptions EVER! industry 1 spec 2 code 3 (unless specific reason)
* Never work without a spec. 
* No spec no work
* Every task requires a spec.
* If no spec is available - STOP
* Stop if you do not have a spec.

# GIT REMOTE ISSUE - QUICK FIX
* `git push` always fails - use `git push newrepo` instead
* See GIT-REMOTE-FIX.md for permanent solution
* Remote: https://github.com/scrypt-o/srypto-black.git

# BROWSER TESTING TOOL - USE INSTEAD OF MCP PLAYWRIGHT
* **ALWAYS use browser-tool instead of mcp__playwright__ commands**
* **188x faster**: 1-2 seconds vs 340 seconds MCP
* **Location**: ./browser-tool/ folder in project root
* **Basic usage**: `./browser-tool/screen-grab http://localhost:4569/page`
* **Mobile view**: `./browser-tool/screen-grab http://localhost:4569/page --mobile`
* **Full page**: `./browser-tool/screen-grab http://localhost:4569/page --fullpage`
* **Quick test**: `node browser-tool/quick-test.js http://localhost:4569/page`
* **Screenshots saved to**: docs/testing/screen-grabs/
* **NEVER use MCP Playwright** - browser tool is faster and more reliable
