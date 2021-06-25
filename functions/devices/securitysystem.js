const DefaultDevice = require('./default.js');

const configLang = 'lang';
const configOrdered = 'ordered';
const configArmLevels = 'armLevels';

const zoneTypeOpenClose = 'OpenClose';
const zoneTypeMotion = 'Motion';
const zoneConfigBlocking = 'blocking';
const zoneConfigType = 'zoneType';

const memberArmed = 'securitySystemArmed';
const memberArmLevel = 'securitySystemArmLevel';
const memberZone = 'securitySystemZone';
const memberTrouble = 'securitySystemTrouble';
const memberErrorCode = 'securitySystemTroubleCode';

const supportedMembers = [memberArmed, memberArmLevel, memberZone, memberTrouble, memberErrorCode];

const errorNotSupported = 'notSupported';
const errorDeviceOpen = 'deviceOpen';
const errorMotionDetected = 'motionDetected';

const defaultLanguage = 'en';

const stateSwitchActive = 'ON';
const stateContactActive = 'OPEN';

const zoneStateActive = [stateSwitchActive, stateContactActive];

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

  static getMemberToSendArmCommand(item, params) {
    if (item.type === 'Switch') {
      return item.name;
    }

    const members = this.getMembers(item);
    if (params.armLevel) {
      if (memberArmLevel in members) {
        return members[memberArmLevel].name;
      }
      // Can't set an arm level if no arm level member defined
      throw { statusCode: 400 };
    }
    if (memberArmed in members) {
      return members[memberArmed].name;
    }
    throw { statusCode: 400 };
  }

  static matchesItemType(item) {
    return item.type === 'Switch' || (item.type === 'Group' && Object.keys(this.getMembers(item)).length > 0);
  }

  static getAttributes(item) {
    //Group [armLevels="L1=Stay,L2=Away", lang="en", ordered=true]
    //Zone [zoneType="OpenClose", blocking=true, label="Front Door"]
    //Zone [zoneType="Motion", blocking=false, label="Living Room"]

    const config = this.getConfig(item);
    if (!config || Object.keys(config).length === 0) {
      return {};
    }
    const ordered = configOrdered in config && this.isTrueish(config.ordered);
    const language = configLang in config ? config.lang : defaultLanguage;

    if (configArmLevels in config) {
      let attributes = {
        availableArmLevels: { levels: [], ordered: ordered }
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
                lang: language
              }
            ]
          };
        });
      return attributes;
    }
    return {};
  }

  static getMembers(item) {
    const members = {
      zones: []
    };
    if (item.members && item.members.length) {
      item.members.forEach((member) => {
        if (member.metadata && member.metadata.ga) {
          const memberType = supportedMembers.find((m) => member.metadata.ga.value.toLowerCase() === m.toLowerCase());
          if (memberType) {
            const memberDetails = { name: member.name, state: member.state, config: this.getConfig(member) };
            if (memberType === memberZone) {
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

  static isTrueish(value) {
    return value === true || value === 1 || (typeof value === 'string' && value.toLowerCase() === 'true');
  }

  static getState(item) {
    const members = this.getMembers(item);

    let state = null;
    let armLevel = undefined;

    //Backwards compatible with existing GA metadata. ArmLevel not supported when using a Switch
    if (item.type === 'Switch') {
      state = item.state === stateSwitchActive;
    } else if (item.type === 'Group') {
      state = members[memberArmed].state === stateSwitchActive;
      armLevel = undefined;
      if (state && memberArmLevel in members) {
        armLevel = members[memberArmLevel].state;
      }
    }

    if (this.isTrueish(this.getConfig(item).inverted)) {
      state = !state;
    }

    return {
      isArmed: state,
      currentArmLevel: armLevel,
      currentStatusReport: this.getStatusReport(item, members)
    };
  }

  static getStatusReport(item, members) {
    let report = [];

    let isTrouble = memberTrouble in members && members[memberTrouble].state === stateSwitchActive;

    if (isTrouble) {
      let troubleCode = members[memberErrorCode].state;
      report.push({
        blocking: false,
        deviceTarget: item.name,
        priority: 0,
        statusCode: troubleCode
      });
    }

    for (let zone of members.zones) {
      if (zoneStateActive.includes(zone.state)) {
        let code = errorNotSupported;
        switch (zone.config[zoneConfigType]) {
          case zoneTypeOpenClose:
            code = errorDeviceOpen;
            break;
          case zoneTypeMotion:
            code = errorMotionDetected;
            break;
        }
        report.push({
          blocking: this.isTrueish(zone.config[zoneConfigBlocking]),
          deviceTarget: zone.name,
          priority: 1,
          statusCode: code
        });
      }
    }
    return report;
  }
}

module.exports = SecuritySystem;
