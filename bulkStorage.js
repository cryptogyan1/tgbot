const fs = require('fs');
const path = './bulk_progress.json';

function loadProgress(userId) {
  if (!fs.existsSync(path)) return null;

  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  return data[userId] || null;
}

function saveProgress(userId, bulkQuestions, bulkTotal) {
  let data = {};
  if (fs.existsSync(path)) {
    data = JSON.parse(fs.readFileSync(path, 'utf8'));
  }

  data[userId] = { bulkQuestions, bulkTotal };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function clearProgress(userId) {
  if (!fs.existsSync(path)) return;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  delete data[userId];
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = { loadProgress, saveProgress, clearProgress };
