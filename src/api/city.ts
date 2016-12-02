import * as Nominatim from 'nominatim-browser';
import * as Parse from 'parse/node';
const wiki = require('wikijs').default;

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
      city.set('force', true);
    }

    if (city.get('force')) {
      city.set('placeId', parseInt(cityAddress.place_id, 10));
      city.set('name', cityAddress.display_name);
      city.set('address', cityAddress.address);
      city.set('geo', new Parse.GeoPoint([cityAddress.lat, cityAddress.lon]));
      city.set('photoUrl', await City.fetchPhoto(cityAddress));
      city.set('force', false);
      await city.save();
    }

    return city;
  }

  static async fetchPhoto(cityAddress: Nominatim.NominatimResponse) {
    const wikiPage = await wiki().page(cityAddress.address.city);

    const info = await wikiPage.info();

    if (!info.image_skyline)
      return null;

    const images = await wikiPage.rawImages();
    const photo = images.find((image) => image.title === `File:${info.image_skyline}`);

    if (!photo || !photo.imageinfo || !photo.imageinfo[0] || !photo.imageinfo[0].url)
      return null;

    return photo.imageinfo[0].url;
  }

  constructor() {
    super('City');
  }

}

export default City;
