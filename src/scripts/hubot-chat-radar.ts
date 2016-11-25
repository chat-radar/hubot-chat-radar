// Description:
//   Изменение своего города для чата.
//
// Commands:
//   hubot мой город <город> - Изменить свой город

class HubotChatRadar {

  protected robot;

  constructor(robot) {
    this.robot = robot;

    this.robot.respond(/(мой город|город|my city|city) (.*)$/i, this.city);
  }

  public city(msg) {
    const name = <string>msg.match[2];
    msg.send(name);
  }

}

export = (robot) => {
  return new HubotChatRadar(robot);
};
