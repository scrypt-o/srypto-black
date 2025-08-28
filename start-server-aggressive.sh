#!/bin/bash
# AGGRESSIVE SERVER START - NO MERCY APPROACH

echo "🔥 AGGRESSIVE SERVER START - KILLING EVERYTHING ON PORT 4569"

# 1. NUCLEAR OPTION - Kill everything related to port 4569
sudo fuser -k 4569/tcp 2>/dev/null || true
sudo netstat -tulpn | grep :4569 | awk '{print $7}' | cut -d'/' -f1 | xargs -r sudo kill -9 2>/dev/null || true
lsof -ti:4569 | xargs -r kill -9 2>/dev/null || true

# 2. Kill all node processes (NUCLEAR)
pkill -f "node.*4569" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true

# 3. Stop all PM2 processes and kill daemon
pm2 kill 2>/dev/null || true

# 4. Wait 2 seconds for cleanup
sleep 2

# 5. Final port check and force kill
if lsof -Pi :4569 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "🔥 FORCE KILLING REMAINING PROCESSES"
    sudo lsof -ti:4569 | xargs -r sudo kill -9 2>/dev/null || true
    sleep 1
fi

# 6. START SERVER WITH FORCE
echo "🚀 STARTING SERVER - NO BULLSHIT"
export NODE_ENV=development
export FORCE_COLOR=1

# Try PM2 first (cleanest)
pm2 start npm --name "scrypto-dev" -- run dev 2>/dev/null || {
    echo "PM2 failed, trying direct npm"
    npm run dev &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"
}

# 7. Wait for server to respond (10 second timeout)
echo "⏰ Waiting for server..."
for i in {1..20}; do
    if curl -s -m 2 http://localhost:4569 >/dev/null 2>&1; then
        echo "✅ SERVER IS RUNNING ON http://localhost:4569"
        echo "✅ Network: http://154.66.197.38:4569"
        exit 0
    fi
    sleep 0.5
    echo -n "."
done

echo "❌ SERVER FAILED TO START - CHECK LOGS"
pm2 logs scrypto-dev --lines 5 2>/dev/null || echo "No PM2 logs available"
exit 1