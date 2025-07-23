const DefaultDevice = require('./default.js');

class Fan extends DefaultDevice {
  static get type() {
    return 'action.devices.types.FAN';
  }

  static getTraits(item) {
    const traits = [];
    const members = this.getMembers(item);
    const itemType = item.groupType || item.type;
    if (itemType !== 'Group' || 'fanPower' in members) traits.push('action.devices.traits.OnOff');
    if (itemType !== 'Group' || 'fanSpeed' in members) traits.push('action.devices.traits.FanSpeed');
    if ('fanMode' in members) traits.push('action.devices.traits.Modes');
    if ('fanFilterLifeTime' in members || 'fanPM25' in members) traits.push('action.devices.traits.SensorState');
    return traits;
  }

  static get requiredItemTypes() {
    return ['Group', 'Dimmer', 'Number'];
  }

  static matchesDeviceType(item) {
    const itemType = item.groupType || item.type;
    return super.matchesDeviceType(item) && (itemType !== 'Group' || Object.keys(this.getMembers(item)).length > 0);
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    const members = this.getMembers(item);
    const attributes = { supportsFanSpeedPercent: true };
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
    if ('fanMode' in members && config.fanModeName && config.fanModeSettings) {
      const modeNames = config.fanModeName.split(',').map((s) => s.trim());
      attributes.availableModes = [
        {
          name: modeNames[0],
          name_values: [
            {
              name_synonym: modeNames,
              lang: config.lang || 'en'
            }
          ],
          settings: [],
          ordered: config.ordered === true
        }
      ];
      config.fanModeSettings.split(',').forEach((setting) => {
        try {
          const [settingName, settingSynonyms] = setting
            .trim()
            .split('=')
            .map((s) => s.trim());
          attributes.availableModes[0].settings.push({
            setting_name: settingName,
            setting_values: [
              {
                setting_synonym: [settingName].concat(settingSynonyms.split(':').map((s) => s.trim())),
                lang: config.lang || 'en'
              }
            ]
          });
        } catch (error) {
          //
        }
      });
    }
    // Sensors
    if ('fanFilterLifeTime' in members || 'fanPM25' in members) {
      attributes.sensorStatesSupported = [];
      if ('fanFilterLifeTime' in members) {
        attributes.sensorStatesSupported.push({
          name: 'FilterLifeTime',
          descriptiveCapabilities: {
            availableStates: ['new', 'good', 'replace soon', 'replace now']
          },
          numericCapabilities: {
            rawValueUnit: 'PERCENTAGE'
          }
        });
      }
      if ('fanPM25' in members) {
        attributes.sensorStatesSupported.push({
          name: 'PM2.5',
          numericCapabilities: {
            rawValueUnit: 'MICROGRAMS_PER_CUBIC_METER'
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
      const itemState = Math.round(parseFloat(item.state));
      state.currentFanSpeedPercent = itemState;
      state.on = itemState > 0;
      if (config.fanSpeeds) {
        state.currentFanSpeedSetting = itemState.toString();
      }
    } else {
      const members = this.getMembers(item);
      if ('fanSpeed' in members) {
        const itemState = Math.round(parseFloat(members.fanSpeed.state));
        state.on = itemState > 0;
        state.currentFanSpeedPercent = itemState;
        if (config.fanSpeeds) {
          state.currentFanSpeedSetting = itemState.toString();
        }
      }
      if ('fanPower' in members) {
        state.on = members.fanPower.state === 'ON';
      }
      if ('fanMode' in members && config.fanModeName && config.fanModeSettings) {
        const modeNames = config.fanModeName.split(',').map((s) => s.trim());
        state.currentModeSettings = {
          [modeNames[0]]: members.fanMode.state
        };
      }
      // Sensors
      if ('fanFilterLifeTime' in members || 'fanPM25' in members) {
        state.currentSensorStateData = [];
        if ('fanFilterLifeTime' in members) {
          const itemState = parseFloat(members.fanFilterLifeTime.state);
          state.currentSensorStateData.push({
            name: 'FilterLifeTime',
            currentSensorState: this.translateFilterLifeTime(itemState),
            rawValue: itemState
          });
        }
        if ('fanPM25' in members) {
          state.currentSensorStateData.push({
            name: 'PM2.5',
            rawValue: parseFloat(members.fanPM25.state)
          });
        }
      }
    }
    return state;
  }

  static get supportedMembers() {
    return [
      { name: 'fanPower', types: ['Switch'] },
      { name: 'fanSpeed', types: ['Dimmer', 'Number'] },
      { name: 'fanMode', types: ['Number', 'String'] },
      { name: 'fanFilterLifeTime', types: ['Number'] },
      { name: 'fanPM25', types: ['Number'] }
    ];
  }

  static translateFilterLifeTime(state) {
    const map = [
      { value: 'new', threshold: 90 },
      { value: 'good', threshold: 20 },
      { value: 'replace soon', threshold: 10 },
      { value: 'replace now', threshold: 0 }
    ];
    for (const entry of map) {
      if (state >= entry.threshold) return entry.value;
    }
    return 'unknown';
  }
}

module.exports = Fan;
