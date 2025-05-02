const fs = require('fs');
const { fork } = require('child_process');

// Read .env and get all TELEGRAM_BOT_TOKEN_X entries
function getBotTokens() {
  if (!fs.existsSync('.env')) return [];
  const content = fs.readFileSync('.env', 'utf-8');
  const lines = content.split('\n').filter(Boolean);

  return lines
    .filter(line => line.startsWith('TELEGRAM_BOT_TOKEN_'))
    .map(line => {
      const match = line.match(/^TELEGRAM_BOT_TOKEN_(\d+)=/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter(id => id !== null)
    .sort((a, b) => a - b); // Sort to launch in order
}

const botIds = getBotTokens();

if (botIds.length === 0) {
  console.log('⚠️ No TELEGRAM_BOT_TOKEN_X entries found in .env');
  process.exit(0);
}

console.log(`🚀 Found ${botIds.length} bot(s) in .env`);

const processes = new Map();

function launchBot(botId) {
  console.log(`📡 Launching bot #${botId}`);
  const child = fork('bot.js', [], {
    env: { ...process.env, TELEGRAM_BOT_ID: botId.toString() }
  });

  processes.set(botId, child);

  child.on('exit', (code, signal) => {
    if (signal !== 'SIGINT' && signal !== 'SIGTERM') {
      console.log(`🔄 Bot #${botId} crashed. Restarting...`);
      launchBot(botId); // Restart on crash
    } else {
      console.log(`🛑 Bot #${botId} stopped manually.`);
    }
  });
}

// Launch all bots
botIds.forEach(launchBot);

// Stop all bots cleanly on Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Caught Ctrl+C. Stopping all bots...');
  processes.forEach((proc, id) => {
    console.log(`⛔ Stopping bot #${id}`);
    proc.kill('SIGINT');
  });
  setTimeout(() => process.exit(0), 500);
});
