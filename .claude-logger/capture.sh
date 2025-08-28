#!/bin/bash
# Simple chat capture - just works, no BS

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB="$DIR/chat.db"
SESSION_ID="${CLAUDE_SESSION_ID:-$(date +%s)}"

# Auto-create database if needed
if [ ! -f "$DB" ]; then
    sqlite3 "$DB" <<EOF
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    event_type TEXT,
    content TEXT
);
EOF
fi

# Capture whatever Claude sends us
EVENT_TYPE="${1:-unknown}"
CONTENT=$(cat)

# Clean and store
sqlite3 "$DB" <<EOF
INSERT INTO messages (session_id, event_type, content)
VALUES ('$SESSION_ID', '$EVENT_TYPE', '$(echo "$CONTENT" | sed "s/'/''/g")');
EOF

# Pass through so Claude keeps working
echo "$CONTENT"