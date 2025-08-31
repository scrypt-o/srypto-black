## BROWSER TOOL USAGE SUMMARY 

  We have been using the MCP of Playrite to do our testing. But we've had numerous issues with the server crashing, it being slow, and there's some safety concerns around it. 
  We have spent the time and we have created our own tool that conforms exactly to our requirements. You now have access to a fast browser testing tool that replaces slow MCP Playwright.

The tool is located in a subfolder 📁 Tool Location: ./browser-tool/ folder in project root. 

First, please verify that this folder exists and that you can see files within this folder.  
There is no need to read all of them because it will be explained below. Your first step is just to confirm that the tool is indeed already present in this project. 

If it is not present in this project, please do the following: 

1. We hide a subfolder in the root of this project for browser-tool
2. Please copy the latest version of the tool from `/_eve_/_eve_workshop_/_custom-tools_/browser-tool/`

Once you have confirmed the tool is in 📁 browser-tool/ folder in project root

Then

3. Read all the instructions below and setup the tool as described.
4. Please add a note to CLAUDE.md to use this tool rather than MCP Playwright by summarising the below instructions after you have confirmed you can use the tool.

## BROWSER TOOL USAGE INSTRUCTIONS

  📁 Tool Location: ./browser-tool/ folder in project root

  ⚡ Speed: 1-2 seconds vs 340 seconds MCP (188x faster)

  🛠️ Available Commands

  Main Screenshot Tool:
  ./browser-tool/screen-grab <url> [options]

  Quick Test Tool:
  node browser-tool/quick-test.js <url>

  📸 Screenshot Examples

  # Basic desktop screenshot
  ./browser-tool/screen-grab http://localhost:3000/dashboard

  # Mobile view
  ./browser-tool/screen-grab http://localhost:3000/app --mobile

  # Full page capture
  ./browser-tool/screen-grab http://localhost:3000/report --fullpage

  # With authentication
  ./browser-tool/screen-grab http://localhost:3000/admin --auth-header="Bearer abc123"
  ./browser-tool/screen-grab http://localhost:3000/user --auth-cookies="session=xyz789"

  # Multiple options
  ./browser-tool/screen-grab http://localhost:3000/page --mobile --fullpage

  🧪 Quick Testing

  # Fast page validation (title + load check)
  node browser-tool/quick-test.js http://localhost:3000/page

  📁 Auto-Generated Files

  Screenshots automatically saved to: docs/testing/screen-grabs/

  Naming format: YYYYMMDD-HHMMSS-pagename-viewport.png

  🔧 Setup (if tool not working)

  cd browser-tool
  ./setup.sh

  🚨 CRITICAL RULES

  5. ALWAYS use this tool instead of MCP Playwright
  6. NEVER use mcp__playwright__ commands
  7. Screenshot after ANY UI changes
  8. Use for UI verification and testing

  📋 When to Use

  - User asks to "check the page" or "screenshot the dashboard"
  - After making UI/frontend changes
  - For responsive design testing
  - When debugging layout issues
  - Before marking UI tasks complete

  ⚡ Example Usage

  User says: "Screenshot the login page"
  You run: ./browser-tool/screen-grab http://localhost:3000/login

  User says: "Check mobile view of dashboard"You run: ./browser-tool/screen-grab http://localhost:3000/dashboard --mobile

