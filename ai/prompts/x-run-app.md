Define $MODE = $ARGUMENTS; 



Infer $ACTION from $MODE AS 

( npm run dev

&nbsp; npm start

&nbsp; npm run build)



ASSERT Port number from default project config   

ASSERT Port availability 



If Port occupied THEN GET PID (running process); KILL PID; END;  	



ASSERT Port availability; If occupied THEN check PM2 for process; IF PM2 HAS current app THEN RESTART PM2 (APP); ELSE IF PM2 HAS (other app) THEN DELETE PM2; ADD (THIS APP); START PM2 ; ELSE IF port still occupied THEN HALT; RAISE PANIC USER;



ASSERT CONFIRM App started;

IF STARTED Confirm ONLINE URL USING Playwright MCP 



OUTPUT:



The app is accessible at:



 - http://19x.xxx.xxx.xxx:xxxx

 - https://theapp.url





IF ERROR:



1. Confirm app is running
2. Check caddy for url and port
3. Check if PM2 is not restarting old app
4. Kill app by PID
5. Repeat 2 times and then stop and confirm with user.
