// Nightly Charger, http://github.com/jaimeagudo/nightlycharger
// Copyright (C) 2014 Jaime Agudo López
// GNU GPL v2

"use strict";

global.vars=require('../config.json');

function setRunAtLogin() {
	//TODO
	console.log("Set run at login");
}

function onShowNotif(sticky){

	// play sound on show
	if(!global.vars.notifications.silent){
		// myAud=document.getElementById("notifAudio");
		// myAud.play();
	}

    // auto close after notifications.showTimeMs
    if (!sticky)
    	setTimeout(function() {notification.close();}, global.vars.notifications.showTimeMs);
}


function showPluginNotification(title,sticky) {

	var notification = new Notification(title, {
		icon: "../img/flag-red.png",
		body: "Battery discharging too deep, please plug in the charger"
	});

	notification.onshow = onShowNotif.bind(this,title, global.vars.notifications.sticky);
}


function showUnplugNotification(title,sticky){

	var notification = new Notification(title, {
		icon: "../img/flag-green.png",
		body: "Battery charged enough, please unplug the charger"
	});

	notification.onshow = onShowNotif.bind(this,title,global.vars.notifications.sticky);
}

/**
 * Updates UI 
 */
 function checkLevels(batStatus){

//	console.log("checkLevels"+JSON.stringify(batStatus));
if(global.vars.monitor.cheapMode || leavingTime){
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
				! global.state.notifications.shown.unplugEco){
				global.state.notifications.shown.unplugEco=true;
			global.state.notifications.shown.pluginEco=false;
			showUnplugNotification( "Battery enough till " + cheapPeriodStart.format("hm"));
		}
		} else { //Discharging battery
			if((batteryDied.isBefore(cheapPeriodStart) ||
				batteryDied.isBefore(leavingTime)) && 
				! global.state.notifications.shown.pluginEco) {
				global.state.notifications.shown.pluginEco=true;
			global.state.notifications.shown.unplugEco=false;
			showPluginNotification( "Battery won't last till " + cheapPeriodStart.format("hm"));
		}
	}
}else{
		//80-40% mode
		if(batStatus.charging){
			if(batStatus.batteryLevel > global.vars.monitor.limits.max &&
				! global.state.notifications.shown.unplug){
				global.state.notifications.shown.plugin=false;
			global.state.notifications.shown.unplug=true;
			showUnplugNotification(global.vars.monitor.limits.max + " battery level reached");
		}
	}else{
		if(batStatus.batteryLevel < global.vars.monitor.limits.min &&
			! global.state.notifications.shown.plugin) {
			global.state.notifications.shown.plugin=true;
		global.state.notifications.shown.unplug=false;
		showPluginNotification(global.vars.monitor.limits.min + " battery level reached");
	}
}
}

}


function createMenu(quitCallback){


	var preferencesWindowOptions= {
		"toolbar": false,
		"frame": true,
		// "position": "center",
		"width": 160,
		"height": 240
		// "left": 100,
		// "top": 100
	};

	var aboutWindowOptions= {
		"toolbar": false,
		"frame": true,
		// "position": "center",
		"width": 400,
		"height": 600
		// "left": 100,
		// "top": 100
	};

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
			global.vars.notifications.silent=this.checked;
		}
	}));


	//Levels
	//Nightly-eco mode
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ 
		type: 'normal',
		label: 'Quit',
		click: function(){
			quitCallback;
			gui.App.quit();
		},
		key: "q",
		modifiers: "cmd"
	}));

	return menu;
}


//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
// BOOTSTRAP 

global.state= {
	notifications: { 
		shown: {
			"plugin" : false,
			"unplug" : false,
			"pluginEco": false, 
			"unplugEco": false
		}
	}
};

try {
	// Load native UI library
	var gui = require('nw.gui');
	gui.Window.get().showDevTools();

	var _ = require('underscore');
	var EventEmitter=require('events').EventEmitter;
	global.emitter= new EventEmitter();

	global.emitter.on('newmin', function (min) {
		console.log('min!='+min);
		global.vars.monitor.limits.min=min;
	});

	global.emitter.on('newmax', function (max) {
		console.log('max!='+max);
		global.vars.monitor.limits.max=max;
	});


    // Setup low-level battery watchdog
    this.batteryMonitor=Battery.getInstance();
    this.batteryMonitor.setAutoCheck(checkLevels,global.vars.monitor.intervalMs);

	//Credits to https://github.com/rogerwang/node-webkit/wiki/Icons
	// Create a tray icon
	//https://github.com/google/material-design-icons/tree/master/device

	var tray = new gui.Tray({  icon: 'img/ic_battery_alert_black_24dp.png' });
	tray.tooltip="Nighlty charger";
	tray.menu = createMenu(this.batteryMonitor.delete);

} catch (e) {
	console.log(JSON.stringify(e));
	// alert(e);
	this.batteryMonitor.delete();
	gui.App.quit();
}