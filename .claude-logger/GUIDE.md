# Claude Logger - Complete Guide

## 🎯 What Is This?

Claude Logger is a **zero-dependency, self-contained chat history capture system** for Claude Code. It automatically logs all conversations between you and Claude directly into a SQLite database within your project.

## 🚀 Quick Start (30 Seconds)

### Step 1: Copy the Logger
```bash
# Copy this folder to your project root
cp -r .claude-logger /your/project/
```

### Step 2: Enable It
Create or edit `.claude/settings.json` in your project:
```json
{
  "$schema": "https://schemas.claude.ai/settings.json",
  "extends": "../.claude-logger/settings.json"
}
```

### Step 3: Done!
That's it. Every conversation is now being logged to `.claude-logger/chat.db`

## 📊 Viewing Your Chat History

### View Last Conversation
```bash
.claude-logger/view.sh last
```
Shows the most recent 20 messages from your last session.

### View Today's Activity
```bash
.claude-logger/view.sh today
```
Shows all messages from today, newest first.

### Export to Markdown
```bash
.claude-logger/view.sh export
```
Creates a readable markdown file with timestamps: `export-20250822.md`

### Direct SQL Queries
```bash
# Count messages by type
sqlite3 .claude-logger/chat.db "SELECT event_type, COUNT(*) FROM messages GROUP BY event_type"

# Find specific content
sqlite3 .claude-logger/chat.db "SELECT * FROM messages WHERE content LIKE '%error%'"

# Get yesterday's chats
sqlite3 .claude-logger/chat.db "SELECT * FROM messages WHERE date(timestamp) = date('now', '-1 day')"
```

## 🔧 How It Works

### Architecture
```
Claude Code → Hooks → capture.sh → SQLite Database → view.sh → You
```

1. **Claude Code Hooks** trigger on specific events (user prompts, tool use, completion)
2. **capture.sh** receives event data via stdin
3. **SQLite database** stores everything with timestamps and session IDs
4. **view.sh** provides easy access to the data

### What Gets Captured

| Event Type | What It Captures | When It Fires |
|------------|------------------|---------------|
| `user-prompt` | Your messages to Claude | When you hit Enter |
| `tool-use` | Commands Claude runs | Before each tool execution |
| `assistant-done` | Claude's responses | When Claude finishes responding |

### Database Schema
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    event_type TEXT,
    content TEXT
);
```

## 🎨 Customization

### Capture More Events
Edit `.claude-logger/settings.json` to add more hooks:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": ".claude-logger/capture.sh tool-result"
      }]
    }],
    "Notification": [{
      "hooks": [{
        "type": "command",
        "command": ".claude-logger/capture.sh notification"
      }]
    }]
  }
}
```

### Modify Storage Location
Edit `capture.sh` line 4:
```bash
DB="$DIR/chat.db"  # Change to any path you want
```

### Add Custom Processing
Create `.claude-logger/process.sh`:
```bash
#!/bin/bash
# Example: Send important messages to Slack
sqlite3 .claude-logger/chat.db "SELECT content FROM messages WHERE content LIKE '%ERROR%'" | \
  xargs -I {} curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"{}"}' YOUR_SLACK_WEBHOOK
```

## 🛠️ Troubleshooting

### Nothing is being logged
1. Check if `.claude/settings.json` exists and has `"extends": "../.claude-logger/settings.json"`
2. Verify scripts are executable: `chmod +x .claude-logger/*.sh`
3. Test manually: `echo "test" | .claude-logger/capture.sh test`

### Database is locked
```bash
# Kill any processes using the database
fuser .claude-logger/chat.db
# Or just copy it
cp .claude-logger/chat.db .claude-logger/chat-backup.db
```

### Want to start fresh
```bash
rm .claude-logger/chat.db
# Database will be recreated automatically
```

### Session IDs are all the same
Claude Code doesn't provide session IDs by default. You can set one manually:
```bash
export CLAUDE_SESSION_ID="project-x-$(date +%Y%m%d)"
claude-code
```

## 📁 File Structure

```
.claude-logger/
├── capture.sh       # Main capture script (hooks call this)
├── view.sh         # Viewer utility
├── settings.json   # Hook configuration
├── chat.db        # SQLite database (auto-created)
├── README.md      # Quick reference
├── GUIDE.md       # This file
└── SPEC.md        # Technical specification
```

## 🔐 Privacy & Security

- **100% Local**: No data leaves your machine
- **Project-Scoped**: Each project has its own database
- **No Dependencies**: Pure bash and SQLite (both pre-installed on most systems)
- **Gitignore Ready**: Add `*.db` to `.gitignore` to keep chats out of version control

## 💡 Advanced Usage

### Multi-Project Dashboard
```bash
#!/bin/bash
# Show all project chats
for db in ~/projects/*/.claude-logger/chat.db; do
  project=$(dirname $(dirname "$db"))
  echo "=== $(basename $project) ==="
  sqlite3 "$db" "SELECT COUNT(*) || ' messages today' FROM messages WHERE date(timestamp) = date('now')"
done
```

### Export to JSON
```bash
sqlite3 -json .claude-logger/chat.db "SELECT * FROM messages" > chats.json
```

### Analyze Usage Patterns
```bash
# Messages per hour
sqlite3 .claude-logger/chat.db "
SELECT strftime('%H:00', timestamp) as hour, COUNT(*) as count 
FROM messages 
GROUP BY hour 
ORDER BY hour"
```

### Clean Old Data
```bash
# Delete messages older than 30 days
sqlite3 .claude-logger/chat.db "DELETE FROM messages WHERE date(timestamp) < date('now', '-30 days')"
```

## 🚢 Deployment to New Projects

### One-Liner Install
```bash
curl -L https://your-server.com/claude-logger.tar.gz | tar -xz -C .
```

### Git Submodule Approach
```bash
git submodule add https://github.com/yourusername/claude-logger.git .claude-logger
```

### Team Sharing
1. Add `.claude-logger/` to your project template
2. Include in your onboarding docs
3. Everyone gets automatic chat history

## 📝 License

Public Domain - Copy, modify, and use however you want.

---

**Remember**: This tool logs everything. Be mindful of sensitive information in your conversations.