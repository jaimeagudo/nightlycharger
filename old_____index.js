// Nightly Charger, http://github.com/jaimeagudo/nightlycharger
// Copyright (C) 2014 Jaime Agudo López
// GNU GPL v2

"use strict";

global.VARS={
	battery: {
		refreshInterval : 1000.
		chargingLimits : {
			max: 80,
			min: 40,
			minGap: 10
		},
	},
	notifications : {
		showTime: 1000,
		silent: true,
		shown: {
			plugin: false,
			unplug: false,
			pluginEco: false,
			unplugEco: false
		}
	},
	cheapMode: false,
};

function setRunAtLogin() {
	//TODO
	console.log("Set run at login");
}

function onShowNotif(){

	// // play sound on show
	// if(! global.VARS.notifications.silent){
	// 	// myAud=document.getElementById("notifAudio");
	// 	// myAud.play();
	// }

    // auto close after NOTIFICATIONS_SHOWTIME   
}


function showPluginNotification(title) {

	var notification = new Notification(title, {
		icon: "imgs/flag-red.png",
		body: "Battery discharging too deep, please plug in the charger"
	});

	notification.onshow = function(){
		if (! global.VARS.notifications.showTime > 0)
			setTimeout(function() {notification.close();}, global.VARS.notifications.showTime);
	}
}


function showUnplugNotification(title,sticky){

	var notification = new Notification(tittle, {
		icon: "imgs/flag-green.png",
		body: "Battery charged enough, please unplug the charger"
	});

	notification.onshow = function(){
		if (! global.VARS.notifications.showTime > 0)
			setTimeout(function() {notification.close();}, global.VARS.notifications.showTime);
	}
}

/**
 * Updates UI 
 */
 function checkLevels(){

 	batStatus=this.batteryMonitor.getStatus();

//	console.log("checkLevels"+JSON.stringify(batStatus));
if(global.VARS.cheapMode || leavingTime){
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
				! global.VARS.notifications.shown.unplugEco){
				global.VARS.notifications.shown.unplugEco=true;
			global.VARS.notifications.shown.pluginEco=false;
			showUnplugNotification( "Battery enough till " + cheapPeriodStart.format("hm"));
		}
		} else { //Discharging battery
			if((batteryDied.isBefore(cheapPeriodStart) ||
				batteryDied.isBefore(leavingTime)) && 
				! global.VARS.notifications.shown.pluginEco) {
				global.VARS.notifications.shown.pluginEco=true;
			global.VARS.notifications.shown.unplugEco=false;
			showPluginNotification( "Battery won't last till " + cheapPeriodStart.format("hm"));
		}
	}
}else{
		//80-40% mode
		if(batStatus.charging){
			if(batStatus.batteryLevel > global.VARS.battery.chargingLimits.max &&
				! global.VARS.notifications.shown.unplug){
				global.VARS.notifications.shown.plugin=false;
			global.VARS.notifications.shown.unplug=true;
			showUnplugNotification(global.VARS.battery.chargingLimits.max + " battery level reached");
		}
	}else{
		if(batStatus.batteryLevel < global.VARS.battery.chargingLimits.min &&
			! global.VARS.notifications.shown.plugin) {
			global.VARS.notifications.shown.plugin=true;
		global.VARS.notifications.shown.unplug=false;
		showPluginNotification(global.VARS.battery.chargingLimits.min + " battery level reached");
	}
}
}

}




	//DEV TOFIX
	// Load native UI library
	var gui = require('nw.gui');
	var _ = require('underscore');
	// gui.Window.get().show();
	var that=this;
	console.log("_.throttle=");
	console.log(_.throttle);

	gui.Window.get().showDevTools();

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
		checked: global.VARS.notifications.silent,
		// icon: 'A',
		click: function(){
			global.VARS.notifications.silent=this.che\cked;
		}
	}));


	//Levels
	//Nightly-eco mode
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ 
		type: 'normal',
		label: 'Quit',
		click: function(){
			that.batteryMonitor.delete();
			gui.App.quit();
		},
		key: "q",
		modifiers: "cmd"
	}));

	tray.menu = menu;
	
	try {
	    // Setup low-level battery watchdog
	    this.batteryMonitor=Battery.getInstance();
	    this.batteryMonitor.setAutoCheck(global.VARS.battery.refreshInterval);
	} catch (e) {
		console.log(JSON.stringify(e));
		// alert(e);
		gui.App.quit();
	}