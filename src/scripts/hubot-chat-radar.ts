// Description:
//   Изменение своего города для чата.
//
// Commands:
//   hubot мой город <город> - Изменить свой город

import { City, Person } from '../api';
import { VisibleError } from '../errors';
// import * as Parse from 'parse/node';

class HubotChatRadar {

  protected robot;

  constructor(robot) {
    this.robot = robot;

    this.robot.respond(/(мой город|город|my city|city) (is)? ?(.*)$/i, this.handleCity);

    this.robot.enter(this.handleEnter);
    this.robot.leave(this.handleLeave);
  }

  async handleCity(msg) {
    const cityName = <string>msg.match[3];
    const nickName = msg.envelope.user.name;

    try {
      const cityAddress = await City.fetchAddress(cityName);

      if (cityAddress === null)
        throw new VisibleError('Извините, город не найден. Попробуйте уточнить название');

      const city = await City.findOrCreate(cityAddress);
      const person = await Person.findOrCreate(nickName);

      person.set('city', city);
      person.save(null, { useMasterKey: true });
      Person.updateOnline(person.get('nickname'), true);

      msg.reply(`Твой адрес изменен на «${city.get('name')}»`);
    } catch (err) {
      this.robot.logger.error(err);

      if (err instanceof VisibleError)
        return msg.send(err.message);
      msg.send('Произошла ошибка. Попробуйте еще раз');
    }
  }

  async handleEnter(msg) {
    const nickName = msg.envelope.user.name;
    Person.updateOnline(nickName, true);
  }

  async handleLeave(msg) {
    const nickName = msg.envelope.user.name;
    Person.updateOnline(nickName, false);
  }

}

export = (robot) => {
  return new HubotChatRadar(robot);
};
