import * as path from 'path';

export = (robot) => {
  robot.loadFile(path.resolve(__dirname, 'scripts'), 'hubot-chat-radar.js');
};
