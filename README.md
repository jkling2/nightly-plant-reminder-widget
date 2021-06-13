# :leaves: nightly-plant-reminder-widget

This widget reminds you to bring your plants inside in case it's too cold outside.

## Design
<img src="./img/expected-too-cold.png" align="left" width="250" height="250">
The widget displays the current temperature (in degree Celcius) and the current weather condition at the top. The expected temperature at night and the minimum temperature are displayed below. These are displayed in red if they are less than the low-temperature. In addition, the time of sunrise and sunset are displayed below. The current location of the shown weather data is displayed on the right.


## Functionality
This widget reminds you at night-time (after sunset), to bring your plants inside, in case the expected daily minimum or the nightly temperature is less than the accepted low-temperature. The low-temperature can be provided to the widget, or the default low-temperature (15°C) will be used.
During day-time, the widget displays in the bottom left what to expect at night. The image of a house indicates that it will be too cold outside for the plants and that they need to be brought inside. No image indicates that the daily minimun or nightly temperature is expected to be above the low-temperature.
Once night-time is reached and it is too cold outside, a notification is scheduled:
<img src="./img/notification.png" width="150" height="150">
From now on either an hour-glass, a x-mark or a check-mark are displayed in the bottom left:
* :hourglass: The hour-glass indicates that a notification was send.
* :x: The x-mark indicates that the notification was not resolved yet. A new notification will bew send the earliest after 10 minutes.
* :heavy_check_mark: The check-mark indicates that the notification was resolved and the plants are safely inside.
<img src="./img/notification-send.png" width="150" height="150">

If your phone has no internet connection or if the data could not be loaded from the website, the following widget screen is shown:
<p align="center">
<img src="./img/no-data.png" width="150" height="150">
</p>

## Requirements
* Apple Device with iOS 14.
* Scriptable latest (https://scriptable.app/).

## Setup
1. Copy the source code for ```nightly-plant-reminder-widget.js``` ("raw").
2. Open Scriptable.
3. Select "+" and insert the copy of the script.
4. Choose the title of the script (e. g. Nightly Plant Reminder).
5. Save with "Done".
6. Go back to the iOS Homescreen and get into the "wiggle mode".
7. Press the "+" symbol and look for "Scriptable".
8. Choose widget size (small) and "Add widget".
9. Go into the settings of the widget to edit it.
* Choose script of step #4.
* Provide the low-temperature in degree Celcius (default is 15°C)


**Enjoy the widget!**