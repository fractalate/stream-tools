import { ChatMessage, ChatMessageEffect, TwitchChatBot, TwitchChatBotPlugin } from "../../chat"
import { DatabaseAsyncAwait } from "../../db"

const DEBUG_GREETER_PLUGIN = true
const HOURS_BETWEEN_STREAMS = 6

interface ChatMessageDisposition {
  isFirst: boolean
  isFirstThisStream: boolean
}

export class GreeterPlugin extends TwitchChatBotPlugin {
  private bot: TwitchChatBot
  private db: DatabaseAsyncAwait

  constructor(bot: TwitchChatBot, db: DatabaseAsyncAwait) {
    super()

    this.bot = bot
    this.db = db
  }

  async onStreamerChatMessage(message: ChatMessage): Promise<ChatMessageEffect> {
    if (DEBUG_GREETER_PLUGIN) {
      // const greeting = await this.getFirstThisStreamGreeting({
      //   ...message,
      //   chatter_user_login: 'polynomialpossum',
      // })
      const greeting = await this.getFirstGreeting(message)
      this.bot.sendChatMessage(greeting)
    }
    return {}
  }

  async onChatMessage(message: ChatMessage): Promise<ChatMessageEffect> {
    const disposition = await this.getLastChatMessageDisposition(message.chatter_user_login)

    if (disposition.isFirst) {
      const greeting = await this.getFirstGreeting(message)
      this.bot.sendChatMessage(greeting)
    } else if (disposition.isFirstThisStream) {
      const greeting = await this.getFirstThisStreamGreeting(message)
      this.bot.sendChatMessage(greeting)
    }

    return {}
  }

  private async getFirstGreeting(message: ChatMessage): Promise<string> {
    return "Welcome to the stream, " + message.chatter_user_name + "! "
  }

  private async getFirstThisStreamGreeting(message: ChatMessage): Promise<string> {
    const greeting_object: any = await this.db.get_async(`
      SELECT greeting FROM greetings WHERE username = ?
    `, [message.chatter_user_login])

    if (!greeting_object) {
      return "Welcome back to the stream, " + message.chatter_user_name + "!"
    }

    return greeting_object.greeting
  }

  private async getLastChatMessageDisposition(user_login: string): Promise<ChatMessageDisposition> {
    const info: { latest_timestamp?: null | string } = await this.db.get_async(`
      SELECT MAX(timestamp) AS latest_timestamp FROM chats WHERE username = ?
    `, [user_login])

    if (!info || !info.latest_timestamp) {
      return {
        isFirst: true,
        isFirstThisStream: true,
      }
    }

    if (info.latest_timestamp) {
      const when = new Date(info.latest_timestamp)
      const age_hours = (new Date().getTime() - when.getTime()) / 1000 / 60 / 60
      return {
        isFirst: false,
        isFirstThisStream: age_hours >= HOURS_BETWEEN_STREAMS,
      }
    }

    return {
      isFirst: false,
      isFirstThisStream: false,
    }
  }
}
