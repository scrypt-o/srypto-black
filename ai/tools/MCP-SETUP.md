# MCP Setup — Supabase + Playwright

Purpose: Provide a drop-in MCP configuration for Claude clients to access Supabase (project: hyufvcwzuaihmyohvwpv) and Playwright for browser automation.

Files
- ai/tools/mcp.config.json — ready-to-paste servers block

How to use (Claude Desktop / Claude for VS Code)
- Open your client MCP settings (settings.local.json or UI MCP Servers panel).
- Merge the contents of `ai/tools/mcp.config.json` under the top-level key `mcpServers`.
- Restart the client.

Servers
- supabase-scrypto:
  - Command: `npx -y @supabase/mcp-server-supabase@latest --access-token <token> --project-ref hyufvcwzuaihmyohvwpv`
  - Uses a Supabase Personal Access Token with project scope.
- playwright:
  - Command: `npx -y @executeautomation/playwright-mcp-server --headless --browser chromium --ignore-https-errors --isolated --block-service-workers`

Quick sanity checks (run via your MCP client)
1) List tools
   - Ask: "List MCP tools and report availability for supabase-scrypto and playwright."

2) Supabase read test
   - Ask: "Supabase: run SQL 'select 1 as ok' and return results."
   - Optionally: "Select 1 row from v_patient__medhist__allergies (limit 1)."

3) Playwright screenshot test
   - Ask: "Playwright: open https://qa.scrypto.online/login, wait for network idle, take a screenshot."
   - Then: "Set cookie sb-hyufvcwzuaihmyohvwpv-auth-token=<BASE64_TOKEN> for domain qa.scrypto.online; open https://qa.scrypto.online/patient/persinfo/profile and screenshot."

Notes
- The Supabase MCP server does not support `--help`; it starts immediately and expects an MCP client over stdio.
- Tokens are test/QA scope for this project. Rotate if needed.
- If Playwright install fails, restart the client session (per ai/init.md workflow).
