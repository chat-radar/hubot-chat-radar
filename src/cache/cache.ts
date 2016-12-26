class Cache {

  protected robot;

  get(key: string): any {
    const value = this.robot.brain.get(key);

    if (value === null)
      return undefined;

    if (value === 'null')
      return null;

    return value;
  }

  set(key: string, value: any) {
    if (value === null)
      return this.robot.brain.set(key, 'null');
    return this.robot.brain.set(key, value);
  }

  initialize(robot) {
    this.robot = robot;
  }
}

export default Cache;
