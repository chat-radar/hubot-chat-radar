import config from './config';
import * as Parse from 'parse/node';
import cache from './cache';
import * as path from 'path';

export = (robot) => {
  // initialize API
  Parse.initialize(config['parse appId']);
  (<any>Parse).serverURL = config['parse serverURI'];
  (<any>Parse).masterKey = config['parse masterKey'];

  // initialize cache
  cache.initialize(robot);

  robot.loadFile(path.resolve(__dirname, 'scripts'), 'hubot-chat-radar.js');
};
