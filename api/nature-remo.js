const NatureRemo = require('nature-remo')
const assert = require('assert')

const natureRemoToken = process.env.NATURE_REMO_CLOUD_API_TOKEN
assert(natureRemoToken, 'specify Nature Remo API Token')

async function getSensorValue() {
  const client = new NatureRemo.Cloud(natureRemoToken)

  const allDevices = await client.getDevices()
  const remo = allDevices[0]

  const sensorValue = {
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
    Temperature: sensorValue.temperature,
    Humidity: sensorValue.humidity,
    Illumination: sensorValue.illumination,
    AirconTemperature: airconValue.temperature,
    AirconSpeed: airconValue.speed,
    AirconMode: airconValue.mode,
  }
}

module.exports = {
  getSensorValue,
}
