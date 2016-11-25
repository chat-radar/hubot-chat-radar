import config from './config';
import * as Parse from 'parse/node';
import * as path from 'path';

// initialize API
Parse.initialize(config['parse appId']);
(<any>Parse).serverURL = config['parse serverURL'];

export = (robot) => {
  Parse.User.logIn('chat-radar-chatbot', 'ff8rUsHKg5nP3YjM').then(() => {
    robot.loadFile(path.resolve(__dirname, 'scripts'), 'hubot-chat-radar.js');
  }, (err) => {
    robot.logger.error(err);
  });
};
