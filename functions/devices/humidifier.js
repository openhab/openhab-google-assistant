const DefaultDevice = require('./default.js');

class Humidifier extends DefaultDevice {
  static get type() {
    return 'action.devices.types.HUMIDIFIER';
  }

  static getTraits(item) {
    const members = this.getMembers(item);
    const itemType = item.groupType || item.type;
    const traits = ['action.devices.traits.OnOff'];

    // HumiditySetting trait - only for devices that can control humidity levels
    if (itemType === 'Dimmer' || itemType === 'Number' || 'humidifierHumiditySetpoint' in members) {
      traits.push('action.devices.traits.HumiditySetting');
    }

    // FanSpeed trait - recommended for humidifiers with fan speed control
    if ('humidifierFanSpeed' in members) {
      traits.push('action.devices.traits.FanSpeed');
    }

    return traits;
  }

  static get requiredItemTypes() {
    return ['Group', 'Switch', 'Dimmer', 'Number'];
  }

  static matchesDeviceType(item) {
    const itemType = item.groupType || item.type;
    return super.matchesDeviceType(item) && (itemType !== 'Group' || Object.keys(this.getMembers(item)).length > 0);
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const members = this.getMembers(item);
    const itemType = item.groupType || item.type;
    const attributes = {};

    // HumiditySetting attributes - only for devices that can control humidity levels
    if (itemType === 'Dimmer' || itemType === 'Number' || 'humidifierHumiditySetpoint' in members) {
      attributes.humiditySetpointRange = {
        minPercent: (config.humidityRange && parseInt(config.humidityRange.split(',')[0])) || 0,
        maxPercent: (config.humidityRange && parseInt(config.humidityRange.split(',')[1])) || 100
      };
    }

    // FanSpeed attributes if fan speed control is available
    if ('humidifierFanSpeed' in members) {
      attributes.supportsFanSpeedPercent = true;
      if (config.fanSpeeds) {
        attributes.availableFanSpeeds = {
          speeds: [],
          ordered: config.ordered === true
        };
        config.fanSpeeds.split(',').forEach((speedEntry) => {
          try {
            const [speedName, speedSynonyms] = speedEntry
              .trim()
              .split('=')
              .map((s) => s.trim());
            attributes.availableFanSpeeds.speeds.push({
              speed_name: speedName,
              speed_values: [
                {
                  speed_synonym: speedSynonyms.split(':').map((s) => s.trim()),
                  lang: config.lang || 'en'
                }
              ]
            });
          } catch (error) {
            //
          }
        });
      }
    }

    return attributes;
  }

  static getState(item) {
    const config = this.getConfig(item);
    const itemType = item.groupType || item.type;
    const state = {};

    if (itemType !== 'Group') {
      // Simple humidifier device (single item)
      if (itemType === 'Switch') {
        state.on = item.state === 'ON';
      } else if (itemType === 'Dimmer' || itemType === 'Number') {
        const itemState = Math.round(parseFloat(item.state));
        state.on = itemState > 0;
        state.humiditySetpointPercent = itemState;
      }
    } else {
      // Group-based humidifier with members
      const members = this.getMembers(item);

      // Power state
      if ('humidifierPower' in members) {
        state.on = members.humidifierPower.state === 'ON';
      }

      // Humidity setpoint
      if ('humidifierHumiditySetpoint' in members) {
        const maxHumidity = parseInt(config.maxHumidity) || 100;
        const humidity = Math.round(parseFloat(members.humidifierHumiditySetpoint.state) * (100 / maxHumidity));
        state.humiditySetpointPercent = humidity;
      }

      // Ambient humidity (read-only)
      if ('humidifierHumidityAmbient' in members) {
        const maxHumidity = parseInt(config.maxHumidity) || 100;
        const humidity = Math.round(parseFloat(members.humidifierHumidityAmbient.state) * (100 / maxHumidity));
        state.humidityAmbientPercent = humidity;
      }

      // Fan speed
      if ('humidifierFanSpeed' in members) {
        const fanSpeed = Math.round(parseFloat(members.humidifierFanSpeed.state));
        state.currentFanSpeedPercent = fanSpeed;
        if (config.fanSpeeds) {
          state.currentFanSpeedSetting = fanSpeed.toString();
        }
      }
    }

    return state;
  }

  static getMetadata(item) {
    const metadata = super.getMetadata(item);
    const config = this.getConfig(item);

    // Copy maxHumidity config to customData for efficient access in commands
    if (config.maxHumidity) {
      metadata.customData.maxHumidity = parseInt(config.maxHumidity);
    }

    return metadata;
  }

  static get supportedMembers() {
    return [
      { name: 'humidifierPower', types: ['Switch'] },
      { name: 'humidifierHumiditySetpoint', types: ['Number', 'Dimmer'] },
      { name: 'humidifierHumidityAmbient', types: ['Number'] },
      { name: 'humidifierFanSpeed', types: ['Number', 'Dimmer'] }
    ];
  }
}

module.exports = Humidifier;
