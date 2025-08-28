#!/bin/bash
# Quick viewer for chat history

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB="$DIR/chat.db"

if [ "$1" == "last" ]; then
    # Show last conversation
    sqlite3 -column -header "$DB" "
    SELECT datetime(timestamp, 'localtime') as time, event_type, substr(content, 1, 100) as content
    FROM messages 
    WHERE session_id = (SELECT session_id FROM messages ORDER BY id DESC LIMIT 1)
    ORDER BY id DESC LIMIT 20"
elif [ "$1" == "today" ]; then
    # Show today's chats
    sqlite3 -column -header "$DB" "
    SELECT datetime(timestamp, 'localtime') as time, event_type, substr(content, 1, 80) as content
    FROM messages 
    WHERE date(timestamp) = date('now')
    ORDER BY id DESC"
elif [ "$1" == "export" ]; then
    # Export to readable markdown
    sqlite3 "$DB" "
    SELECT '## ' || datetime(timestamp, 'localtime') || ' [' || event_type || ']', content
    FROM messages 
    ORDER BY id" > "$DIR/export-$(date +%Y%m%d).md"
    echo "Exported to $DIR/export-$(date +%Y%m%d).md"
else
    echo "Usage: ./view.sh [last|today|export]"
fi