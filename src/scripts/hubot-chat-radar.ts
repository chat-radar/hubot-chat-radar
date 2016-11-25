// Description:
//   Изменение своего города для чата.
//
// Commands:
//   hubot мой город <город> - Изменить свой город

import { City, Person } from '../api';
import * as Nominatim from 'nominatim-browser';
// import * as Parse from 'parse/node';

class HubotChatRadar {

  protected robot;

  constructor(robot) {
    this.robot = robot;

    this.robot.respond(/(мой город|город|my city|city) (.*)$/i, this.city);
  }

  public city(msg) {
    const nickname = msg.envelope.user.name;
    const cityName = <string>msg.match[2];
    const countryName = 'РФ';

    Nominatim.geocode({ city: cityName, country: countryName }).then((results: Nominatim.NominatimResponse[]) => {

      if (results.length === 0)
        throw new Error('Извините, город не найден. Попробуйте уточнить запрос');

      return Promise.all([
        City.findOrCreate(results[0]),
        Person.findOrCreate(nickname),
      ]);

    }).then(([city, person]: [City, Person]) => {

      person.set('city', city);

      return Promise.all([
        city,
        person.save(),
      ]);

    }).then(([city]) => {

      msg.reply(`Твой адрес изменен на «${city.get('name')}»`);

    }).catch((err) => {

      this.robot.logger.error(err);
      msg.send(err.message);

    });
  }

}

export = (robot) => {
  return new HubotChatRadar(robot);
};
