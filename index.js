// Nightly Charger, http://github.com/jaimeagudo/nightlycharger
// Copyright (C) 2014 Jaime Agudo López
// GNU GPL v2

"use strict";

global.vars={
	REFRESH_INTERVAL : 1000, //milliseconds
	NOTIFICATIONS_SHOWTIME : 1000, //milliseconds
	SILENT_NOTIFICATIONS : false,
	CHARGING_LIMITS : {
		max: 80,
		min: 40,
		minGap: 10
	},
	CHEAP_MODE : false,
	NOTIFICATIONS_SHOWN: {
		plugin: false,
		unplug: false
	}
};

function setRunAtLogin() {
	//TODO
	console.log("Set run at login");
}

function onShowNotif(){

	// play sound on show
	if(!global.vars.SILENT_NOTIFICATIONS){
		// myAud=document.getElementById("notifAudio");
		// myAud.play();
	}

    // auto close after NOTIFICATIONS_SHOWTIME
    if (!sticky)
    	setTimeout(function() {notification.close();}, global.vars.NOTIFICATIONS_SHOWTIME);
}


function showPluginNotification(title,sticky) {

	var notification = new Notification(title, {
		icon: "imgs/flag-red.png",
		body: "Battery discharging too deep, please plug in the charger"
	});

	notification.onshow = onShowNotif.bind(this,title,sticky);
}


function showUnplugNotification(title,sticky){

	var notification = new Notification(tittle, {
		icon: "imgs/flag-green.png",
		body: "Battery charged enough, please unplug the charger"
	});

	notification.onshow = onShowNotif.bind(this,title,sticky);
}

/**
 * Updates UI 
 */
function checkLevels(batStatus){

//	console.log("checkLevels"+JSON.stringify(batStatus));
	if(global.vars.CHEAP_MODE || leavingTime){
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
			if((batteryDied.isAfter(cheapPeriodStart) ||
			   batteryDied.isAfter(leavingTime)) && 
			  ! global.vars.NOTIFICATIONS_SHOWN.unplugEco){
				global.vars.NOTIFICATIONS_SHOWN.unplugEco=true;
				global.vars.NOTIFICATIONS_SHOWN.pluginEco=false;
				showUnplugNotification( "Battery enough till " + cheapPeriodStart.format("hm"));
			}
		} else { //Discharging battery
			if((batteryDied.isBefore(cheapPeriodStart) ||
			   batteryDied.isBefore(leavingTime)) && 
			  ! global.vars.NOTIFICATIONS_SHOWN.pluginEco) {
				global.vars.NOTIFICATIONS_SHOWN.pluginEco=true;
				global.vars.NOTIFICATIONS_SHOWN.unplugEco=false;
				showPluginNotification( "Battery won't last till " + cheapPeriodStart.format("hm"));
			}
		}
	}else{
		//80-40% mode
		if(batStatus.charging){
			if(batStatus.batteryLevel > global.vars.CHARGING_LIMITS.max &&
				! global.vars.NOTIFICATIONS_SHOWN.unplug){
				global.vars.NOTIFICATIONS_SHOWN.plugin=false;
				global.vars.NOTIFICATIONS_SHOWN.unplug=true;
				showUnplugNotification(global.vars.CHARGING_LIMITS.max + " battery level reached");
			}
		}else{
			if(batStatus.batteryLevel < global.vars.CHARGING_LIMITS.min &&
				! global.vars.NOTIFICATIONS_SHOWN.plugin) {
				global.vars.NOTIFICATIONS_SHOWN.plugin=true;
				global.vars.NOTIFICATIONS_SHOWN.unplug=false;
				showPluginNotification(global.vars.CHARGING_LIMITS.min + " battery level reached");
			}
		}
	}
	
}
 
	//DEV TOFIX
	// Load native UI library
	var gui = require('nw.gui');
	// gui.Window.get().show();

//	gui.Window.get().showDevTools();

	var aboutWindowOptions= {
		"toolbar": false,
		"frame": true,
		// "position": "center",
		"width": 400,
		"height": 500
		// "left": 100,
		// "top": 100
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
		modifiers: "cmd",
		// icon: 'A',
		click: function(){
			global.vars.SILENT_NOTIFICATIONS=this.checked;
		}
	}));


	//Levels
	//Nightly-eco mode
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ 
		type: 'normal',
		label: 'Quit',
		click: function(){
			this.batteryMonitor.delete();
			gui.App.quit();
		},
		key: "q",
		modifiers: "cmd"
	}));

	tray.menu = menu;
	
	try {
	    // Setup low-level battery watchdog
	    this.batteryMonitor=Battery.getInstance(checkLevels,global.vars.REFRESH_INTERVAL);
	} catch (e) {
		console.log(JSON.stringify(e));
		// alert(e);
	    gui.App.quit();
	}