const DefaultDevice = require('./default.js');

class TV extends DefaultDevice {
  static get type() {
    return 'action.devices.types.TV';
  }

  static getTraits(item) {
    const traits = [];
    const members = this.getMembers(item);
    if ('tvPower' in members) traits.push('action.devices.traits.OnOff');
    if ('tvMute' in members || 'tvVolume' in members) traits.push('action.devices.traits.Volume');
    if ('tvChannel' in members) traits.push('action.devices.traits.Channel');
    if ('tvInput' in members) traits.push('action.devices.traits.InputSelector');
    if ('tvTransport' in members) traits.push('action.devices.traits.TransportControl');
    if ('tvApplication' in members) traits.push('action.devices.traits.AppSelector');
    return traits;
  }
  static get requiredItemTypes() {
    return ['Group'];
  }

  static matchesDeviceType(item) {
    return super.matchesDeviceType(item) && Object.keys(this.getMembers(item)).length > 0;
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const members = this.getMembers(item);
    const attributes = {
      volumeCanMuteAndUnmute: 'tvMute' in members
    };
    if ('tvVolume' in members) {
      attributes.volumeMaxLevel = 100;
      if ('volumeMaxLevel' in config) {
        attributes.volumeMaxLevel = Number(config.volumeMaxLevel);
      }
      if ('volumeDefaultPercentage' in config) {
        attributes.volumeDefaultPercentage = Number(config.volumeDefaultPercentage);
      }
      if ('levelStepSize' in config) {
        attributes.levelStepSize = Number(config.levelStepSize);
      }
    }
    if ('tvTransport' in members) {
      attributes.transportControlSupportedCommands = ['NEXT', 'PREVIOUS', 'PAUSE', 'RESUME'];
      if ('transportControlSupportedCommands' in config) {
        attributes.transportControlSupportedCommands = config.transportControlSupportedCommands
          .split(',')
          .map((s) => s.toUpperCase());
      }
    }
    if ('tvInput' in members && 'availableInputs' in config) {
      attributes.availableInputs = [];
      config.availableInputs.split(',').forEach((input) => {
        const [key, synonyms] = input.split('=');
        attributes.availableInputs.push({
          key: key,
          names: [
            {
              name_synonym: synonyms.split(':'),
              lang: config.lang || 'en'
            }
          ]
        });
      });
      attributes.orderedInputs = config.orderedInputs === true;
    }
    if ('tvChannel' in members && 'availableChannels' in config) {
      attributes.availableChannels = [];
      config.availableChannels.split(',').forEach((channel) => {
        const [number, key, names] = channel.split('=');
        attributes.availableChannels.push({
          key: key,
          names: names.split(':'),
          number: number
        });
      });
    }
    if ('tvApplication' in members && 'availableApplications' in config) {
      attributes.availableApplications = [];
      config.availableApplications.split(',').forEach((application) => {
        const [key, synonyms] = application.split('=');
        attributes.availableApplications.push({
          key: key,
          names: [
            {
              name_synonym: synonyms.split(':'),
              lang: config.lang || 'en'
            }
          ]
        });
      });
    }
    return attributes;
  }

  static getState(item) {
    const state = {};
    const members = this.getMembers(item);
    for (const member in members) {
      switch (member) {
        case 'tvPower':
          state.on = members[member].state === 'ON';
          break;
        case 'tvMute':
          state.isMuted = members[member].state === 'ON';
          break;
        case 'tvInput':
          state.currentInput = members[member].state;
          break;
        case 'tvVolume':
          state.currentVolume = Number(members[member].state) || 0;
          break;
        case 'tvChannel':
          state.channelNumber = members[member].state;
          try {
            state.channelName = this.getChannelMap(item)[members[member].state][0];
          } catch (error) {
            //
          }
          break;
        case 'tvApplication':
          state.currentApplication = members[member].state;
      }
    }
    return state;
  }

  static getMembers(item) {
    const supportedMembers = ['tvApplication', 'tvChannel', 'tvVolume', 'tvInput', 'tvTransport', 'tvPower', 'tvMute'];
    const members = Object();
    if (item.members && item.members.length) {
      item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find((m) => member.metadata.ga.value.toLowerCase() === m.toLowerCase());
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
      config.availableChannels.split(',').forEach((channel) => {
        const [number, key, names] = channel.split('=');
        channelMap[number] = [...names.split(':'), key];
      });
    }
    return channelMap;
  }

  static getApplicationMap(item) {
    const config = this.getConfig(item);
    const applicationMap = {};
    if ('availableApplications' in config) {
      config.availableApplications.split(',').forEach((application) => {
        const [key, synonyms] = application.split('=');
        applicationMap[key] = [...synonyms.split(':'), key];
      });
    }
    return applicationMap;
  }
}

module.exports = TV;
