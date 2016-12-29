type PromiseGenerator = { (): Promise<any> };

class Queue {

  protected promise: Promise<any> = Promise.resolve();

  add(promiseGenerator: PromiseGenerator) {
    this.promise = this.promise.then(promiseGenerator);
  }

}

export default Queue;
