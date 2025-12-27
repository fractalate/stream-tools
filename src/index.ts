import dotenv from 'dotenv'
import express from 'express'
import proxy from 'express-http-proxy'
import { createServer } from 'http'
import setUpDatabase from './db'
import setUpApi from './routes/api'
import setUpSocket from './socket'
import { TwitchChatBot } from './chat'
import { PluginReflectionsOfMadness } from './plugins/reflections_of_madness'
import { GreeterPlugin } from './plugins/greeter'

dotenv.config()

function getListenPort(env_name: string, fallback: number) {
  const text = process.env[env_name]
  if (text != null) {
    const value = parseInt(text)
    if (String(value) != text) {
      throw new Error('Invalid port number: ' + JSON.stringify(text))
    }
    return value
  }
  return fallback
}

const LISTEN_PORT = getListenPort('LISTEN_PORT', 3000)
const LISTEN_HOST = process.env.LISTEN_HOST || '127.0.0.1'
const VITE_DEV_PORT = getListenPort('VITE_DEV_PORT', 9999)

const TWITCH_CHAT_BOT_OAUTH_TOKEN = process.env.TWITCH_CHAT_BOT_OAUTH_TOKEN || ''
const TWITCH_CHAT_BOT_CLIENT_ID = process.env.TWITCH_CHAT_BOT_CLIENT_ID || ''
const TWITCH_CHAT_BOT_CHANNEL_OWNER_ID = process.env.TWITCH_CHAT_BOT_CHANNEL_OWNER_ID || ''
const TWITCH_CHAT_BOT_USER_ID = process.env.TWITCH_CHAT_BOT_USER_ID || ''

async function main() {
  const app = express()
  const server = createServer(app)
  
  const db = await setUpDatabase()
  setUpSocket(server, db)
  setUpApi(app, db)

  if (TWITCH_CHAT_BOT_OAUTH_TOKEN && TWITCH_CHAT_BOT_CLIENT_ID && TWITCH_CHAT_BOT_CHANNEL_OWNER_ID && TWITCH_CHAT_BOT_USER_ID) {
    console.log('Starting chat bot...')
    const bot = new TwitchChatBot({
      db: db,
      oauthToken: TWITCH_CHAT_BOT_OAUTH_TOKEN,
      clientID: TWITCH_CHAT_BOT_CLIENT_ID,
      channelOwnerUserID: TWITCH_CHAT_BOT_CHANNEL_OWNER_ID,
      botUserID: TWITCH_CHAT_BOT_USER_ID,
    })
    bot.addPlugin(new GreeterPlugin(bot, db))
    bot.addPlugin(new PluginReflectionsOfMadness())
    bot.start()
  } else {
    console.log('Not starting chat bot. Environment variables are missing.')
  }
  
  // Proxy web requests to the Vite dev server.
  if (process.env.DEV_CLIENT_SERVER) {
    app.use(proxy(`http://localhost:${VITE_DEV_PORT}`))
  }
  
  server.listen(LISTEN_PORT, LISTEN_HOST, () => {
    console.log(`Listening on ${LISTEN_HOST}:${LISTEN_PORT}`)
    console.log(`http://localhost:${LISTEN_PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
