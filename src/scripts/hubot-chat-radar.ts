// Description:
//   Check in on Chat Radar map.
//
// Commands:
//   hubot мой город <город> - Отметить свое местоположение
//   hubot покажи всех - Показать список всех городов
//
// Configuration:
//   PUBLIC_URI
//   PARSE_SERVER_URI
//   PARSE_MASTER_KEY

import { City, Person } from '../api';
import { VisibleError } from '../errors';
// import * as Parse from 'parse/node';
import config from '../config';

class HubotChatRadar {

  static cityRe = '(мой|мое|моё|моя|my)? ?(город|село|деревня|поселок|посёлок|адрес|city) ?(is|:)? ?(.*)$';

  static listAllRe = '(покажи|display|give|get)? ?(a)? ?(список|всех|list|all) ?(пользователей|людей|users|people)?';

  protected robot;

  protected onlineResetPromise: Promise<Person[]> = null;

  constructor(robot) {
    this.robot = robot;

    this.robot.respond(new RegExp(HubotChatRadar.cityRe, 'i'), this.handleCity);
    this.robot.hear(new RegExp('^' + HubotChatRadar.cityRe, 'i'), this.handleCity);
    this.robot.respond(new RegExp(HubotChatRadar.cityRe, 'i'), this.handleListAll);

    this.handleConnected();
    this.robot.adapter.on('reconnected', this.handleConnected);

    this.robot.enter(this.handleEnter);
    this.robot.leave(this.handleLeave);
  }

  async handleCity(msg) {
    const cityName = <string>msg.match[4];
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

      msg.reply(`Теперь твой адрес «${city.get('name')}». Оглянись вокруг ${config['public URI']}/#/${city.id} ;)`);
    } catch (err) {
      this.robot.logger.error(err);

      if (err instanceof VisibleError)
        return msg.send(err.message);
      msg.send('Произошла ошибка. Попробуйте еще раз');
    }
  }

  // TODO: refactor this
  async handleListAll(msg) {
    try {
      const { cities, people } = await City.listAll();

      const lines = cities.map((city) => {
        return city.get('name').split(', ')[0]
          + ': '
          + people.filter((person) => {
            return person.get('city').id === city.id;
          }).map((person) => {
            return person.get('nickname');
          }).join(', ');
      });

      msg.reply('Ответил в привате');

      process.nextTick(() => {
        msg.envelope.user.type = 'chat';
        msg.send(`Карта чата: ${config['public URI']}/\n${lines.join('\n')}`);
      });
    } catch (err) {
      this.robot.logger.error(err);

      if (err instanceof VisibleError)
        return msg.send(err.message);
      msg.send('Произошла ошибка. Попробуйте еще раз');
    }
  }

  async handleEnter(msg) {
    if (this.onlineResetPromise)
      await this.onlineResetPromise;

    const nickName = msg.envelope.user.name;
    try {
      Person.updateOnline(nickName, true);
    } catch (err) {
      this.robot.logger.error(err);
    }
  }

  async handleLeave(msg) {
    if (this.onlineResetPromise)
      await this.onlineResetPromise;

    const nickName = msg.envelope.user.name;
    try {
      Person.updateOnline(nickName, false);
    } catch (err) {
      this.robot.logger.error(err);
    }
  }

  async handleConnected() {
    this.onlineResetPromise = Person.resetOnline();
    try {
      await this.onlineResetPromise;
    } catch (err) {
      this.robot.logger.error(err);
    }
    this.onlineResetPromise = null;
  }

}

export = (robot) => {
  return new HubotChatRadar(robot);
};
