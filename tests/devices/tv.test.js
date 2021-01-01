const Device = require('../../functions/devices/tv.js');

describe('TV Device', () => {
  test('isCompatible', () => {
    expect(Device.isCompatible({
      "metadata": {
        "ga": {
          "value": "TV"
        }
      }
    })).toBe(true);
  });

  test('matchesItemType', () => {
    const item = {
      "type": "Group",
      "members": [
        {
          "metadata": {
            "ga": {
              "value": "tvPower"
            }
          }
        }
      ]
    };
    expect(Device.matchesItemType(item)).toBe(true);
    expect(Device.matchesItemType({ "type": "Group" })).toBe(false);
  });

  describe('getTraits', () => {
    test('getTraits only power', () => {
      const item = {
        "members": [
          {
            "state": "ON",
            "metadata": {
              "ga": {
                "value": "tvPower"
              }
            }
          }
        ]
      };
      expect(Device.getTraits(item)).toStrictEqual([
        "action.devices.traits.OnOff"
      ]);
    });

    test('getTraits all members', () => {
      const item = {
        "members": [
          {
            "state": "1",
            "metadata": {
              "ga": {
                "value": "tvChannel"
              }
            }
          },
          {
            "state": "50",
            "metadata": {
              "ga": {
                "value": "tvVolume"
              }
            }
          },
          {
            "state": "input1",
            "metadata": {
              "ga": {
                "value": "tvInput"
              }
            }
          },
          {
            "state": "PLAY",
            "metadata": {
              "ga": {
                "value": "tvTransport"
              }
            }
          },
          {
            "state": "ON",
            "metadata": {
              "ga": {
                "value": "tvPower"
              }
            }
          },
          {
            "state": "OFF",
            "metadata": {
              "ga": {
                "value": "tvMute"
              }
            }
          }
        ]
      };
      expect(Device.getTraits(item)).toStrictEqual([
        "action.devices.traits.OnOff",
        "action.devices.traits.Volume",
        "action.devices.traits.Channel",
        "action.devices.traits.InputSelector",
        "action.devices.traits.TransportControl"
      ]);
    });
  });

  describe('getAttributes', () => {
    test('getAttributes no config', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {}
          }
        },
        "members": [
          {
            "metadata": {
              "ga": {
                "value": "tvVolume"
              }
            }
          },
          {
            "metadata": {
              "ga": {
                "value": "tvTransport"
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "transportControlSupportedCommands": [
          "NEXT",
          "PREVIOUS",
          "PAUSE",
          "RESUME",
        ],
        "volumeCanMuteAndUnmute": false,
        "volumeMaxLevel": 100,
      });
    });

    test('getAttributes volume', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "volumeDefaultPercentage": "20",
              "levelStepSize": "10"
            }
          }
        },
        "members": [
          {
            "metadata": {
              "ga": {
                "value": "tvVolume"
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "levelStepSize": 10,
        "volumeCanMuteAndUnmute": false,
        "volumeDefaultPercentage": 20,
        "volumeMaxLevel": 100
      });
    });

    test('getAttributes transport, mute', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "transportControlSupportedCommands": "PAUSE,RESUME"
            }
          }
        },
        "members": [
          {
            "metadata": {
              "ga": {
                "value": "tvTransport"
              }
            }
          },
          {
            "metadata": {
              "ga": {
                "value": "tvMute"
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "transportControlSupportedCommands": ["PAUSE", "RESUME"],
        "volumeCanMuteAndUnmute": true
      });
    });

    test('getAttributes inputs', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "availableInputs": "input1=hdmi1,input2=hdmi2"
            }
          }
        },
        "members": [
          {
            "metadata": {
              "ga": {
                "value": "tvInput"
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "availableInputs": [
          {
            "key": "input1",
            "names": [
              {
                "lang": "en",
                "name_synonym": ["hdmi1"],
              },
            ],
          },
          {
            "key": "input2",
            "names": [
              {
                "lang": "en",
                "name_synonym": ["hdmi2"]
              }
            ]
          }
        ],
        "orderedInputs": false,
        "volumeCanMuteAndUnmute": false
      });
    });

    test('getAttributes channels', () => {
      const item = {
        "metadata": {
          "ga": {
            "config": {
              "availableChannels": "1=channel1=ARD,2=channel2=ZDF"
            }
          }
        },
        "members": [
          {
            "metadata": {
              "ga": {
                "value": "tvChannel"
              }
            }
          }
        ]
      };
      expect(Device.getAttributes(item)).toStrictEqual({
        "availableChannels": [
          {
            "key": "channel1",
            "names": ["ARD"],
            "number": "1"
          },
          {
            "key": "channel2",
            "names": ["ZDF"],
            "number": "2"
          }
        ],
        "volumeCanMuteAndUnmute": false
      });
    });
  });

  test('getMembers', () => {
    expect(Device.getMembers({ "members": [{}] })).toStrictEqual({});
    expect(Device.getMembers({ "members": [{ "metadata": { "ga": { "value": "invalid" } } }] })).toStrictEqual({});
    const item = {
      "members": [
        {
          "name": "Channel",
          "state": "1",
          "metadata": {
            "ga": {
              "value": "tvChannel"
            }
          }
        },
        {
          "name": "Volume",
          "state": "50",
          "metadata": {
            "ga": {
              "value": "tvVolume"
            }
          }
        },
        {
          "name": "Input",
          "state": "input1",
          "metadata": {
            "ga": {
              "value": "tvInput"
            }
          }
        },
        {
          "name": "Transport",
          "state": "PLAY",
          "metadata": {
            "ga": {
              "value": "tvTransport"
            }
          }
        },
        {
          "name": "Power",
          "state": "ON",
          "metadata": {
            "ga": {
              "value": "tvPower"
            }
          }
        },
        {
          "name": "Mute",
          "state": "OFF",
          "metadata": {
            "ga": {
              "value": "tvMute"
            }
          }
        }
      ]
    };
    expect(Device.getMembers(item)).toStrictEqual({
      "tvChannel": {
        "name": "Channel",
        "state": "1"
      },
      "tvInput": {
        "name": "Input",
        "state": "input1"
      },
      "tvMute": {
        "name": "Mute",
        "state": "OFF"
      },
      "tvPower": {
        "name": "Power",
        "state": "ON"
      },
      "tvTransport": {
        "name": "Transport",
        "state": "PLAY"
      },
      "tvVolume": {
        "name": "Volume",
        "state": "50"
      }
    });
  });

  test('getChannelMap', () => {
    const item = {
      "metadata": {
        "ga": {
          "value": "TV",
          "config": {
            "availableChannels": "20=channel1=Channel 1:Kanal 1,10=channel2=Channel 2:Kanal 2"
          }
        }
      }
    };
    expect(Device.getChannelMap(item)).toStrictEqual({
      "10": [
        "Channel 2",
        "Kanal 2",
        "channel2"
      ],
      "20": [
        "Channel 1",
        "Kanal 1",
        "channel1"
      ],
    });
  });

  describe('getState', () => {
    test('getState', () => {
      const item = {
        "type": "Group",
        "metadata": {
          "ga": {
            "value": "TV",
            "config": {
              "transportControlSupportedCommands": "PAUSE,RESUME",
              "availableInputs": "input1=hdmi1,input2=hdmi2",
              "availableChannels": "1=channel1=ARD,2=channel2=ZDF"
            }
          }
        },
        "members": [
          {
            "state": "1",
            "metadata": {
              "ga": {
                "value": "tvChannel"
              }
            }
          },
          {
            "state": "50",
            "metadata": {
              "ga": {
                "value": "tvVolume"
              }
            }
          },
          {
            "state": "input1",
            "metadata": {
              "ga": {
                "value": "tvInput"
              }
            }
          },
          {
            "state": "PLAY",
            "metadata": {
              "ga": {
                "value": "tvTransport"
              }
            }
          },
          {
            "state": "ON",
            "metadata": {
              "ga": {
                "value": "tvPower"
              }
            }
          },
          {
            "state": "OFF",
            "metadata": {
              "ga": {
                "value": "tvMute"
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        "channelName": "ARD",
        "channelNumber": "1",
        "currentInput": "input1",
        "currentVolume": 50,
        "isMuted": false,
        "on": true,
      });
    });

    test('getState only channel without map', () => {
      const item = {
        "type": "Group",
        "members": [
          {
            "state": "1",
            "metadata": {
              "ga": {
                "value": "tvChannel"
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        "channelNumber": "1"
      });
    });

    test('getState only power, mute', () => {
      const item = {
        "type": "Group",
        "metadata": {
          "ga": {
            "value": "TV"
          }
        },
        "members": [
          {
            "state": "50",
            "metadata": {
              "ga": {
                "value": "tvVolume"
              }
            }
          },
          {
            "state": "ON",
            "metadata": {
              "ga": {
                "value": "tvPower"
              }
            }
          }
        ]
      };
      expect(Device.getState(item)).toStrictEqual({
        "currentVolume": 50,
        "on": true,
      });
    });
  });
});
