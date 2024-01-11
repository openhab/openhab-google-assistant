# Migration Guide

This guide will help you to prepare your setup to the upcoming rollout of the openHAB Google Assistant integration v4.

Next to some new features, the integration will become stricter with the configured item types.
Furthermore, some configuration options will be adjusted.

## Configuration Options

Please change any configured `Fan` or `Thermostat` device to use the new configuration options:

- Thermostat: `modes` needs to be changed to `thermostatModes`
- Fan: `speeds` needs to be changed to `fanSpeeds`

## Item Types

Please make sure that every item annotated with Google Assistant Metadata corresponds to the correct item type as listed below.

If you spot any issue with that, e.g. in your current setup, please let us know so that we can check and adjust the compatbility if possible.

| Device / Property | Item Type |
| --- | --- |
| **AC_Unit** | Group |
| **AirPurifier** | Group, Dimmer, Number, Switch |
| **Awning** | Rollershutter, Switch, Contact |
| **Blinds** | Rollershutter, Switch, Contact |
| **Camera** | String |
| **Charger** | Group |
| **chargerCapacityRemaining** | Number, Dimmer |
| **chargerCapacityUntilFull** | Number, Dimmer |
| **chargerCharging** | Switch |
| **chargerPluggedIn** | Switch |
| **ClimateSensor** | Group |
| **Coffee_Maker** | Switch |
| **Curtain** | Rollershutter, Switch, Contact |
| **Door** | Rollershutter, Switch, Contact |
| **Fan** | Group, Dimmer, Number, Switch |
| **fanFilterLifeTime** | Number |
| **fanMode** | Number, String |
| **fanPM25** | Number |
| **fanPower** | Switch |
| **fanSpeed** | Dimmer, Number |
| **Fireplace** | Switch |
| **Garage** | Rollershutter, Switch, Contact |
| **Gate** | Rollershutter, Switch, Contact |
| **Hood** | Group, Dimmer, Number, Switch |
| **humidityAmbient** | Number |
| **HumiditySensor** | Number |
| **Light** | Group, Color, Dimmer, Switch |
| **lightBrightness** | Dimmer, Number |
| **lightColor** | Color |
| **lightColorTemperature** | Dimmer, Number |
| **lightPower** | Switch |
| **Lock** | Switch, Contact |
| **memberArmed** | Switch |
| **memberArmLevel** | String |
| **memberErrorCode** | String |
| **memberTrouble** | Switch |
| **memberZone** | Contact |
| **Outlet** | Switch |
| **Pergola** | Rollershutter, Switch, Contact |
| **Scene** | Switch |
| **SecuritySystem** | Group, Switch |
| **Sensor** | Number, String, Dimmer, Switch, Rollershutter, Contact |
| **Shutter** | Rollershutter, Switch, Contact |
| **Speaker** | Dimmer |
| **Sprinkler** | Switch |
| **Switch** | Switch |
| **temperatureAmbient** | Number |
| **TemperatureSensor** | Number |
| **Thermostat** | Group |
| **thermostatHumidityAmbient** | Number |
| **thermostatMode** | Number, String, Switch |
| **thermostatTemperatureAmbient** | Number |
| **thermostatTemperatureSetpoint** | Number |
| **thermostatTemperatureSetpointHigh** | Number |
| **thermostatTemperatureSetpointLow** | Number |
| **TV** | Group |
| **tvApplication** | Number, String |
| **tvChannel** | Number, String |
| **tvInput** | Number, String |
| **tvMute** | Switch |
| **tvPower** | Switch |
| **tvTransport** | Player |
| **tvVolume** | Number, Dimmer |
| **Vacuum** | Switch |
| **Valve** | Switch |
| **WaterHeater** | Switch |
| **Window** | Rollershutter, Switch, Contact |
