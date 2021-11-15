const DefaultDevice = require('./default.js');

const memberArmed = 'securitySystemArmed';
const memberArmLevel = 'securitySystemArmLevel';
const memberZone = 'securitySystemZone';
const memberTrouble = 'securitySystemTrouble';
const memberErrorCode = 'securitySystemTroubleCode';
const zoneStateActive = ['ON', 'OPEN'];

class SecuritySystem extends DefaultDevice {
  static get type() {
    return 'action.devices.types.SECURITYSYSTEM';
  }

  static getTraits() {
    return ['action.devices.traits.ArmDisarm', 'action.devices.traits.StatusReport'];
  }

  static get armedMemberName() {
    return memberArmed;
  }

  static get armLevelMemberName() {
    return memberArmLevel;
  }

  static matchesItemType(item) {
    return item.type === 'Group' && Object.keys(this.getMembers(item)).length > 0;
  }

  static getAttributes(item) {
    const config = this.getConfig(item);
    if ('armLevels' in config) {
      const attributes = {
        availableArmLevels: {
          levels: [],
          ordered: config.ordered === true
        }
      };
      attributes.availableArmLevels.levels = config.armLevels
        .split(',')
        .map((level) => level.split('='))
        .map(([levelName, levelSynonym]) => {
          return {
            level_name: levelName,
            level_values: [
              {
                level_synonym: [levelSynonym],
                lang: config.lang || 'en'
              }
            ]
          };
        });
      return attributes;
    }
    return {};
  }

  static getMembers(item) {
    const supportedMembers = [memberArmed, memberArmLevel, memberZone, memberTrouble, memberErrorCode];
    const members = {};
    if (item.members && item.members.length) {
      item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find((m) => member.metadata.ga.value.toLowerCase() === m.toLowerCase());
          if (memberType) {
            const memberDetails = { name: member.name, state: member.state, config: this.getConfig(member) };
            if (memberType === memberZone) {
              members.zones = members.zones || [];
              members.zones.push(memberDetails);
            } else {
              members[memberType] = memberDetails;
            }
          }
        }
      });
    }
    return members;
  }

  static getState(item) {
    const state = {
      isArmed: false
    };

    const members = this.getMembers(item);
    if (memberArmed in members) {
      state.isArmed = members[memberArmed].state === 'ON';
      if (state.isArmed && memberArmLevel in members) {
        state.currentArmLevel = members[memberArmLevel].state;
      }
      state.currentStatusReport = this.getStatusReport(item, members);
    }

    if (this.getConfig(item).inverted === true) {
      state.isArmed = !state.isArmed;
    }

    return state;
  }

  static getStatusReport(item, members) {
    const report = [];
    const isTrouble = memberTrouble in members && members[memberTrouble].state === 'ON';

    if (isTrouble) {
      report.push({
        blocking: false,
        deviceTarget: item.name,
        priority: 0,
        statusCode: (memberErrorCode in members && members[memberErrorCode].state) || 'noIssuesReported'
      });
    }

    if (members.zones) {
      for (const zone of members.zones) {
        if (zoneStateActive.includes(zone.state)) {
          let statusCode = 'notSupported';
          switch (zone.config.zoneType) {
            case 'OpenClose':
              statusCode = 'deviceOpen';
              break;
            case 'Motion':
              statusCode = 'motionDetected';
              break;
          }
          report.push({
            blocking: zone.config.blocking === true,
            deviceTarget: zone.name,
            priority: 1,
            statusCode: statusCode
          });
        }
      }
    }

    return report;
  }
}

module.exports = SecuritySystem;
