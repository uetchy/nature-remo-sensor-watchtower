const assert = require('assert')
const { parse } = require('url')
const { getSensorValue } = require('./nature-remo')
const { initDatastore, sendData } = require('./cloud4rpi')

const secretServiceKey = process.env.SERVICE_KEY
assert(secretServiceKey, 'specify service key')

const exposedDataTypes = [
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
initDatastore(exposedDataTypes)

function assertServiceKey(req) {
  const { query } = parse(req.url, true)
  const { serviceKey } = query
  if (serviceKey !== secretServiceKey) {
    const err = new Error('specify valid service key')
    err.statusCode = 400
    throw err
  }
}

module.exports = async (req, res) => {
  assertServiceKey(req)

  try {
    const value = await getSensorValue()

    await sendData(value)

    res.end(JSON.stringify({ message: value }))
  } catch (err) {
    res.end(JSON.stringify({ error: err.message }))
  }
}
