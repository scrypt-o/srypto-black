define $root-folder == pwd

assert READ CLAUDE.md

assert FOR EACH file IN {LIST ALL FILES($root-folder/ai/ai-rules/\*.\*} 

Now continue with $ARGUMENTS; If NOT EXISTS $ARGUMENTS THEN STATE "Ready..."

