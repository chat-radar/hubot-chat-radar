// Description:
//   Изменение своего города для чата.
//
// Commands:
//   hubot мой город <город> - Изменить свой город

import * as Nominatim from 'nominatim-browser';

class HubotChatRadar {

  protected robot;

  constructor(robot) {
    this.robot = robot;

    this.robot.respond(/(мой город|город|my city|city) (.*)$/i, this.city);
  }

  public city(msg) {
    const cityName = <string>msg.match[2];
    const countryName = 'РФ';

    Nominatim.geocode({ city: cityName, country: countryName }).then((results: Nominatim.NominatimResponse[]) => {
      if (results.length === 0)
        return msg.send('Извините, город не найден. Попробуйте уточнить запрос');
      return results[0];
    }).then((city) => {
      console.log(city);
    }).catch(err => {
      msg.send(err.message);
    });
  }

}

export = (robot) => {
  return new HubotChatRadar(robot);
};
