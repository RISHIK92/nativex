#!/bin/bash
set -e

PROJECT_DIR="/home/coder/project"
TEMPLATE_DIR="/usr/src/expo-template"

# Check if the "Done Flag" exists
if [ -f "$PROJECT_DIR/.init-done" ]; then
    echo "📂 Project already initialized. Resuming..."
else
    echo "🆕 New Project detected. Initializing from template..."
    
    # 1. Copy files (using -n to not overwrite if something weird exists)
    # We use '.' to copy contents of template to project dir
    cp -R $TEMPLATE_DIR/. $PROJECT_DIR/

    echo "Copy Success"
    
    # 2. Create the DONE flag
    touch "$PROJECT_DIR/.init-done"
    
    echo "✅ Template copied & Flag set."
fi

# 3. Start Auto-Kill Monitor
echo "⏰ Starting Inactivity Monitor..."
/usr/local/bin/autokill.sh &

# 4. Start Editor
echo "💻 Starting Code-Server..."
exec code-server --auth none --bind-addr 0.0.0.0:8080 "$PROJECT_DIR"