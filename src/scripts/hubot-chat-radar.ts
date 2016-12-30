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

import { City, Person, Chat } from '../api';
import { Queue } from '../queue';
import { VisibleError } from '../errors';
import config from '../config';
import { parseName, getCity } from '../utils';

class HubotChatRadar {

  protected robot;

  protected statusQueue: Queue;

  constructor(robot) {
    this.robot = robot;
    this.statusQueue = new Queue();

    this.handleConnected();
    this.robot.adapter.on('reconnected', this.handleConnected.bind(this));

    this.robot.respond(/(мой|мое|моё|моя|my)? ?(город|село|деревня|поселок|посёлок|адрес|city) ?(is|:)? ?(.*)$/i, this.handleCity.bind(this)); // tslint:disable-line
    this.robot.respond(/(покажи|display|give|get)? ?(a)? ?(список|всех|list|all) ?(пользователей|людей|users|people)?/i, this.handleListAll.bind(this)); // tslint:disable-line

    this.robot.enter(this.handleEnter.bind(this));
    this.robot.leave(this.handleLeave.bind(this));
  }

  protected async handleCity(msg) {
    try {
      const cityName = <string>msg.match[4];
      const { nickname } = parseName(msg.envelope.user.name);
      const room = <string>msg.envelope.room;

      // chat not found
      if (!room)
        throw new VisibleError('Извините, чат не найден');

      // chat not registered
      const chat = await Chat.findByChatId(room);
      if (chat === null)
        throw new VisibleError(`Извините, чат ${room} не зарегистрирован`);

      // city doesn't exist on the Earth :)
      const cityAddress = await City.fetchAddress(cityName);
      if (cityAddress === null)
        throw new VisibleError('Извините, город не найден. Попробуйте уточнить название');

      const city = await City.findOrCreate(cityAddress);

      const person = await Person.findOrCreate({ nickname }, chat);

      person.set('city', city);
      person.save(null, { useMasterKey: true });
      this.statusQueue.add(Person.updateOnline.bind(null, person, true));

      // address changed
      msg.reply(`Теперь твой адрес «${city.get('name')}». Оглянись вокруг ${config['public URI']}/#/${city.id} ;)`);
    } catch (err) {
      this.robot.logger.error(err);

      // report error
      if (err instanceof VisibleError)
        return msg.send(err.message);
      msg.send('Произошла ошибка. Попробуйте еще раз');
    }
  }

  protected async handleListAll(msg) {
    try {
      const room = <string>msg.envelope.room;

      // chat not found
      if (!room)
        throw new VisibleError('Извините, чат не найден');

      // chat not registered
      const chat = await Chat.findByChatId(room);
      if (chat === null)
        throw new VisibleError(`Извините, чат ${room} не зарегистрирован`);

      const { cities, people } = await City.listAll(chat);

      let text = '';
      text += `Карта чата: ${config['public URI']}/#/${chat.id}`;
      text += '\n\n';
      text += cities.map((city) => {
        const inCity = people.filter((person) => person.get('city').id === city.id);
        return { city, inCity };
      }).map(({ city, inCity }) => {
        const cityName = getCity(city.get('address'), city.get('name'));
        const inCityNames = inCity.map((person) => person.get('nickname')).join(', ');
        return `${cityName}: ${inCityNames}`;
      }).join('\n');

      msg.send(text);
    } catch (err) {
      this.robot.logger.error(err);

      if (err instanceof VisibleError)
        return msg.send(err.message);
      msg.send('Произошла ошибка. Попробуйте еще раз');
    }
  }

  protected async handleEnter(msg) {
    try {
      let person: Person;
      const { nickname, cityName } = parseName(msg.envelope.user.name);
      const room = <string>msg.envelope.room;

      if (!room)
        return;

      const chat = await Chat.findByChatId(room);
      if (chat === null)
        return;

      // parse city from nickname and update
      if (cityName !== null) {
        const cityAddress = await City.fetchAddress(cityName);

        const city = await City.findOrCreate(cityAddress);
        person = await Person.findOrCreate({ nickname }, chat);

        person.set('city', city);
        person.save(null, { useMasterKey: true });
      }

      this.statusQueue.add(Person.updateOnline.bind(null, person || { nickname }, true));
    } catch (err) {
      this.robot.logger.error(err);
    }
  }

  protected async handleLeave(msg) {
    try {
      const { nickname } = parseName(msg.envelope.user.name);
      this.statusQueue.add(Person.updateOnline.bind(null, { nickname }, false));
    } catch (err) {
      this.robot.logger.error(err);
    }
  }

  protected async handleConnected() {
    try {
      this.statusQueue.add(Person.resetOnline);
    } catch (err) {
      this.robot.logger.error(err);
    }
  }

}

export = (robot) => {
  return new HubotChatRadar(robot);
};
