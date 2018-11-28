const fetch = require('node-fetch').default
const assert = require('assert')

const c4rpiToken = process.env.CLOUD4RPI_TOKEN
assert(c4rpiToken, 'specify Cloud4RPi Token')

async function initDatastore(dataTypes) {
  await fetch(`https://cloud4rpi.io/api/devices/${c4rpiToken}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataTypes),
  })
}

async function sendData(data, timestamp = new Date().toISOString()) {
  fetch(`https://cloud4rpi.io/api/devices/${c4rpiToken}/data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ts: timestamp,
      payload: data,
    }),
  })
}

module.exports = {
  initDatastore,
  sendData,
}
