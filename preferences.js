// Nightly Charger, http://github.com/jaimeagudo/nightlycharger
// Copyright (C) 2014 Jaime Agudo López
// GNU GPL v2

"use strict";

var REFRESH_INTERVAL = 1000; //milliseconds
var NOTIFICATIONS_SHOWTIME = 1000; //milliseconds
var SILENT_NOTIFICATIONS = false;

var CHARGING_LIMITS = {
    max: 80,
    min: 40,
    minGap: 10
};

var CHEAP_MODE = false;


function setRunAtLogin() {
	//TODO
	console.log("Set run at login");
}

function onShowNotif(){

	// play sound on show
	if(!SILENT_NOTIFICATIONS){
		myAud=document.getElementById("notifAudio");
		myAud.play();
	}

    // auto close after NOTIFICATIONS_SHOWTIME
    if (!sticky)
    	setTimeout(function() {notification.close();}, NOTIFICATIONS_SHOWTIME);
}


function showPluginNotification(title,sticky) {

	var notification = new Notification(title, {
		icon: "imgs/flag-red.png",
		body: "Battery discharging too deep, please plug in the charger"
	});

	notification.onshow = onShowNotif; 
}


function showUnplugNotification(title,sticky){

	var notification = new Notification(tittle, {
		icon: "imgs/flag-green.png",
		body: "Battery charged enough, please unplug the charger"
	});

	notification.onshow = onShowNotif;
}

/**
* updates UI 
*/
function checkLevels(batStatus){

//	console.log("checkLevels"+JSON.stringify(batStatus));
	

	if(CHEAP_MODE || leavingTime){
		var now = moment();
		var cheapPeriodEnd, cheapPeriodStart;

		if(now.isDSTS()){                //true during summer
			cheapPeriodStart=moment({ hour : 23 });
			cheapPeriodEnd=moment({ hour : 13 });
		} else {
			cheapPeriodStart=moment({ hour : 22 });
			cheapPeriodEnd=moment({ hour : 12 });
		}

		var batteryDied=now.add(batStatus.remainingTime);		
		var leavingTime=moment("2182-05-04T00:00:00");

		if(batStatus.charging) {
			if( batteryDied.isAfter(cheapPeriodStart) || batteryDied.isAfter(leavingTime))
				showUnplugNotification( "Battery enough till " + cheapPeriodStart.format("hm"));
		} else { //Discharging battery
			if(batteryDied.isBefore(cheapPeriodStart))
				showPluginNotification( "Battery won't last till " + cheapPeriodStart.format("hm"));
		}
	}else{
		//80-40% mode
		if(batStatus.charging){
			if(batStatus.batteryLevel > CHARGING_LIMITS.max)
				showUnplugNotification( CHARGING_LIMITS.max + " battery level reached");
		}else{
			if(batStatus.batteryLevel < CHARGING_LIMITS.min)
				showPluginNotification( CHARGING_LIMITS.min + " battery level reached");
		}
	}
	
}

// window.onclose = function(){

// 	console.log("clicking on close");
// 	setTimeout(function() { console.log("exiting"); this.close(true); }, 5000);
// }



window.onload = function() {
  
	//DEV TOFIX
	// Load native UI library
	var gui = require('nw.gui');
	// gui.Window.get().show();

	gui.Window.get().showDevTools();
	var aboutWindowOptions= {
		"toolbar": false,
		"frame": true,
		"position": "center",
		"width": 200,
		"height": 274,
		"left": 100,
		"top": 100
	};
	var preferencesWindowOptions=aboutWindowOptions;
 
//https://github.com/rogerwang/node-webkit/wiki/Icons
// Create a tray icon
//https://github.com/google/material-design-icons/tree/master/device
	var tray = new gui.Tray({  icon: 'imgs/ic_battery_alert_black_24dp.png' });
	tray.tooltip="Nighlty charger";

	// Give it a menu
	var menu = new gui.Menu();
	menu.append(new gui.MenuItem({ 
		type: 'normal', 
		label: 'About',
		click: function(){
			gui.Window.get().hide();
			gui.Window.open("about.html", aboutWindowOptions);
		}
	}));
	menu.append(new gui.MenuItem({ type: 'separator'}));

	menu.append(new gui.MenuItem({ 
		type: 'checkbox',
		label: 'Run at login',
		click: setRunAtLogin,
		key: "l",
		modifiers: "cmd"
	}));
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ 
		type: 'normal',
		label: 'Preferences...',
		click: function(){
			gui.Window.get().hide();
			gui.Window.open("preferences.html", preferencesWindowOptions);
		}
	}));
	//Silent notifications
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ 
		type: "checkbox",
		label: "Silent notifications",
		tooltip: "Silent sound's notifications",
		key: "s",
		modifiers: "cmd"
		// icon: 'A',
		click: function(){
			SILENT_NOTIFICATIONS=this.checked;
		}
	}));


	//Levels
	//Nightly-eco mode
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ 
		type: 'normal',
		label: 'Quit',
		click: gui.App.quit,
		key: "q",
		modifiers: "cmd"
	}));

	tray.menu = menu;

	//Show the nice battery graphical control
	BatteryControl.getInstance(CHARGING_LIMITS);
	try {
	    // Setup low-level battery watchdog
	    Battery.getInstance(checkLevels,REFRESH_INTERVAL);
	} catch (e) {
		alert(e);
	    gui.App.quit();
	}
}
