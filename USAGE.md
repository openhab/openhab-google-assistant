# Google Assistant Action

Google Assistant is Google’s virtual personal assistant and uses Actions on Google as the platform for "Actions" (software applications) to extend the functionality of the Google Assistant. Users engage Google Assistant in conversation to get things done, like controlling their devices and things at home. You can use the officially certified openHAB Action for Google Assistant to easily manage and control your smart home by conversational experiences between you and your openHAB smart home powered by voiced commands.

This guide describes step by step how to use the [openHAB Google Assistant Smart Home Action](https://assistant.google.com/services/a/uid/000000f5c61c627e?hl=en-US&source=web). The openHAB Action links your openHAB setup through the [myopenHAB.org](https://www.myopenhab.org) cloud service to the Google Assistant platform (for technical insights, please refer to this [guide](https://github.com/openhab/openhab-google-assistant/blob/master/README.md) to read more about setup options and development information).

With the Action you can voice control your openHAB items and it supports lights, plugs, switches and thermostats. The openHAB Action comes with multiple language support like English, German or French language.

# General Configuration Instructions

## Requirements

* [openHAB Cloud Connector](http://docs.openhab.org/addons/ios/openhabcloud/readme.html) configured using myopenHAB.org
* Google account
* Google Home or Google Home mini 

## Item configuration
* In openHAB 2 Items are exposed via Homekit tags, the following is taken from the homekit binding in openHAB2:

  ```
  Switch KitchenLights "Kitchen Lights" <light> (gKitchen) [ "Lighting" ]
  Dimmer BedroomLights "Bedroom Lights" <light> (gBedroom) [ "Lighting" ]
  
  //Standalone Thermostat Sensor (just reports current ambient temperature)
  Number HK_SF_Bedroom_Temp "Bedroom Temperature [%.1f]" [ "CurrentTemperature", "Fahrenheit"]
  
  //Thermostat Setup (Google requires a mode, even if you manually set it up in Openhab)
  Group g_HK_Basement_TSTAT "Basement Thermostat" [ "Thermostat", "Fahrenheit" ]
  Number HK_Basement_Mode "Basement Heating/Cooling Mode" (g_HK_Basement_TSTAT) [ "homekit:HeatingCoolingMode" ]
  Number HK_Basement_Temp	"Basement Temperature" (g_HK_Basement_TSTAT) [ "CurrentTemperature" ]
  Number HK_Basement_Setpoint "Basement Setpoint" (g_HK_Basement_TSTAT) [ "TargetTemperature" ]
  ```

Currently the follwoing Tags are supported (also depending on Googles API capabilities):
* ["Lighting"]
* ["Switchable"]
* ["CurrentTemperature"]
* ["Thermostat"] 

Notes Regarding Thermostat Items:
- Thermostat requires a group to be properly setup with Google Assistant, default format is Celsius
- There must be 3 elements:
  * Mode: May be Number (Zwave THERMOSTAT_MODE Format) or String (off, heat, cool, on)
  * Current Temperature: Number
  * TargetTemperature: Number
- If your thermostat does not have a mode, you should create one and manually assign a value (e.g. heat, cool, on, etc.) to have proper functionality
- See also HomeKit Addon for further formatting details

## Setup & Usage on Google Assistant App
* Make sure Google Play Services is up to date
* Visit "Google Assistant" app entry in Google Play Store on Android
* Set up the voice-activated speaker, Pixel, or Android phone (version 6+) with the *same test account*
* Make sure you're the correct user
* Start the updated Google Assistant app on your phone
* Go to the devices `Settings > Home control > Add device` and select the `openHAB` action
* Login at myopenhab.org with your username and password
* You will now be able to see your previously tagged items and devices
* You can now control those devices from the Google assistant

The following screenshots show the setup and the service linkage
at myopenhab.org within the Google Assistant App:

![openHAB Google App](/docs/openhab_google_app.png)


## Example Voice Commands

Here are some example voice commands:

 * Turn on Office Lights
 * Dim/Brighten Office Lights (increments 15%)
 * Set Office Lights to 35%
 * Turn off Pool Waterfall
 * Turn on House Fan
 * Turn on Home Theater Scene
 * Set Basement Thermostat to 15 degrees
 * What is the current Basement Thermostat Temperature?
