// Description:
//   Изменение своего города для чата.
//
// Commands:
//   hubot мой город <город> - Изменить свой город

import { City, Person } from '../api';
import { VisibleError } from '../errors';

class HubotChatRadar {

  protected robot;

  constructor(robot) {
    this.robot = robot;

    this.robot.respond(/(мой город|город|my city|city) (is)? ?(.*)$/i, this.city);
  }

  async city(msg) {
    const cityName = <string>msg.match[3];
    const nickName = msg.envelope.user.name;

    try {
      const cityAddress = await City.fetchAddress(cityName);

      if (cityAddress === null)
        throw new VisibleError('Извините, город не найден. Попробуйте уточнить название');

      const city = await City.findOrCreate(cityAddress);
      const person = await Person.findOrCreate(nickName);

      person.set('city', city);
      person.save();

      msg.reply(`Твой адрес изменен на «${city.get('name')}»`);
    } catch (err) {
      this.robot.logger.error(err);

      if (err instanceof VisibleError)
        return msg.send(err.message);
      msg.send('Произошла ошибка. Попробуйте еще раз');
    }
  }

}

export = (robot) => {
  return new HubotChatRadar(robot);
};
