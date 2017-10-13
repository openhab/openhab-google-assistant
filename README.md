# openHAB Google Assistant 

openHAB Google Assistant is based on [Google Cloud Function](https://cloud.google.com/functions) powered by Firebase and realized by Node.js. This serverless application connects the Google Assistant platform with the users openHAB instance through the openHAB Cloud service and lets the user control IoT devices through the Google Assistant. The openHAB Smart Home app lets you connect, query, and control devices through openHAB cloud infrastructure.

[openHAB-cloud](https://github.com/openhab/openhab-cloud) is the Smart Home IoT cloud engine in this setup and provides both the main openHAB business logic for the web services and proxying, as well as the web portal used to administrate the granted application in the frontend. It handles authentication, and ultimately handles requests from the Google Assistant. openHAB-cloud is also the access point and backend for the Node.js based openhHAB Google Cloud function app that acts as mediator and adapter code. This Adapter will receive commands from the Google Assistant and has listeners for POST requests for receiving SYNC, QUERY or EXEC smart home device control messages towards the openHAB-cloud. The path for requests to this adapter is `/openhabGoogleAssistant`.

Google Home Graph:
The Google related parts of any Smart Home action rely on Google Home Graph, a database that stores and provides contextual data about the home and its devices. For example, Home Graph can store the concept of a living room that contains multiple types of devices (a light, television, and speaker) from different manufacturers. This information is passed to the Google Assistant in order to execute user requests based on the appropriate context.

# General Instructions

## Requirements

* Google account with "Actions on Google" and "Google Cloud Functions" access
* oAuth2 Server/Provider (like Amazon Login)
* openHAB server that a Google Cloud service endpoint can access


## Google Cloud Functions

* Enable the Cloud Functions API and install the Google Cloud SDK by following this [quickstart](https://cloud.google.com/functions/docs/quickstart) 
* Deploy the `openhabGoogleAssistant` (openhab home automation) function with the following command

```
cd openhab-google-assistant/functions
gcloud beta functions deploy openhabGoogleAssistant --stage-bucket staging.<PROJECT ID>.appspot.com --trigger-http
```

* This commands will deploy the function to Google Cloud and give you the endpoint address. Keep the address somewhere, you'll need it (something like `https://us-central1-<PROJECT ID>.cloudfunctions.net/openhabGoogleAssistant`).


## Actions on Google

Actions on Google is Googles platform for developers to extend Google Assistant. Here you need to develop your actions to engage users on Google Home, Pixel, and other surfaces where the Google Assistant is available

* Create and setup an Actions on Google project on the Actions Console using the Actions SDK described [here](https://developers.google.com/actions/sdk/create-a-project).

When you ask your assistant to “Turn on the light”, it will use the auth bearer Token and call the specified endpoint. To specify which endpoint the Google Assistant should call, you need to create an action.json similar to the one below, with your endpoint URL

* Update the `openhab-google-assistant/action.json` file and specify the Google Cloud Functions endpoint to the ```url``` variable

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
     "url": "https://YOUR-URL/openhabGoogleAssistant"
    }
  }
}
```

* Afterwards upload this action file using the following command:
```
gactions update --action_package action.json --project <YOUR-GOOGLE-CLOUD-PROJECT-ID>
```

Google Assistant will call the service endpoint: `https://YOUR-URL/openhabGoogleAssistant`.
This web service will receive parameters (intents) from Google and will query/modify openHAB items through openHAB-cloud depending on those parameters.

* You need to Add "App information”, including name and account linking details to the Actions Console
* Afterwards please run the following command in the gaction CLI:
```
gactions test --action_package PACKAGE_NAME --project AGENT_ID
```

### Account Linkage & OAuth2:

To enable the OAuth account linkage you need to setup the according values in the Actions Console: 

Set up account linking:

* Grant type: Autorization code
* Client ID: `<YOUR-ID>`
* Client secret: `<YOUR-SECRET>`
* Authorization URL: `https://<YOUR-URL>/oauth`
* Token URL: `https://<YOUR-URL>/token`

Save all changes and click on the Test button


## Testing & Usage on Google App

* Make sure Google Play Services is up to date
* Visit "Google" app entry in Google Play Store on Android
* Set up the voice-activated speaker, Pixel, or Android phone (version 6+) with the *same test account*
* Make sure you're the correct user
* Start the updated Google Home app on your phone
* Go to the devices Settings > Home control > Add device and select the [test] open hab
* Login at your Backend (e.g. myopenhab.org) with your username and password
* You will now be able to see your previously tagged items and devices
* You can now control those devices from the Google assistant


![openHAB Google App](/docs/openhab_google_app.png)


## Example Voice Commands

Here are some example voice commands:

 * Turn on Office Lights
 * Turn off Pool Waterfall
 * Turn on House Fan
 * Turn on Home Theater Scene


## Logging & Debugging

To check your deployed openhHAB Google Cloud function app logs and debugging use the follwoing command:
```
gcloud beta functions logs read openhabGoogleAssistant
```

## Limitations & Known Issues

* Sometimes the Account Linkage needs to be done twice and repeated
* Currently there is support for any switchable device (light, plug etc.)
* Setting light colors works, but has some known Bug in the adapter (transformation problem with Hex value)
* Thermostats are not fully implemented
* More Unit Test & Integration Test will be added soon


## References

* https://developers.google.com/actions/extending-the-assistant
* https://developers.google.com/actions/smarthome/
* https://cloud.google.com/functions/docs/how-to