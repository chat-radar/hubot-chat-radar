import * as Parse from 'parse/node';
import Chat from './chat';

type PersonQuery = { nickname: string };

class Person extends Parse.Object {

  static async findOrCreate(query: PersonQuery, chat: Chat): Promise<Person> {
    const people = await (new Parse.Query(Person))
      .equalTo('nickname', query.nickname)
      .equalTo('chat', chat)
      .find();

    let person = people[0];

    if (person === undefined) {
      person = new Person();
      person.set('nickname', query.nickname);
      person.set('chat', chat);
      await person.save(null, { useMasterKey: true });
    }

    return person;
  }

  static async updateOnline(query: Person | PersonQuery, online: boolean): Promise<void> {
    let person: Person;
    if ((<PersonQuery>query).nickname !== undefined) {
      const people = await (new Parse.Query(Person)).equalTo('nickname', (<PersonQuery>query).nickname).find();
      person = people[0];
    } else {
      person = <Person>query;
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
