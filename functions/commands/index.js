const fs = require('fs');

const Commands = [];

fs.readdirSync(__dirname).forEach((file) => {
  if (file === 'index.js' || !file.endsWith('.js')) return;
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
