// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: leaf;
Location.setAccuracyToHundredMeters()
// location and weather data are stored in iCloud
const fm = FileManager.iCloud()
const dir = fm.joinPath(fm.documentsDirectory(), Script.name())
const locationData = fm.joinPath(dir, "current_location.json")
const weatherData = fm.joinPath(dir, "current_weather.json")
const currentDate = new Date()
const lastUpdated = fm.fileExists(weatherData) ? fm.modificationDate(weatherData) : currentDate
if(!fm.fileExists(dir)){
	fm.createDirectory(dir)
}
// get location
let loc = JSON.parse('{}')
try {
	loc = await Location.current()
	try {
		loc.locality = (await Location.reverseGeocode(loc.latitude, loc.longitude, ""))[0].locality		
	} catch (e) {
		// could not reverse geocode => set location to empty string
		console.log('Error: ' + e.message)
		loc.locality = ""		
	}
} catch (e) {
	// could not load location => read from file
	console.log('Error: ' + e.message)
	if (fm.fileExists(locationData)) {
		console.log('Reading location from file')
		loc = JSON.parse(fm.readString(locationData))			
	}
} finally {
	// save location to file
	fm.writeString(locationData, JSON.stringify(loc))
}
let hasLocation = JSON.stringify(loc) != '{}'
const lon = hasLocation ? loc.longitude : -1
const lat = hasLocation ? loc.latitude  : -1
console.log(`Displaying data for lon: ${lon} lat: ${lat}`)

// get weather data
let weather = JSON.parse('{}')
try {
	let req = new Request(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,alerts,hourly&appid=33c92b0552e0eea71460739025382726`)
	weather = await req.loadJSON()
	// save weather data to file
	fm.writeString(weatherData, JSON.stringify(weather))
} catch (e) {
	// could not load weather data => read from file
	console.log('Error: ' + e.message)
	if (fm.fileExists(weatherData)) {		
		console.log('Reading weather data from file')
		weather = JSON.parse(fm.readString(weatherData))
	}
}
var sunriseTime
var sunsetTime
var criticalTemp
var isNight
var nightTemp
var nightTempCritical
var minTemp
var minTempCritical
let tempBelowCritical = false
let hasWeather = JSON.stringify(weather) != '{}'
if (!hasWeather) {
	console.log("No weather data available")
} else {	
	sunriseTime = new Date(0)
	sunriseTime.setUTCSeconds(weather.daily[0].sunrise);
	sunsetTime = new Date(0)
	sunsetTime.setUTCSeconds(weather.daily[0].sunset);
	criticalTemp = args.widgetParameter != null ? parseInt(args.widgetParameter) : 15
	isNight = currentDate > sunsetTime
	nightTemp = weather.daily[0].temp.night
	nightTempCritical  = nightTemp <= criticalTemp
	minTemp = weather.daily[0].temp.min
	minTempCritical = minTemp <= criticalTemp
	tempBelowCritical = minTempCritical || nightTempCritical
}

// build widget
let widget = new ListWidget()
widget.backgroundColor = Color.lightGray()
widget.setPadding(10, 0, 10, 0)
let contentStack = widget.addStack()
let stackLeft = contentStack.addStack()
stackLeft.layoutVertically()
let localitySplit = (hasLocation ? loc.locality : "").split(" ")
contentStack.addSpacer(Math.max(10, (hasWeather ? 35 : 70) - (8 * localitySplit.length)))
let stackRight = contentStack.addStack()
stackRight.layoutVertically()
let stackRightTop = stackRight.addStack()
for (let i = 0; i < localitySplit.length; i++) {
	let stackRightTopInternal = stackRightTop.addStack()
	stackRightTopInternal.layoutVertically()
	stackRightTopInternal.size = new Size(8, 100)
	for (let letterIdx in localitySplit[i]) {
		let text = stackRightTopInternal.addText(localitySplit[i][letterIdx])
		text.font = Font.regularSystemFont(6)
	}
}
let stackRightBottom = stackRight.addStack()
// check if notification exists
let deliveredNotifications = (await Notification.allDelivered()).filter(notif => notif.threadIdentifier === Script.name())
let notifAccepted = false
let currentStateImg = ""
if (tempBelowCritical) {
	if (!isNight) {
		// critical temp extected
		currentStateImg = "house"
	} else if (lastUpdated < sunsetTime) {
		// notification pending
		currentStateImg = "hourglass"
	} else if (deliveredNotifications.length != 0) {
		// notifiction ignored
		currentStateImg = "xmark"
	} else {
		// notification accepted
		currentStateImg = "checkmark"
		notifAccepted = true
	}
}
if (currentStateImg.length != 0) {
	let currentState = stackRightBottom.addImage(SFSymbol.named(currentStateImg).image)
	currentState.imageSize = new Size(22,22)
}

let noDataString = "--"
// current temperature
let currentStack = stackLeft.addStack()
let currentCond = currentStack.addImage(hasWeather ? provideConditionSymbol(weather.current.weather[0].id, isNight) : SFSymbol.named("leaf.fill").image)
currentCond.imageSize = new Size(22,22)
const currentTemp = hasWeather ? `${weather.current.temp}°C` : noDataString
text = currentStack.addText(currentTemp)
stackLeft.addSpacer(10)

// night temperature
currentStack = stackLeft.addStack()
let nightTempImg = currentStack.addImage(SFSymbol.named("moon.stars.fill").image)
nightTempImg.imageSize = new Size(22,22)
text = currentStack.addText(hasWeather ? `${nightTemp}°C` : noDataString)
text.textColor = nightTempCritical ? Color.red() : Color.black()

// min temperature
currentStack = stackLeft.addStack()
let minTempImg = currentStack.addImage(SFSymbol.named("thermometer.snowflake").image)
minTempImg.imageSize = new Size(22,22)
text = currentStack.addText(hasWeather ? `${minTemp}°C` : noDataString)
text.textColor = minTempCritical ? Color.red() : Color.black()
stackLeft.addSpacer(10)

// sunrise
currentStack = stackLeft.addStack()
let sunriseImg = currentStack.addImage(SFSymbol.named("sunrise.fill").image)
sunriseImg.imageSize = new Size(22,22)
text = currentStack.addText(hasWeather ? sunriseTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : noDataString)

// sunset
currentStack = stackLeft.addStack()
let sunsetImg = currentStack.addImage(SFSymbol.named("sunset.fill").image)
sunsetImg.imageSize = new Size(22,22) 
text = currentStack.addText(hasWeather ? sunsetTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : noDataString)

// run widget
if (!config.runsInWidget) {
  await widget.presentSmall()
}
Script.setWidget(widget)
Script.complete()

// prepare alert/notification
if ((tempBelowCritical) && (isNight) && (!notifAccepted)) {
	// send new notification if no notification exists yet, or if too old
	let lastNotifTime = currentDate
	const minutesToWait = 10
	if (lastNotifTime.getMinutes() < minutesToWait) {
		lastNotifTime.setHours(lastNotifTime.getHours() - Math.floor(minutesToWait/60))
	}
	lastNotifTime.setMinutes(lastNotifTime.getMinutes() - (minutesToWait%60))
	let hasNewNotif = deliveredNotifications.some(notif => notif.deliveryDate > lastNotifTime)
	console.log(`${deliveredNotifications.length} notifications are currently delivered, with ${hasNewNotif ? "some" : "none"} delivered after ${lastNotifTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`)
	if (deliveredNotifications.length === 0 || !hasNewNotif) {
		let notification = new Notification()
		notification.title = "Nightly Plant Reminder"
		notification.threadIdentifier = Script.name()
		notification.body = `It's too cold outside (${Math.min(nightTemp, minTemp)}°C < ${criticalTemp}°C)🥶\nBring your plants inside 🪴->🏡`
		notification.sound = "alert"
		await notification.schedule()
		console.log(`notification for group ${notification.threadIdentifier} scheduled.`)
	}
}

// Provide a symbol based on the condition.
function provideConditionSymbol(cond,night) {
    const symbols = {
      "1": function() { return "exclamationmark.circle" },
      "2": function() { return "cloud.bolt.rain.fill" },
      "3": function() { return "cloud.drizzle.fill" },
      "5": function() { return (cond == 511) ? "cloud.sleet.fill" : "cloud.rain.fill" },
      "6": function() { return (cond >= 611 && cond <= 613) ? "cloud.snow.fill" : "snow" },
      "7": function() {
        if (cond == 781) { return "tornado" }
        if (cond == 701 || cond == 741) { return "cloud.fog.fill" }
        return night ? "cloud.fog.fill" : "sun.haze.fill"
      },
      "8": function() {
        if (cond == 800 || cond == 801) { return night ? "moon.stars.fill" : "sun.max.fill" }
        if (cond == 802 || cond == 803) { return night ? "cloud.moon.fill" : "cloud.sun.fill" }
        return "cloud.fill"
      },
    }
    return SFSymbol.named(symbols[Math.floor(cond / 100)]()).image
}