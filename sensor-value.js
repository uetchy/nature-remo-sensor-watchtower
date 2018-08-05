const NatureRemo = require('nature-remo')
const fs = require('fs')
const csvWriter = require('csv-write-stream')

async function getSensorValue() {
  const client = new NatureRemo.Cloud(process.env.NATURE_REMO_CLOUD_API_TOKEN)

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
  // console.log(JSON.stringify(sensorValue, null, 2))

  const airconList = await client.listAircon()
  const aircon = airconList[0]
  const airconValue = {
    temperature: Number(aircon.settings.temp, 10),
    mode: aircon.settings.mode,
    speed: Number(aircon.settings.vol),
  }
  // console.log(JSON.stringify(airconValue, null, 2))

  return {
    recorded_at: sensorValue.recorded_at,
    room_temperature: sensorValue.temperature,
    room_humidity: sensorValue.humidity,
    aircon_temperature: airconValue.temperature,
    aircon_speed: airconValue.speed,
    aircon_mode: airconValue.mode,
  }
}

async function saveSensorValue() {
  const writer = csvWriter()
  writer.pipe(
    fs.createWriteStream('./sensor.csv', {
      encoding: 'utf8',
      flags: 'a',
    })
  )
  const value = await getSensorValue()
  writer.write(value)
  writer.end()
  console.log(
    'Record(',
    value.recorded_at,
    '):',
    value.room_temperature,
    value.aircon_temperature
  )
}

console.log('Start collecting sensor data ...')
saveSensorValue()
setInterval(saveSensorValue, 60 * 1000)
