import config from './config';
import * as Parse from 'parse/node';
import * as path from 'path';

// initialize API
Parse.initialize(config['parse appId']);
(<any>Parse).serverURL = config['parse serverURL'];

export = (robot) => {
  robot.loadFile(path.resolve(__dirname, 'scripts'), 'hubot-chat-radar.js');
};
