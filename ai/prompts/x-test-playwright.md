Please use Playwright MCP server and verify that the changes were successful.

ASSERT: Take screenshots for BOTH desktop AND mobile viewports:

1. Desktop (1920x1080) - save as ddmmyyyy-pagename-desktop.png
2. Mobile (390x844) - save as ddmmyyyy-pagename-mobile.png

Save all screen captures in the ./ai/tests folder in this project codebase root. If the folder does not exist, you are in the wrong place. Check you PWD 

VERIFICATION WORKFLOW:

1. mcp\_\_playwright\_\_browser\_navigate to the page
2. mcp\_\_playwright\_\_browser\_snapshot to inspect DOM
3. mcp\_\_playwright\_\_browser\_take\_screenshot (desktop)
4. mcp\_\_playwright\_\_browser\_resize to mobile (390x844)
5. mcp\_\_playwright\_\_browser\_take\_screenshot (mobile)
6. mcp\_\_playwright\_\_browser\_close

If Playwright fails after trying browser\_install, STOP and tell the user: "Playwright is malfunctioning. Please restart Claude Code and try again."



After you have verified, print to the screen the url to the app like this:



Screen Grabs save to: full/path/to/screen/grabs



The app is accessible at:



 - http://19x.xxx.xxx.xxx:xxxx

 - https://theapp.url

