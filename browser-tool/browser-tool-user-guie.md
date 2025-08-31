# 🤖 Claude Instructions - Browser Tool

## FOR CLAUDE: How to Use This Tool

When the user asks for UI testing, screenshots, or page verification:

### 🚨 NEVER Use MCP Playwright
- MCP is 340x slower and crashes
- Always use direct browser tools instead

### ✅ Standard Commands

**Screenshot a page:**
```bash
./browser-tool/screen-grab http://localhost:3000/dashboard
```

**Mobile screenshot:**
```bash
./browser-tool/screen-grab http://localhost:3000/page --mobile
```

**Full page capture:**
```bash
./browser-tool/screen-grab http://localhost:3000/report --fullpage
```

**Quick page test:**
```bash
node browser-tool/quick-test.js http://localhost:3000/page
```

**With authentication:**
```bash
./browser-tool/screen-grab http://localhost:3000/admin --auth-header="Bearer token123"
```

### 📸 Auto-Generated Screenshots

Screenshots are automatically saved to:
- `docs/testing/screen-grabs/YYYYMMDD-HHMMSS-pagename-viewport.png`

### 🎯 When to Use

- After ANY frontend/UI changes
- When user requests page verification  
- For responsive design testing
- Before marking UI tasks complete
- When debugging layout issues

### ⚡ Speed Comparison

- **MCP Playwright:** 340 seconds + crashes
- **Browser Tool:** **1-2 seconds** ✅

### 🔧 If Tool Fails

1. Check if dependencies installed: `cd browser-tool && npm install`
2. Run setup: `./browser-tool/setup.sh`
3. Test manually: `node browser-tool/quick-test.js http://google.com`

---

**Remember:** Always use `./browser-tool/screen-grab` instead of MCP for UI verification!