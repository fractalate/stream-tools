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
        const newPoints = await this.givePoint(username)
        this.bot.sendChatMessage(`${username} now has ${newPoints} point${newPoints == 1 ? "" : "s"}!`)
        return { claim: true }
      }
    }

    {
      const m = /^!points +(\w+)$/.exec(message.text)
      if (m) {
        const username = m[1]
        const points = await this.getPoints(username)
        this.bot.sendChatMessage(`${username} has ${points} point${points == 1 ? "" : "s"}!`)
        return { claim: true }
      }
    }

    {
      const m = /^!points$/.exec(message.text)
      if (m) {
        const username = message.chatter_user_name
        const points = await this.getPoints(username)
        this.bot.sendChatMessage(`${username} has ${points} point${points == 1 ? "" : "s"}!`)
        return { claim: true }
      }
    }

    return {}
  }

  async getPoints(username: string): Promise<number> {
    const info: { points?: null | number } = await this.db.get_async(`
      SELECT points FROM points WHERE LOWER(username) = LOWER(?)
    `, [username])
    return info?.points == null ? 0 : info.points
  }

  async givePoint(username: string): Promise<number> {
    await this.db.run_async(`
      INSERT INTO point_events(timestamp, username, points)
        VALUES(?, ?, 1)
    `, [
      new Date().toISOString(),
      username,
    ])

    const tabulation: { points?: null | number } = await this.db.get_async(`
      SELECT SUM(points) AS points FROM point_events WHERE LOWER(username) = LOWER(?)
    `, [username])
    const newPoints = tabulation?.points == null ? 0 : tabulation.points

    await this.db.run_async(`
      INSERT INTO points(username, points) VALUES(?, ?)
        ON CONFLICT(username) DO UPDATE SET points = excluded.points
    `, [username, newPoints])

    return newPoints
  }
}
