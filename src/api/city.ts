import * as Nominatim from 'nominatim-browser';
import * as Parse from 'parse/node';

class City extends Parse.Object {

  static async fetchAddress(cityName: string): Promise<Nominatim.NominatimResponse> {
    const cities = await Nominatim.geocode({
      city: cityName,
      addressdetails: true,
      limit: 1,
    });

    if (cities.length < 1)
      return null;
    return cities[0];
  }

  static async findOrCreate(cityAddress: Nominatim.NominatimResponse): Promise<City> {
    const cities = await (new Parse.Query(City)).equalTo('placeId', parseInt(cityAddress.place_id, 10)).find();
    let city = cities[0];

    if (city === undefined) {
      city = new City();
      city.set('placeId', parseInt(cityAddress.place_id, 10));
      city.set('name', cityAddress.display_name);
      city.set('address', cityAddress.address);
      city.set('geo', new Parse.GeoPoint([cityAddress.lat, cityAddress.lon]));
      await city.save();
    }

    return city;
  }

  constructor() {
    super('City');
  }

}

export default City;
