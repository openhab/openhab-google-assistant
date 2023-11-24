const DefaultDevice = require('./default.js');

class TV extends DefaultDevice {
  static get type() {
    return 'action.devices.types.TV';
  }

  static getTraits(item) {
    const traits = [
      'action.devices.traits.AppSelector',
      'action.devices.traits.InputSelector',
      'action.devices.traits.MediaState',
      'action.devices.traits.OnOff',
      'action.devices.traits.TransportControl',
      'action.devices.traits.Volume'
    ];
    const members = this.getMembers(item);
    if ('tvChannel' in members) traits.push('action.devices.traits.Channel');
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
      availableApplications: [],
      availableInputs: [],
      transportControlSupportedCommands: [],
      volumeMaxLevel: 100,
      volumeCanMuteAndUnmute: 'tvMute' in members
    };
    if ('tvVolume' in members) {
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
      attributes.supportPlaybackState = true;
      attributes.transportControlSupportedCommands = ['NEXT', 'PREVIOUS', 'PAUSE', 'RESUME'];
      if ('transportControlSupportedCommands' in config) {
        attributes.transportControlSupportedCommands = config.transportControlSupportedCommands
          .split(',')
          .map((s) => s.toUpperCase());
      }
    }
    if ('tvInput' in members && 'availableInputs' in config) {
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
        case 'tvTransport':
          state.playbackState = members[member].state;
          break;
        case 'tvVolume':
          state.currentVolume = Math.round(Number(members[member].state)) || 0;
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

  static get supportedMembers() {
    return [
      { name: 'tvApplication', types: ['Number', 'String'] },
      { name: 'tvChannel', types: ['Number', 'String'] },
      { name: 'tvVolume', types: ['Number', 'Dimmer'] },
      { name: 'tvInput', types: ['Number', 'String'] },
      { name: 'tvTransport', types: ['Player'] },
      { name: 'tvPower', types: ['Switch'] },
      { name: 'tvMute', types: ['Switch'] }
    ];
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
