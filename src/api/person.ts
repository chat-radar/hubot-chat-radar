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

  static async updateOnline(query: Person | string, online: boolean): Promise<void> {
    let person: Person;
    if (typeof query === 'string') {
      const people = await (new Parse.Query(Person)).equalTo('nickname', query).find();
      person = people[0];
    } else {
      person = query;
    }

    if (person === undefined)
      return;

    person.set('online', online);
    person.set('lastSeen', new Date());
    await person.save(null, { useMasterKey: true });
  }

  static async resetOnline(): Promise<Person[]> {
    const onlinePeople = await (new Parse.Query(Person)).equalTo('online', true).find();

    return Promise.all(onlinePeople.map((person) => {
      person.set('online', false);
      return person.save(null, { useMasterKey: true });
    }));
  }

  constructor() {
    super('Person');
  }

}

export default Person;
