import config from './config';
import * as Parse from 'parse/node';
import * as path from 'path';

export = (robot) => {
  // initialize API
  Parse.initialize(config['parse appId']);
  (<any>Parse).serverURL = config['parse serverURI'];
  (<any>Parse).masterKey = config['parse masterKey'];

  robot.loadFile(path.resolve(__dirname, 'scripts'), 'hubot-chat-radar.js');
};
