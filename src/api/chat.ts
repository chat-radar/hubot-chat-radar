import * as Parse from 'parse/node';

class Chat extends Parse.Object {

  static async findByChatId(chatId: string): Promise<Chat> {
    const chats = await (new Parse.Query(Chat)).equalTo('chatId', chatId).find();

    if (chats.length < 1)
      return null;
    return chats[0];
  }

  constructor() {
    super('Chat');
  }

}

export default Chat;
