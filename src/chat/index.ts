import WebSocket from 'ws'
import { DatabaseAsyncAwait } from '../db'

const EVENTSUB_WEBSOCKET_URL = 'wss://eventsub.wss.twitch.tv/ws'

export class TwitchChatBot {
  private db: DatabaseAsyncAwait
  private oauthToken: string
  private clientID: string
  private channelOwnerUserID: string
  private botUserID: string
  private websocketSessionID: null | string
  private websocketClient: null | WebSocket

  constructor({db, oauthToken, clientID, channelOwnerUserID, botUserID} : {db: DatabaseAsyncAwait, oauthToken: string, clientID: string, channelOwnerUserID: string, botUserID: string}) {
    this.db = db
    this.oauthToken = oauthToken
    this.clientID = clientID
    this.channelOwnerUserID = channelOwnerUserID
    this.botUserID = botUserID
    this.websocketSessionID = null
    this.websocketClient = null
  }

  async start() {
    if (await this.checkAuth()) {
      this.websocketClient = this.startWebSocketClient()
    }
  }

  private async checkAuth() {
    // https://dev.twitch.tv/docs/authentication/validate-tokens/#how-to-validate-a-token
    let response = await fetch('https://id.twitch.tv/oauth2/validate', {
      method: 'GET',
      headers: {
        'Authorization': 'OAuth ' + this.oauthToken
      }
    })
  
    if (response.status != 200) {
      let data = await response.json()
      console.error('Token is not valid. /oauth2/validate returned status code ' + response.status)
      console.error(data)
      return false
    }
  
    console.log('Validated token.')

    return true
  }

  private startWebSocketClient() {
    let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL)
  
    websocketClient.on('error', console.error)
  
    websocketClient.on('open', () => {
      console.log('WebSocket connection opened to ' + EVENTSUB_WEBSOCKET_URL)
    })
  
    websocketClient.on('message', (data) => {
      this.handleWebSocketMessage(JSON.parse(data.toString()))
    })
  
    return websocketClient
  }
  
  private handleWebSocketMessage(data: any) {
    switch (data.metadata.message_type) {
      // After connecting, 'session_welcome' is received.
      case 'session_welcome':
        this.websocketSessionID = data.payload.session.id
        this.registerEventSubListeners()
        break
      case 'notification':
        switch (data.metadata.subscription_type) {
          case 'channel.chat.message':
            (async () => {
              await this.db.run_async(
                `INSERT INTO chats(timestamp, username, message, payload) VALUES(?,?,?,?)`,
                new Date().toISOString(),
                data.payload.event.chatter_user_login,
                data.payload.event.message.text,
                JSON.stringify(data.payload),
              )
            })()
            
            console.log(`MSG #${data.payload.event.broadcaster_user_login} <${data.payload.event.chatter_user_login}> ${data.payload.event.message.text}`)

            // okay, do something great!
  
            break
        }
        break
    }
  }

  private async registerEventSubListeners() {
    // Register channel.chat.message
    console.log(`Subscribing to channel ${JSON.stringify(this.channelOwnerUserID)} as ${JSON.stringify(this.botUserID)}...`)
    let response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.oauthToken,
        'Client-Id': this.clientID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'channel.chat.message',
        version: '1',
        condition: {
          broadcaster_user_id: this.channelOwnerUserID,
          user_id: this.botUserID,
        },
        transport: {
          method: 'websocket',
          session_id: this.websocketSessionID,
        }
      })
    })
  
    if (response.status != 202) {
      let data = await response.json()
      console.error('Failed to subscribe to channel.chat.message. API call returned status code ' + response.status)
      console.error(data)
      process.exit(1)
    } else {
      const data = await response.json()
      console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`)
    }
  }

  private async sendChatMessage(chatMessage: string) {
    let response = await fetch('https://api.twitch.tv/helix/chat/messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.oauthToken,
        'Client-Id': this.clientID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        broadcaster_id: this.channelOwnerUserID,
        sender_id: this.botUserID,
        message: chatMessage
      })
    })
  
    if (response.status != 200) {
      let data = await response.json()
      console.error('Failed to send chat message')
      console.error(data)
    } else {
      console.log('Sent chat message: ' + chatMessage)
    }
  }  
}
