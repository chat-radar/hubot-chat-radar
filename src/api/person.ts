import * as Parse from 'parse/node';

class Person extends Parse.Object {

  static async findOrCreate(nickName: string): Promise<Person> {
    const people = await (new Parse.Query(Person)).equalTo('nickname', nickName).find();
    let person = people[0];

    if (person === undefined) {
      person = new Person();
      person.set('nickname', nickName);
      await person.save(null, { useMasterKey: true });
    }

    return person;
  }

  static async updateOnline(nickName: string, online: boolean): Promise<void> {
    const people = await (new Parse.Query(Person)).equalTo('nickname', nickName).find();
    const person = people[0];

    if (person === undefined)
      return null;

    person.set('online', online);
    person.set('lastSeen', new Date());
    await person.save(null, { useMasterKey: true });
  }

  constructor() {
    super('Person');
  }

}

export default Person;
