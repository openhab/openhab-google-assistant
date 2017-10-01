# openHAB Google Assistant Smart Home App/Action

openHAB Google Assistant is a [Google Cloud Function](https://cloud.google.com/functions) powered by Firebase and realized by Node.js. This serverless application connects the Google Assistant platform with the users openHAB instance through the openHAB Cloud service and lets the user control IoT devices through the Google Assistant. The openHAB Smart Home app lets you connect, query, and control devices through openHAB cloud infrastructure.

The Google Smart Home apps/actions rely on Google Home Graph, a database that stores and provides contextual data about the home and its devices. For example, Home Graph can store the concept of a living room that contains multiple types of devices (a light, television, and speaker) from different manufacturers. This information is passed to the Google Assistant in order to execute user requests based on the appropriate context.

[openHAB-cloud](https://github.com/openhab/openhab-cloud) is the Smart Home IoT cloud engine in this setup and provides both the main openHAB business logic for the web services and proxying, as well as the web portal used to administrate the granted application in the frontend. It handles authentication, and ultimately handles requests from the Google Assistant. openHAB-cloud is also the access point and backend for the Node.js based openhHAB Google Cloud function app that acts as mediator and adapter code. This Adapter will receive commands from the Google Assistant and has listeners for POST requests for receiving SYNC, QUERY or EXEC smart home device control messages towards the openHAB-cloud. The path for requests to this adapter is '/openhabGoogleAssistant'.


# General Instructions

## Requirements

* Google account with "Actions on Google" and "Google Cloud Functions" access
* oAuth2 Server/Provider (like Amazon Login)
* openHAB server that a Google Cloud service endpoint can access


## Google Cloud Functions
* Enable the Cloud Functions API and install the Google Cloud SDK by following this [quickstart](https://cloud.google.com/functions/docs/quickstart) 
* Deploy the `openhabGoogleAssistant` (openhab home automation) function with the following command
`cd openhab-google-assistant/functions`
`gcloud beta functions deploy openhabGoogleAssistant --stage-bucket staging.<PROJECT ID>.appspot.com --trigger-http`
* This commands will deploy the function to Google Cloud and give you the endpoint address. Keep the address somewhere, you'll need it (something like https://us-central1-<PROJECT ID>.cloudfunctions.net/openhabGoogleAssistant).


## Actions on Google

When you ask your assistant to “Turn on the light”, it will use the auth bearer Token and call a specific endpoint. To specify which endpoint the Google Assistant should call, you need to create an action.json similar to the one below, with your endpoint URL
* Update the `openhab-google-assistant/action.json` file and specify the Google Cloud Functions endpoint to the `url variable

`{`
`  "actions": [{`
`    "name": "actions.devices",`
`    "deviceControl": {`
`    },`
`    "fulfillment": {`
`      "conversationName": "automation"`
`    }`
`  }],`
`  "conversations": {`
`    "automation" :`
`    {`
`     "name": "automation",`
`     "url": "https://YOUR-URL/openhabGoogleAssistant"`
`    }`
`  }`
`}`

* Afterwards upload this action file using the following command:
`gactions update --action_package action.json --project <YOUR-GOOGLE-CLOUD-PROJECT-ID>`

Google Assistant will call the service endpoint: `https://YOUR-URL/openhabGoogleAssistant.
This web service will receive parameters (intents) from Google and will query/modify openHAB items through openHAB-cloud depending on those parameters.

## oAuth2 Server
