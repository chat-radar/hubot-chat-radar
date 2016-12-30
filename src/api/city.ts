import * as Nominatim from 'nominatim-browser';
import * as Parse from 'parse/node';
import Person from './person';
import Chat from './chat';
import * as axios from 'axios';
import cache from '../cache';
const wdk = require('wikidata-sdk'); // tslint:disable-line

class City extends Parse.Object {

  static async fetchAddress(query: string): Promise<Nominatim.NominatimResponse> {
    let city;
    const cacheKey = `cityAddress:${query.toLowerCase()}`;

    city = cache.get(cacheKey);
    if (city !== undefined)
      return city;

    const cities = await Nominatim.geocode({
      q: query,
      addressdetails: true,
      extratags: true,
      limit: 1,
      featuretype: 'city',
    });

    city = (cities.length > 0) ? cities[0] : null;

    cache.set(cacheKey, city);

    return city;
  }

  static async findOrCreate(cityAddress: Nominatim.NominatimResponse): Promise<City> {
    const cities = await (new Parse.Query(City)).equalTo('placeId', parseInt(cityAddress.place_id, 10)).find();
    let city = cities[0];

    if (city === undefined) {
      city = new City();
      city.set('force', true);
    }

    if (city.get('force')) {
      city.set('placeId', parseInt(cityAddress.place_id, 10));
      city.set('name', cityAddress.display_name);
      city.set('address', cityAddress.address);
      city.set('geo', new Parse.GeoPoint([cityAddress.lat, cityAddress.lon]));
      if (cityAddress.extratags && cityAddress.extratags.wikipedia) {
        const info = await this.fetchInfo(cityAddress.extratags.wikipedia);
        city.set('photoUrl', info.photoUrl);
        city.set('timeZone', info.timeZone);
        city.set('inception', info.inception);
        city.set('area', info.area);
        city.set('population', info.population);
      }
      city.set('force', false);
      await city.save(null, { useMasterKey: true });
    }

    return city;
  }

  static async fetchInfo(wikipedia: string) {
    const [lang, label] = wikipedia.split(':');
    const url = wdk.sparqlQuery(`
      SELECT ?photoUrl ?timeZoneLabel ?inception ?area ?population WHERE {
        ?city rdfs:label "${label}"@${lang} .
        OPTIONAL {
          ?city wdt:P18 ?photoUrl .
        }
        OPTIONAL {
          ?city wdt:P421 ?timeZone .
        }
        OPTIONAL {
          ?city wdt:P571 ?inception .
        }
        OPTIONAL {
          ?city wdt:P2046 ?area .
        }
        OPTIONAL {
          ?city wdt:P1082 ?population .
        }
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "${lang}" .
        }
      }
      LIMIT 1
    `);

    const response = await axios(url);

    const bindings = (<any>response.data).results.bindings[0] || {};
    const values: any = Object.keys(bindings).reduce((previous, current) => {
      previous[current] = bindings[current].value;
      return previous;
    }, {});

    return {
      photoUrl: (values.photoUrl ? values.photoUrl : null),
      timeZone: (/^UTC(\+|\-|\−){1}[0-9]{1,2}:?[0-9]{0,2}$/.test(values.timeZoneLabel) ? values.timeZoneLabel.replace('−', '-') : null), // tslint:disable-line
      inception: (values.inception ? new Date(values.inception) : null),
      area: (values.area ? parseFloat(values.area) : null),
      population: (values.population ? parseInt(values.population, 10) : null),
    };
  }

  static async listAll(chat: Chat) {
    const people = await (new Parse.Query(Person))
      .equalTo('chat', chat)
      .find();
    const cities = await (new Parse.Query(City))
      .ascending('name')
      .containedIn('objectId', people.map((person) => person.get('city').id))
      .find();

    return { cities, people };
  }

  constructor() {
    super('City');
  }

}

export default City;
