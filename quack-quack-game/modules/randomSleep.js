const config = require("../config.json");

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSleep() {
  const minSleepTime = config.minSleepTime || 1; // Default minimum sleep time if not set in config
  const maxSleepTime = config.maxSleepTime || 5; // Default maximum sleep time if not set in config

  const sec = getRndInteger(minSleepTime, maxSleepTime);
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

module.exports = randomSleep;
