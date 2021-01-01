# openHAB Google Assistant

openHAB Google Assistant is based on [Google Cloud Function](https://cloud.google.com/functions) powered by Firebase and realized by Node.js. This serverless application connects the Google Assistant platform with the users openHAB instance through the openHAB Cloud service and lets the user control IoT devices through the Google Assistant. The openHAB Smart Home app lets you connect, query, and control devices through openHAB Cloud infrastructure.

[openHAB Cloud](https://github.com/openhab/openhab-cloud) is the Smart Home IoT cloud engine in this setup and provides both the main openHAB business logic for the web services and proxying, as well as the web portal used to administrate the granted application in the frontend. It handles authentication, and ultimately handles requests from the Google Assistant. openHAB Cloud is also the access point and backend for the Node.js based openHAB Google Cloud function app that acts as mediator and adapter code. This Adapter will receive commands from the Google Assistant and has listeners for POST requests for receiving SYNC, QUERY or EXEC smart home device control messages towards the openHAB Cloud. The path for requests to this adapter is `/openhabGoogleAssistant`.

Google Home Graph:
The Google related parts of any Smart Home action rely on Google Home Graph, a database that stores and provides contextual data about the home and its devices. For example, Home Graph can store the concept of a living room that contains multiple types of devices (a light, television, and speaker) from different manufacturers. This information is passed to the Google Assistant in order to execute user requests based on the appropriate context.

# General Instructions

## Requirements

* Google account with "Actions on Google" and "Google Cloud Functions" access
* openHAB server that a Google Cloud service endpoint can access

## Google Cloud Functions

* Enable the Cloud Functions API and install the Google Cloud SDK by following this [quickstart](https://cloud.google.com/functions/docs/quickstart)
* gactions CLI (https://developers.google.com/actions/tools/gactions-cli)
```
curl -O https://dl.google.com/gactions/updates/bin/linux/amd64/gactions/gactions
chmod +x gactions
```
* Modify `functions/config.js`
  1. Change `host` to point to your openHAB Cloud instance, for example: `openhab.myserver.com`. Do not include `https`, if you do you'll get DNS errors.
  1. Change `path` to the rest API. Defaults to `/rest/items/`.

Deploy the `openhabGoogleAssistant` (openHAB home automation) function:

* Create a storage bucket (https://console.cloud.google.com/storage/browser)
* `cd openhab-google-assistant/functions`
* `gcloud beta functions deploy openhabGoogleAssistant --runtime nodejs10 --stage-bucket <BUCKET_NAME> --trigger-http --project <PROJECT ID>`
* This commands will deploy the function to Google Cloud and give you the endpoint address.

Keep the address somewhere, you'll need it (something like `https://us-central1-<PROJECT ID>.cloudfunctions.net/openhabGoogleAssistant`).

## Create OAuth Credentials

You'll need to create OAuth credentials to enable API access.

Since this is only used between your Google Cloud function and your openHAB cloud server, you can choose them on your own.
See [The Client ID and Secret - OAuth](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/) for details.

* You will need a client ID and a client secret:
  1. Create a client ID (non-guessable public identifier)
  1. Create a client secret (sufficiently random private secret, e.g. minimum 32 char random string)
* You'll need these in the next steps.

## Setup your Database

* SSH into to your openHAB Cloud instance
* Open the MongoDB client `mongo` and enter these commands

```
use openhab
db.oauth2clients.insert({ clientId: "<CLIENT-ID>", clientSecret: "<CLIENT SECRET>"})
db.oauth2scopes.insert({ name: "any"})
db.oauth2scopes.insert( { name : "google-assistant", description: "Access to openHAB Cloud specific API for Actions on Google Assistant", } )
```

## Actions on Google

Actions on Google is Google's platform for developers to extend Google Assistant.
Here you need to develop your actions to engage users on Google Home, Pixel, and other surfaces where the Google Assistant is available.

* Create and setup an "Actions on Google" project on the [Actions Console using the Actions SDK](https://console.actions.google.com/).
  1. Select your existing project
  1. Select "Smart Home Actions". The fulfilment URL is the one saves from the `glcoud beta functions` you saved earlier.
  1. Fill out all the App information. Feel free to use fake data and images, you're not actually going to submit this.
  1. Move on to Account linking.
    * Select Authorization Code
    * Enter the client ID and client secret from the OAuth Credentials you created earlier
    * Authorization URL should be something like: `https://openhab.myserver.com/oauth2/authorize`
    * Token URL should be something like `https://openhab.myserver.com/oauth2/token`
    * Set the scope to `google-assistant`. This links to the records that you have inserted into the MongoDB table `oauth2scopes` in [Setup your Database](#setup-your-database).
    * Testing instructions: "None"
  1. Hit save. You're not actually going to submit this for testing, we just need to set it up so we can deploy it later.

## Deploy your action

When you ask your assistant to “Turn on the light”, it will use the auth bearer Token and call the specified endpoint. To specify which endpoint the Google Assistant should call, you need to create an action.json similar to the one below, with your endpoint URL.

* Update the `openhab-google-assistant/action.json` file and specify the Google Cloud Functions endpoint. This is not your server, this is the endpoint given to you from the call to `gcloud beta functions`

```
{
  "actions": [{
    "name": "actions.devices",
    "deviceControl": {
    },
    "fulfillment": {
      "conversationName": "automation"
    }
  }],
  "conversations": {
    "automation" :
    {
     "name": "automation",
     "url": "https://YOUR-FULFILMENT-URL-GIVEN-FROM-DEPLOYMENT"
    }
  }
}
```
If you want to deploy your action in a foreign language, add locale parameter to the top of the action.js like :
```
{
  "locale": "fr",
  "actions": [{
    "name": "actions.devices",
    "deviceControl": {
[...]
```

* Afterwards deploy this action file using the following command:

```
gactions update --action_package action.json --project <PROJECT ID>
```

Google Assistant will call the service endpoint: `https://YOUR-OPENHAB-CLOUD-URL/openhabGoogleAssistant`.
This web service will receive parameters (intents) from Google and will query/modify openHAB items through openHAB Cloud depending on those parameters.

* You need to Add "App information”, including name and account linking details to the Actions Console
* Afterwards please run the following command in the gaction CLI:
```
gactions test --action_package action.json --project <PROJECT ID>
```

Note: Anytime you make changes to the settings to your Action on the _Actions By Google_ interface, you'll need to repeat this step.

## Testing & Usage on Google App

* Make sure Google Play Services is up to date
* Visit "Google" app entry in Google Play Store on Android
* Your Google Assistant device (Home, Mini, Max etc) OR Phone should use the same Google account that you used to create and configure the _Actions On Google_ step above. If it's different, see below
* Start the updated Google Home app on your phone
* From the app home screen, select the `Add` button and then `Set up device`. Then `Works with Google > Have something already set up?`
* You should be shown a list of providers and your Test action should be available. eg. `[test] open hab` - select it
* Login at your Backend (e.g. https://myopenhab.org) with your username and password and authorise the OAuth screen
* If there is no errors, return back to the home screen and scroll to the bottom, your new devices should appear unassigned to any home or room. Complete the assignments as you see fit.
* You can now control those devices from the Google Assistant!

If you're lucky this works! You'll need to configure your items (below) and then sync again.
If it didn't work, try the workaround below.

To resync changes in the metadata or other openHAB configuration, tell Google Home to `sync my devices`. In a few seconds any changes will appear.

## Workarounds

### Scope issues

If you're getting error messages about an unknown scope, first check you've updated the MongoDB correctly in the [Setup your Database](#setup-your-database) step. If you still have issues, you can try this:

* SSH into to your openHAB Cloud instance
* Edit the file routes/oauth2.js:
  1. Comment out line 121: `scope = req.oauth2.req.scope;` and insert the following line above it: `scope = 'any';`
  ```
  //scope = req.oauth2.req.scope;
  scope = 'any'
  ```
 * Restart your server and attempt to authorize again.

### Using a different Google account
In some cases, you may wish to have your `Google Cloud Function` and `Actions On Google` configured on a different Google account than the one running on your Google Home (eg. you have a work account for GCP services and payments, a home account for assistant). This configuration is still possible, but you need to make some permissions changes.

Follow the same process above to setup the function and action, using your _work@gmail.com_ account. By default, when you go to add OpenHAB to the Google Home app using your _home@gmail.com_ account, your `[test] open hab` service will NOT be available to select.

To fix:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/projectselector/home)
1. Choose the GCP project you created your function in and linked to your Action
1. From the side menu, choose `IAM & Admin > IAM`
1. Click the `+ ADD` button at the top of the page
1. Add a new user, with your _home@gmail.com_ address. Giving them `Project > Viewer` role

Return back to the Google Home app and try to add the OpenHAB service again. You should now be able to see `[test] open hab` and add it successfully.

## Item configuration

In openHAB items are exposed using metadata in the namespace `ga`:

```
Switch KitchenLights "Kitchen Lights" <light> (gKitchen) { ga="Switch" }
Dimmer BedroomLights "Bedroom Lights" <light> (gBedroom) { ga="Light" }
Color LivingroomLights "Livingroom Lights" <light> (gLivingroom) { ga="Light" }
Switch SceneMovie "Livingroom Scene Movie" (gLivingroom) { synonyms="Movie Scene", ga="Scene" }
Switch CristmasTree "Cristmas Tree" (gLivingroom) { ga="Outlet" }
Switch DoorLock "Door Lock" { ga="Lock" }

//Thermostat Setup (Google requires a mode, even if you manually set it up in openHAB)
Group g_HK_Basement_TSTAT "Basement Thermostat" { ga="Thermostat" [ useFahrenheit=true ] }
Number HK_Basement_Mode "Basement Heating/Cooling Mode" (g_HK_Basement_TSTAT) { ga="thermostatMode" }
Number HK_Basement_Setpoint "Basement Setpoint" (g_HK_Basement_TSTAT) { ga="thermostatTemperatureSetpoint" }
Number HK_Basement_Temp "Basement Temperature" (g_HK_Basement_TSTAT) { ga="thermostatTemperatureAmbient" }
Number HK_Basement_Humid "Basement Humidity" (g_HK_Basement_TSTAT) { ga="thermostatHumidityAmbient" }
```

Currently the following metadata values are supported (also depending on Googles API capabilities):

* `Switch / Dimmer / Color { ga="Light" }` (Depending on the item type controlling power, brightness and color is supported)

---

* `Group { ga="Light" [ useKelvin=true ] }` (Light with separate brightness and color items)
* `Dimmer / Number { ga="lightBrightness" }` as part of Light group
* `Dimmer / Number { ga="lightColorTemperature" }` as part of Light group

---

* `Switch { ga="Switch" [ inverted=true ] }` (all Switch items can use the inverted option)
* `Switch { ga="Outlet" }`
* `Switch { ga="Coffee_Maker" }`
* `Switch { ga="WaterHeater" }`
* `Switch { ga="Fireplace" }`
* `Switch { ga="Valve" }`
* `Switch { ga="Sprinkler" }`
* `Switch { ga="Vacuum" }`
* `Switch { ga="Scene" }`

---

* `Switch / Contact { ga="Lock" [ ackNeeded=true ] }`
* `Switch { ga="SecuritySystem" [ pinNeeded="1234" ] }`
* `String { ga="Camera" [ protocols="hls,dash" ] }`
* `Dimmer { ga="Speaker" }` (Volume control)

---

* `Group { ga="TV" [ volumeDefaultPercentage="20", levelStepSize="10", volumeMaxLevel="100", transportControlSupportedCommands="NEXT,PREVIOUS,PAUSE,RESUME", availableInputs="hdmi1=xbox,hdmi2=settopbox", availableChannels="1=Channel1=NBC,2=Channel2=CBS" ] }`
* `Switch { ga="tvPower" }` as part of TV group (optional)
* `Switch { ga="tvMute" }` as part of TV group (optional)
* `Dimmer { ga="tvVolume" }` as part of TV group (optional)
* `String { ga="tvChannel" }` as part of TV group (optional)
* `String { ga="tvInput" }` as part of TV group (optional)
* `Player { ga="tvTransport" }` as part of TV group (optional)

---

* `Switch / Dimmer { ga="Fan" [ speeds="0=away:zero,50=default:standard:one,100=high:two", lang="en", ordered=true ] }` (for Dimmer the options have to be set)
* `Switch / Dimmer { ga="Hood" }`
* `Switch / Dimmer { ga="AirPurifier" }`

---

* `Rollershutter { ga="Awning" [ inverted=true ] }` (all Rollershutter items can use the inverted option)
* `Rollershutter { ga="Blinds" }`
* `Rollershutter { ga="Curtain" }`
* `Rollershutter { ga="Door" }`
* `Rollershutter { ga="Garage" }`
* `Rollershutter { ga="Gate" }`
* `Rollershutter { ga="Pergola" }`
* `Rollershutter { ga="Shutter" }`
* `Rollershutter { ga="Window" }`

_\* All Rollershutter devices can also be used with a Switch or Contact item with the limitation of only supporting open and close states._

---

* `Group { ga="Thermostat" [ modes="...", thermostatTemperatureRange="10,30", useFahrenheit=true ] }`
* `Number { ga="thermostatTemperatureAmbient" }` as part of Thermostat group
* `Number { ga="thermostatHumidityAmbient" }` as part of Thermostat group
* `Number { ga="thermostatTemperatureSetpoint" }` as part of Thermostat group
* `Number / String { ga="thermostatMode" }` as part of Thermostat group

---

* `Number { ga="TemperatureSensor" } [ useFahrenheit=true ] `

Item labels are not mandatory in openHAB, but for the Google Assistant Action they are absolutely necessary!

It is the "label text" (e.g. "Kitchen Lights" for example above) and not the item's name that will be available to you via voice commands or in the Google Home app, so make it unique and easy to say!

If you do not want to adjust your labels to be human spellable, you can use the "name" config option in the metadata: `[ name="Kitchen Lights" ]`. This will overwrite the label as the device's name.

Furthermore, you can state synonyms for the device name: `Switch KitchenLight "Kitchen Lights" { synonyms="Top Light", ga="Light" }`.

To ease setting up new devices you can add a room hint: `[ roomHint="Living Room" ]`.

For devices supporting the OpenClose trait, the attributes `[ discreteOnlyOpenClose=false, queryOnlyOpenClose=false ]` can be configured.
- discreteOnlyOpenClose defaults to false. When set to true, this indicates that the device must either be fully open or fully closed (that is, it does not support values between 0% and 100%). An example of such a device may be a valve.
- queryOnlyOpenClose defaults to false. Is set to true for `Contact` items. Indicates if the device can only be queried for state information and cannot be controlled. Sensors that can only report open state should set this field to true.

---

NOTE: metadata is not (yet?) available via paperUI. Either you create your items via ".items" files, or you can:
- add metadata via console:
 ```
 smarthome:metadata add BedroomLights ga Light
 ```

- add metadata using the REST API:
 ```
 PUT /rest/items/BedroomLights/metadata/ga

 {
   "value": "Light"
 }
 ```

NOTE: Please be aware that for backward compatibilty also the former usage of tags (ref. [Google Assistant Action Documentation v2.5](https://www.openhab.org/v2.5/docs/ecosystem/google-assistant/)) to specify items to be exposed to Google Assistent is supported and may cause unexpected behavior.
Items that contain tags that refer to a valid Google Assistent device will be exposed regardless of having metadata set. E.g.: `Switch MyBulb ["Lighting"]`.

### Special item configurations

#### Two-Factor-Authentication

For some actions, Google recommends to use TFA (Two-Factor-Authentication) to prevent accidential or unauthorized triggers of sensitive actions. See [Two-factor authentication &nbsp;|&nbsp; Actions on Google Smart Home](https://developers.google.com/assistant/smarthome/develop/two-factor-authentication).

The openHAB Google Assistant integration supports both _ackNeeded_ and _pinNeeded_. You can use both types on all devices types and traits.

_ackNeeded_: "A two-factor authentication that requires explicit acknowledgement (yes or no) and can also use trait states as response feedback. This challenge type is not recommended for security devices and traits."

_pinNeeded_: "A two-factor authentication that requires a personal identification number (PIN), which is ideal for security devices and traits."

Example:

```
Switch DoorLock "Front Door" { ga="Lock" [ ackNeeded=true ] }
Switch HouseAlarm "House Alarm" { ga="SecuritySystem" [ pinNeeded="1234" ] }
```

#### Thermostats

Thermostat requires a group of items to be properly configured to be used with Google Assistant. The default temperature unit is Celsius. `{ ga="Thermostat" }`

To change the temperature unit to Fahrenheit, add the config option `[ useFahrenheit=true ]` to the thermostat group.
To set the temperature range your thermostat supports, add the config option `[ thermostatTemperatureRange="10,30" ]` to the thermostat group.

There must be at least three items as members of the group:

* (Mandatory) Mode: Number (Zwave THERMOSTAT_MODE Format) or String (off, heat, cool, on, ...). `{ ga="thermostatMode" }`
* (Mandatory) Temperature Ambient: Number. `{ ga="thermostatTemperatureAmbient" }`
* (Mandatory) Temperature Setpoint: Number. `{ ga="thermostatTemperatureSetpoint" }`
* (Optional) Temperature Setpoint High: Number. `{ ga="thermostatTemperatureSetpointHigh" }`
* (Optional) Temperature Setpoint Low: Number. `{ ga="thermostatTemperatureSetpointLow" }`
* (Optional) Humidity Ambient: Number. `{ ga="thermostatHumidityAmbient" }`

If your thermostat does not have a mode, you should create one and manually assign a value (e.g. heat, cool, on, etc.) to have proper functionality.

To map the [default thermostat modes of Google](https://developers.google.com/assistant/smarthome/traits/temperaturesetting.html) (on, off, heat, cool, etc.) to custom ones for your specific setup, you can use the _modes_ config option on the thermostat group.
E.g. `[ modes="off=OFF:WINDOW_OPEN,heat=COMFORT:BOOST,eco=ECO,on=ON,auto" ]` will enable the following five modes in Google Home `"off, heat, eco, on, auto"` that will be translated to `"OFF, COMFORT, ECO, ON, auto"`. You can specify alternative conversions using the colon sign, so that in the former example "BOOST" in openHAB would also be translated to "heat" in Google. For the translation of Google modes to openHAB always the first option after the equal sign is used.
By default the integration will provide `"off,heat,cool,on,heatcool,auto,eco"`.

You can also set up a Thermostat for using it as a temperature sensor. To do so, create a Thermostat group and only add one item member as "thermostatTemperatureAmbient".
However, it is recommended to prefer the `TemperatureSensor` type for simple temperature reports (but currently no UI support in Google Assistant).

#### Fans

_Fans_ (and similar device types, like _AirPurifier_ or _Hood_) support the _FanSpeed_ trait.
With that you will be able to set up and use human speakable modes, e.g. "fast" for 100% or "slow" for 25%.

To set up those modes use a _Dimmer_ item and the following metadata config: `[ speeds="0=away:zero,50=default:standard:one,100=high:two", lang="en", ordered=true ]`.

_speeds_ will be a comma-separated list of modes with a percentage number followed by an equal sign and different aliases for that mode after a colon.
So here both "high" and "two" would set the speed to 100%.
You are also able to define the language of those aliases.
The option _ordered_ will tell the system that your list is ordered and you will then be able to also say "faster" or "slower" and Google will use the next or previous speed.

#### Blinds and similar devices

Blinds should always use the `Rollershutter` item type.
Since Google and openHAB use the oposite percentage value for "opened" or "closed", the action will tranlate this automatically.
If the values are still inverted in your case, you can state the `[ inverted=true ]` option for all `Rollershutter` items.

Since Google only tells the open percentage (and not the verb "close" or "down"), it can not be differentiated between saying "set blind to 100%" or "open blind".
Therefore, it is not possible to "not invert" the verbs, if the user chooses to invert the numbers.

---

More details about the setup and the service linkage (https://myopenhab.org) procedure within the Google App can be found in the [USAGE documentation](docs/USAGE.md).

## Example Voice Commands

Here are some example voice commands:

 * Turn on Office Lights
 * Dim/Brighten Office Lights (increments 15%)
 * Set Office Lights to 35%
 * Open/Close the blinds
 * Turn off Pool Waterfall
 * Turn on House Fan
 * Turn on Home Theater Scene
 * Set Basement Thermostat to 15 degrees
 * What is the current Basement Thermostat Temperature?

## Logging & Debugging

To check your deployed openHAB Google Cloud function app logs and debugging use the following command:

```
gcloud beta functions logs read openhabGoogleAssistant
```

## Limitations & Known Issues

* Sometimes the Account Linkage needs to be done twice and repeated
* Google Assistant does not respond to querying the current brightness of an item
* More Unit Test & Integration Test will be added soon

## References

* https://developers.google.com/actions/extending-the-assistant
* https://developers.google.com/actions/smarthome/
* https://cloud.google.com/functions/docs/how-to
* https://www.openhab.org/addons/integrations/homekit/
