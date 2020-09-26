const DefaultDevice = require('./default.js');

class TV extends DefaultDevice {
  static get type() {
    return 'action.devices.types.TV';
  }

  static get traits() {
    return [
      'action.devices.traits.OnOff',
      'action.devices.traits.Channel',
      'action.devices.traits.Volume',
      'action.devices.traits.InputSelector',
      'action.devices.traits.TransportControl'
    ];
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const attributes = {
      transportControlSupportedCommands: ['NEXT', 'PREVIOUS', 'PAUSE', 'RESUME']
    };
    if ('transportControlSupportedCommands' in config) {
      attributes.transportControlSupportedCommands = config.transportControlSupportedCommands.split(',').map(s => s.toUpperCase());
    }
    if ('availableInputs' in config) {
      attributes.availableInputs = [];
      config.availableInputs.split(',').forEach(input => {
        const [key, synonyms] = input.split('=');
        attributes.availableInputs.push({
          key: key,
          names: [{
            name_synonym: synonyms.split(':'),
            lang: config.lang || 'en'
          }]
        });
      });
      attributes.orderedInputs = config.orderedInputs === true;
    }
    if ('availableChannels' in config) {
      attributes.availableChannels = [];
      config.availableChannels.split(',').forEach(channel => {
        const [number, key, names] = channel.split('=');
        attributes.availableChannels.push({
          key: key,
          names: names.split(':'),
          number: number
        });
      });
    }
    return attributes;
  }

  static matchesItemType(item) {
    return item.type === 'Group';
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    for (const member in members) {
      switch (member) {
        case 'tvPower':
          state.on = members[member].state === 'ON';
          break;
        case 'tvInput':
          state.currentInput = members[member].state;
          break;
        case 'tvVolume':
          state.currentVolume = Number(members[member].state) || 0;
          state.isMuted = state.currentInput === 0;
          break;
        case 'tvChannel':
          state.channelNumber = members[member].state;
          try {
            state.channelName = this.getChannelMap(item)[members[member].state][0];
          } catch { }
          break;
      }
    }
    return state;
  }

  static getMembers(item) {
    const supportedMembers = [
      'tvChannel',
      'tvVolume',
      'tvInput',
      'tvTransport',
      'tvPower'
    ];
    const members = Object();
    if (item.members && item.members.length) {
      item.members.forEach(member => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find(m => member.metadata.ga.value.toLowerCase() === m.toLowerCase());
          if (memberType) {
            members[memberType] = { name: member.name, state: member.state };
          }
        }
      });
    }
    return members;
  }

  static getChannelMap(item) {
    const config = this.getConfig(item);
    const channelMap = {};
    if ('availableChannels' in config) {
      config.availableChannels.split(',').forEach(channel => {
        const [number, key, names] = channel.split('=');
        channelMap[number] = [...names.split(':'), key];
      });
    }
    return channelMap;
  }
}

module.exports = TV;
