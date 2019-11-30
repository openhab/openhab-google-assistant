
const OpenHAB = require('../functions/openhab.js').OpenHAB;

describe('Test SYNC', () => {
  test('light items', async () => {
    const items = [
      {
        "link": "https://openhab.example.org/rest/items/MySwitch",
        "state": "OFF",
        "editable": false,
        "type": "Switch",
        "name": "MySwitch",
        "label": "SwitchLight",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "link": "https://openhab.example.org/rest/items/MyDimmer",
        "state": "0",
        "editable": false,
        "type": "Dimmer",
        "name": "MyDimmer",
        "label": "DimmLight",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "link": "https://openhab.example.org/rest/items/MyLight",
        "state": "0,0,0",
        "editable": false,
        "type": "Color",
        "name": "MyLight",
        "label": "ColorLight",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "members": [],
        "link": "https://openhab.example.org/rest/items/MyLightGroup",
        "state": "NULL",
        "editable": false,
        "type": "Group",
        "groupType": "Switch",
        "name": "MyLightGroup",
        "label": "GroupLight",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "members": [],
        "link": "https://openhab.example.org/rest/items/MyDimmerGroup",
        "state": "NULL",
        "editable": false,
        "type": "Group",
        "groupType": "Dimmer",
        "name": "MyDimmerGroup",
        "label": "GroupDimmer",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      },
      {
        "members": [],
        "link": "https://openhab.example.org/rest/items/MyColorGroup",
        "state": "NULL",
        "editable": false,
        "type": "Group",
        "groupType": "Color",
        "name": "MyColorGroup",
        "label": "GroupColor",
        "tags": [
          "Lighting"
        ],
        "groupNames": []
      }
    ];

    const getItemsMock = jest.fn();
    getItemsMock.mockReturnValue(Promise.resolve(items));

    const apiHandler = {
      getItems: getItemsMock
    };

    const payload = await new OpenHAB(apiHandler).handleSync();

    expect(payload).toMatchSnapshot();
  });
});

describe('Test QUERY', () => {
  test('single light item', async () => {
    const item =
    {
      "link": "https://openhab.example.org/rest/items/MySwitch",
      "state": "OFF",
      "editable": false,
      "type": "Switch",
      "name": "MySwitch",
      "label": "SwitchLight",
      "tags": [
        "Lighting"
      ],
      "groupNames": []
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValue(Promise.resolve(item));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MySwitch"
    }]);

    expect(payload).toStrictEqual({
      "devices": {
        "MySwitch": {
          "on": false,
          "online": true,
        },
      },
    });
  });

  test('multiple light items', async () => {
    const item1 =
    {
      "link": "https://openhab.example.org/rest/items/MySwitch",
      "state": "OFF",
      "editable": false,
      "type": "Switch",
      "name": "MySwitch",
      "label": "SwitchLight",
      "tags": [
        "Lighting"
      ],
      "groupNames": []
    };

    const item2 =
    {
      "link": "https://openhab.example.org/rest/items/MyDimmer",
      "state": "20",
      "editable": false,
      "type": "Dimmer",
      "name": "MyDimmer",
      "label": "DimmerLight",
      "tags": [
        "Lighting"
      ],
      "groupNames": []
    };

    const getItemMock = jest.fn();
    getItemMock.mockReturnValueOnce(Promise.resolve(item1))
      .mockReturnValueOnce(Promise.resolve(item2));

    const apiHandler = {
      getItem: getItemMock
    };

    const payload = await new OpenHAB(apiHandler).handleQuery([{
      "id": "MySwitch"
    }, {
      "id": "MyDimmer"
    }]);

    expect(payload).toStrictEqual({
      "devices": {
        "MySwitch": {
          "on": false,
          "online": true,
        },
        "MyDimmer": {
          "on": true,
          "brightness": 20,
          "online": true,
        },
      },
    });
  });
});
