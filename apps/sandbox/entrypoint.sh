#!/bin/bash
set -e

update_status() {
  STATUS=$1
  echo "📡 Updating Status: $STATUS..."
  (cd /usr/src/worker && bun -e "
    import Redis from 'ioredis'; 
    const redis = new Redis('$REDIS_URL'); 
    await redis.set('project:$PROJECT_ID:status', '$STATUS');
    process.exit(0);
  ") || { echo "❌ Redis update failed!"; exit 1; }
}

PROJECT_DIR="/home/coder/project"
TEMPLATE_DIR="/home/coder/expo-template"

if [ -f "$PROJECT_DIR/package.json" ]; then
    echo "📂 Project found (Resume Mode). Skipping Generation."
    MODE="RESUME"
else
    echo "🆕 Empty folder (Generation Mode). Starting setup."
    MODE="NEW"
fi

update_status "BOOTING"

if [ "$MODE" == "NEW" ]; then
    cp -rT $TEMPLATE_DIR $PROJECT_DIR
    chown -R coder:coder $PROJECT_DIR
fi
if [ "$MODE" == "NEW" ]; then
    update_status "GENERATING"
    echo "🚀 Running Worker Logic..."
    cd /usr/src/worker
    bun run index.ts || { echo "❌ Worker failed"; exit 1; }
    update_status "COMPLETED"
    
    echo "🔐 Saving secrets to .env..."
    echo "DATABASE_URL=\"$DATABASE_URL\"" > $PROJECT_DIR/.env
    echo "PROJECT_ID=\"$PROJECT_ID\"" >> $PROJECT_DIR/.env
    chown coder:coder $PROJECT_DIR/.env
fi

echo "🔧 Fixing permissions..."
chown -R coder:coder $PROJECT_DIR

cd $PROJECT_DIR

if [ ! -d "node_modules" ]; then
    echo "📦 Installing Dependencies..."
    su - coder -c "cd $PROJECT_DIR && bun install"
fi

update_status "READY"

echo "⏰ Starting Inactivity Monitor..."
/usr/src/autokill.sh &

if [ -d "/usr/src/worker" ]; then
    echo "🔥 Burning worker code..."
    rm -rf /usr/src/worker
fi

unset REDIS_URL
unset PROJECT_ID
unset DATABASE_URL
unset GROQ_API_KEY
unset GEMINI_API_KEY

echo "💻 Starting Code-Server..."
exec su - coder -c "code-server --auth none --bind-addr 0.0.0.0:8080 $PROJECT_DIR"