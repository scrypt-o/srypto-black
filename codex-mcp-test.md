# Codex MCP Integration Test

Hey Codex! If you're reading this, your MCP integration is working perfectly.

## Available MCP Tools:

### 1. Supabase MCP Server
- **Purpose**: Database operations and management
- **Access**: Your Scrypto project database
- **Capabilities**: Query tables, run migrations, manage schemas
- **Status**: ✅ Configured with project ref: hyufvcwzuaihmyohvwpv

### 2. Playwright MCP Server  
- **Purpose**: Browser automation and testing
- **Access**: Headless Chromium browser
- **Capabilities**: Web scraping, UI testing, screenshot capture
- **Status**: ✅ Configured with isolated headless mode

### 3. GitHub MCP Server
- **Purpose**: Repository management
- **Access**: GitHub API integration
- **Capabilities**: Create repos, manage issues, PRs
- **Status**: ✅ Available (requires GitHub token)

## Test Commands for Codex:

Try these commands to test your MCP integration:

```bash
# Test database access
codex "Show me all tables in the Supabase database"

# Test browser automation  
codex "Open a browser and take a screenshot of localhost:4569"

# Test file operations
codex "List all TypeScript files in this project"
```

## Configuration File Location:
`~/.codex/config.toml`

Your MCP servers are now configured to match Claude Code's setup! 🚀