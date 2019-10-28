# openHAB Google Assistant

openHAB Google Assistant is based on [Google Cloud Function](https://cloud.google.com/functions) powered by Firebase and realized by Node.js. This serverless application connects the Google Assistant platform with the users openHAB instance through the openHAB Cloud service and lets the user control IoT devices through the Google Assistant. The openHAB Smart Home app lets you connect, query, and control devices through openHAB Cloud infrastructure.

[openHAB Cloud](https://github.com/openhab/openhab-cloud) is the Smart Home IoT cloud engine in this setup and provides both the main openHAB business logic for the web services and proxying, as well as the web portal used to administrate the granted application in the frontend. It handles authentication, and ultimately handles requests from the Google Assistant. openHAB Cloud is also the access point and backend for the Node.js based openHAB Google Cloud function app that acts as mediator and adapter code. This Adapter will receive commands from the Google Assistant and has listeners for POST requests for receiving SYNC, QUERY or EXEC smart home device control messages towards the openHAB Cloud. The path for requests to this adapter is `/openhabGoogleAssistant`.

Google Home Graph:
The Google related parts of any Smart Home action rely on Google Home Graph, a database that stores and provides contextual data about the home and its devices. For example, Home Graph can store the concept of a living room that contains multiple types of devices (a light, television, and speaker) from different manufacturers. This information is passed to the Google Assistant in order to execute user requests based on the appropriate context.

# General Instructions

## Requirements

* Google account with "Actions on Google" and "Google Cloud Functions" access
* oAuth2 Server/Provider (like Google Cloud or Amazon Login)
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

## Create OAuth Credentials on Google Cloud

You'll need to create OAuth credentials to enable API access.

* Visit the [Credentials Page](https://console.cloud.google.com/apis/credentials)
  1. Select "Create Credentials" -> "OAuth client id"
  1. Select Web Application and give it a name. I left the restrictions open.
* Copy the client id and the client secret, you'll need these in the next step.

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
    * Set the scope to `google-assistant`. This links to the records you will insert into the MongoDB table `oauth2scopes` later in [Setup your Database](#setup-your-database) step below.
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

## Setup your Database

* SSH into to your openHAB Cloud instance
* Open the mongodb client `mongo` and enter these commands

```
use openhab
db.oauth2clients.insert({ clientId: "<CLIENT-ID>", clientSecret: "<CLIENT SECRET>"})
db.oauth2scopes.insert({ name: "any"})
db.oauth2scopes.insert( { name : "google-assistant", description: "Access to openHAB Cloud specific API for Actions on Google Assistant", } )
```

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

To resync changes in tagging or other OpenHAB configuration, tell Google Home to `sync my devices`. In a few seconds any changes will appear.

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

* In openHAB Items are exposed via HomeKit tags, the following is taken from the [HomeKit Add-on](https://www.openhab.org/addons/integrations/homekit/) documentation in openHAB:

  ```
  Switch KitchenLights "Kitchen Lights" <light> (gKitchen) [ "Switchable" ]
  Dimmer BedroomLights "Bedroom Lights" <light> (gBedroom) [ "Lighting" ]
  Color LivingroomLights "Livingroom Lights" <light> (gLivingroom) [ "Lighting" ]
  Switch SceneMovie "Livingroom Scene Movie" (gLivingroom) [ "Scene" ]
  Switch CristmasTree "Cristmas Tree" (gLivingroom) [ "Outlet" ]
  Switch DoorLock "Door Lock" [ "Lock" ]

  //Thermostat Setup (Google requires a mode, even if you manually set it up in openHAB)
  Group g_HK_Basement_TSTAT "Basement Thermostat" [ "Thermostat", "Fahrenheit" ]
  Number HK_Basement_Mode "Basement Heating/Cooling Mode" (g_HK_Basement_TSTAT) [ "homekit:TargetHeatingCoolingMode" ]
  Number HK_Basement_Temp    "Basement Temperature" (g_HK_Basement_TSTAT) [ "CurrentTemperature" ]
  Number HK_Basement_Setpoint "Basement Setpoint" (g_HK_Basement_TSTAT) [ "homekit:TargetTemperature" ]
  ```

Currently the following Tags are supported (also depending on Googles API capabilities):

* ["Lighting"]
* ["Switchable"]
* ["Blinds"]
* ["Scene"]
* ["Outlet"]
* ["Lock"]
* ["Thermostat"]
* ["CurrentTemperature"] as part of Thermostat.
* ["CurrentHumidity"] as part of Thermostat.
* ["homekit:TargetTemperature"] as part of Thermostat.
* ["homekit:TargetHeatingCoolingMode"] as part of Thermostat.

Notes Regarding Thermostat Items:

- Thermostat requires a group to be properly setup with Google Assistant, default format is Celsius
- There must be 3 elements:
  * Mode: May be Number (Zwave THERMOSTAT_MODE Format) or String (off, heat, cool, on)
  * Current Temperature: Number
  * TargetTemperature: Number
- If your thermostat does not have a mode, you should create one and manually assign a value (e.g. heat, cool, on, etc.) to have proper functionality
- See also [HomeKit Add-on](https://www.openhab.org/addons/integrations/homekit/) for further formatting details.

The following screenshots show the setup and the service linkage (https://myopenhab.org) procedure within the Google App:

![openHAB Google App](/docs/openhab_google_app.png)

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
* {{base}}addons/integrations/homekit/
