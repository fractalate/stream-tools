import { ChatMessage, ChatMessageEffect, TwitchChatBot, TwitchChatBotPlugin } from "../../chat"
import { DatabaseAsyncAwait } from "../../db"

export class PointsPlugin extends TwitchChatBotPlugin {
  private bot: TwitchChatBot
  private db: DatabaseAsyncAwait

  constructor(bot: TwitchChatBot, db: DatabaseAsyncAwait) {
    super()

    this.bot = bot
    this.db = db
  }

  async onStreamerChatMessage(message: ChatMessage): Promise<ChatMessageEffect> {
    {
      const m = /^!point +(\w+)$/.exec(message.text)
      if (m) {
        const username = m[1]
        this.bot.sendChatMessage(`point for ${username}`)
        return { claim: true }
      }
    }

    return {}
  }
}

// TODO table structures for points
// TODO function to get points
// TODO function to add point (do it in the db or something)
