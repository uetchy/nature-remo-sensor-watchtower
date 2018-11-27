const micro = require('micro')
const NatureRemo = require('nature-remo')
const fetch = require('node-fetch')
const assert = require('assert')

const natureRemoToken = process.env.NATURE_REMO_CLOUD_API_TOKEN
assert(natureRemoToken, 'specify Nature Remo API Token')

const c4rpiToken = process.env.CLOUD4RPI_TOKEN
assert(c4rpiToken, 'specify Cloud4RPi Token')

const serviceKey = process.env.SERVICE_KEY
assert(serviceKey, 'specify service key')

async function getSensorValue() {
  const client = new NatureRemo.Cloud(natureRemoToken)

  const allDevices = await client.getDevices()
  const remo = allDevices[0]

  const sensorValue = {
    recorded_at: remo.newest_events.te.created_at,
    temperature: remo.newest_events.te.val,
    humidity: remo.newest_events.hu.val,
    illumination: remo.newest_events.il.val,
    offsets: {
      temperature: remo.temperature_offset,
      humidity: remo.humidity_offset,
    },
  }

  const airconList = await client.listAircon()
  const aircon = airconList[0]
  const airconValue = {
    temperature: Number(aircon.settings.temp, 10),
    mode: aircon.settings.mode,
    speed: Number(aircon.settings.vol),
  }

  return {
    Timestamp: sensorValue.recorded_at,
    Temperature: sensorValue.temperature,
    Humidity: sensorValue.humidity,
    Illumination: sensorValue.illumination,
    AirconTemperature: airconValue.temperature,
    AirconSpeed: airconValue.speed,
    AirconMode: airconValue.mode,
  }
}

async function initDatastore(dataTypes) {
  await fetch(`https://cloud4rpi.io/api/devices/${c4rpiToken}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataTypes),
  })
}

async function sendData(data, timestamp) {
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

const dataTypes = [
  {
    name: 'Temperature',
    type: 'numeric',
  },
  {
    name: 'Humidity',
    type: 'numeric',
  },
  {
    name: 'Illumination',
    type: 'numeric',
  },
]

initDatastore(dataTypes)

const server = micro(async (req, res) => {
  const givenKey = require('url').parse(req.url, true).query.serviceKey
  if (givenKey !== serviceKey) {
    const err = new Error('specify valid service key')
    err.statusCode = 400
    throw err
  }
  try {
    const value = await getSensorValue()
    await sendData(value, value.Timestamp)
  } catch (err) {
    return { error: err.message }
  }
  return { message: 'OK' }
}).listen(process.env.PORT || 3000)
