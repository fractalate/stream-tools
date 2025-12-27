import { ChatMessage, ChatMessageEffect, TwitchChatBot, TwitchChatBotPlugin } from "../../chat"

export class PluginReflectionsOfMadness extends TwitchChatBotPlugin {
  async onChatMessage(message: ChatMessage): Promise<ChatMessageEffect> {
    return { claim: false } // TODO claim if a game is active
  }
}
