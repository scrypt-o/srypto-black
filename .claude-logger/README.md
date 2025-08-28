# Claude Chat Logger

Dead simple chat history capture. Copy this folder to any project.

## Setup (10 seconds)

1. Copy `.claude-logger/` folder to your project root
2. Add to `.claude/settings.json`:
```json
{
  "$schema": "https://schemas.claude.ai/settings.json",
  "extends": "../.claude-logger/settings.json"
}
```

Done! Chats are now logged to `.claude-logger/chat.db`

## Usage

```bash
# View last conversation
.claude-logger/view.sh last

# View today's chats
.claude-logger/view.sh today

# Export to markdown
.claude-logger/view.sh export
```

## What it captures
- User prompts
- Tool usage
- Assistant responses
- All stored in local SQLite database

## To copy to another project
```bash
cp -r .claude-logger /path/to/other/project/
```

That's it. No servers, no dependencies, just works.