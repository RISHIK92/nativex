#!/bin/bash

TIMEOUT=2000
INTERVAL=20

sleep 900

LAST_ACTIVITY=$(date +%s)

echo "⏰ Auto-kill monitor started. Timeout: ${TIMEOUT}s"

while true; do
    CONNECTIONS=$(netstat -an | grep ':8080 ' | grep 'ESTABLISHED' | wc -l)

    NOW=$(date +%s)

    if [ "$CONNECTIONS" -gt 0 ]; then
        LAST_ACTIVITY=$NOW
    else
        IDLE_TIME=$((NOW - LAST_ACTIVITY))
        
        if [ "$IDLE_TIME" -ge "$TIMEOUT" ]; then
            echo "💀 Inactivity detected ($IDLE_TIME seconds). Killing container..."
            kill 1
            exit 0
        fi
    fi

    sleep $INTERVAL
done