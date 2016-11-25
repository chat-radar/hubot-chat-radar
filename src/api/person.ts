import * as Parse from 'parse/node';

class Person extends Parse.Object {

  public static findOrCreate(nickname: string) {
    const query = new Parse.Query(Person);
    query.equalTo('nickname', nickname);

    return query.find().then((results: Person[]) => {
      if (results.length < 1) {
        const city = new Person();
        city.set('nickname', nickname);
        return city.save();
      }

      return results[0];
    });
  }

  constructor() {
    super('Person');
  }

}

export default Person;
