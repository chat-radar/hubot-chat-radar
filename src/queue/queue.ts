type PromiseGenerator = { (): Promise<any> };

class Queue {

  protected promise: Promise<any> = Promise.resolve();

  add(promiseGenerator: PromiseGenerator): Promise<any> {
    this.promise = this.promise.then(promiseGenerator, promiseGenerator);
    return this.promise;
  }

}

export default Queue;
