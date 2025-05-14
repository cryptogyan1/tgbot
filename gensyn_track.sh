#!/bin/bash

SCRIPT_NAME="run_rl_swarm.sh"
CHECK_INTERVAL=10  # seconds
LOGFILE="watchdog.log"
VPS_NAME="RAHUL"   # Change this per VPS

BOT_TOKEN="8093819896:AAGcXPGIpr9u7ucuEqXODMGoOjhq5MphlIU"
CHAT_ID="482760286"

send_telegram_message() {
    MESSAGE="$1"
    curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
         -d chat_id="$CHAT_ID" \
         -d text="$MESSAGE" \
         -d parse_mode="Markdown"
}

already_sent=0

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    if pgrep -f "$SCRIPT_NAME" > /dev/null; then
        echo "[$TIMESTAMP] [$VPS_NAME] RL swarm is running." >> "$LOGFILE"
        already_sent=0  # Reset alert status
    else
        echo "[$TIMESTAMP] [$VPS_NAME] RL swarm is NOT running." >> "$LOGFILE"
        if [ $already_sent -eq 0 ]; then
            MESSAGE="*[$VPS_NAME] RL Swarm is not running!*
Time: $TIMESTAMP"
            send_telegram_message "$MESSAGE"
            already_sent=1
        fi
    fi
    sleep $CHECK_INTERVAL
done
