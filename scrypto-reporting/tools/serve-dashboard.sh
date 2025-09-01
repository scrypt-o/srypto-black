#!/bin/bash

# Scrypto Intelligence Dashboard Server
# Serves the reporting dashboard on a local web server

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REPORTING_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Scrypto Intelligence Dashboard..."
echo "📁 Serving from: $REPORTING_DIR"

# Change to reporting directory
cd "$REPORTING_DIR"

# Check if port 8080 is available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Port 8080 is already in use"
    echo "🔗 Dashboard might already be running at: http://localhost:8080/dashboard/"
    exit 1
fi

# Start Python HTTP server
echo "🌐 Starting web server on port 8080..."
echo "🔗 Dashboard URL: http://localhost:8080/dashboard/"
echo "📊 Reports URL: http://localhost:8080/reports/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 -m http.server 8080