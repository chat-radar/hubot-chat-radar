import * as Nominatim from 'nominatim-browser';
import * as Parse from 'parse/node';

class City extends Parse.Object {

  public static findOrCreate(searchableCity: Nominatim.NominatimResponse) {
    const query = new Parse.Query(City);
    query.equalTo('placeId', parseInt(searchableCity.place_id, 10));

    return query.find().then((results: City[]) => {
      if (results.length < 1) {
        const city = new City();
        city.set('placeId', parseInt(searchableCity.place_id, 10));
        city.set('name', searchableCity.display_name);
        city.set('geo', new Parse.GeoPoint([searchableCity.lat, searchableCity.lon]));
        return city.save();
      }

      return results[0];
    });
  }

  constructor() {
    super('City');
  }

}

export default City;
