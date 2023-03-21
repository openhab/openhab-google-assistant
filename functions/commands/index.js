const glob = require('glob');

const Commands = [];

glob.sync('./!(index).js', { cwd: __dirname }).forEach((file) => {
  const command = require(`./${file}`);
  if (command.type) {
    Commands.push(command);
  }
});

module.exports = {
  /**
   * @param {string} command
   * @param {object} params
   */
  getCommandType: (command, params) => {
    return Commands.find((commandType) => command === commandType.type && commandType.validateParams(params));
  }
};
