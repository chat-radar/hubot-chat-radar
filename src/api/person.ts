import * as Parse from 'parse/node';

class Person extends Parse.Object {

  static async findOrCreate(nickName: string): Promise<Person> {
    const people = await (new Parse.Query(Person)).equalTo('nickname', nickName).find();
    let person = people[0];

    if (person === undefined) {
      person = new Person();
      person.set('nickname', nickName);
      await person.save();
    }

    return person;
  }

  constructor() {
    super('Person');
  }

}

export default Person;
