// Owl Charger, http://github.com/jaimeagudo/nightlycharger
// Copyright (C) 2014 Jaime Agudo López
// GNU GPL v2

"use strict";

global.vars=require('../config.json');

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// UI FUNCTIONALITY ////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

function setRunAtLogin() {
	//TODO
	console.log("Set run at login");
}

function onShowNotif(){

	// play sound on show
	if(!global.vars.notifications.silent){
		// myAud=document.getElementById("notifAudio");
		// myAud.play();
	}

    // auto close after notifications.showTimeMs
    if (!global.vars.notifications.sticky)
    	setTimeout(function() {notification.close();}, global.vars.notifications.showTimeMs);
}


function showPluginNotification(title) {

	var notification = new Notification(title, {
		icon: "../img/flag-red.png",
		body: "Battery discharging too deep, please plug in the charger"
	});

	notification.onshow = onShowNotif.bind(this,title);
}


function showUnplugNotification(title){

	var notification = new Notification(title, {
		icon: "../img/flag-green.png",
		body: "Battery charged enough, please unplug the charger"
	});

	notification.onshow = onShowNotif.bind(this,title);
}


function createMenu(quitCallback){


	var preferencesWindowOptions= {
		"toolbar": false,
		"frame": true,
		// "position": "center",
		"width": 200,
		"height": 260
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
	//Owl-eco mode
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
/////////////////////////////////////// BUSINESS LOGIC ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

 function ecoCheck(batStatus){

 	console.log("ecoCheck"+JSON.stringify(batStatus));

 	var now = moment();
 	var cheapPeriodEnd, cheapPeriodStart;

 	var cheapPeriod= now.isDSTS() ? global.vars.ecoMode.DSTSPeriod : global.vars.ecoMode.normalPeriod;
 	cheapPeriodStart=moment(cheapPeriod.start);
 	cheapPeriodEnd=moment(cheapPeriod.end);

 	console.log("remainingTime="+batStatus.remainingTime);

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
}

/**
*
*/
function healthyCheck(batStatus){
 	console.log("healthyCheck"+JSON.stringify(batStatus));

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
	var _ = require('underscore');
	var EventEmitter=require('events').EventEmitter;

	gui.Window.get().showDevTools();
	global.emitter= new EventEmitter();

	global.emitter.on('batteryControl.newmin', function (min) {
		console.log('batteryControl.newmin='+min);
		global.vars.monitor.limits.min=min;
	});

	global.emitter.on('batteryControl.newmax', function (max) {
		console.log('batteryControl.newmax='+max);
		global.vars.monitor.limits.max=max;
	});

	var checkLevels= (global.vars.ecoMode.active || leavingTime) ? ecoCheck : healthyCheck;
	global.emitter.on('batteryMonitor.update', checkLevels);


    // Setup low-level battery watchdog
    this.batteryMonitor=Battery.getInstance();

	// Create a tray icon
	//Credits to https://github.com/rogerwang/node-webkit/wiki/Icons
	//https://github.com/google/material-design-icons/tree/master/device
	var tray = new gui.Tray({  
		// icon: 'img/ic_battery_alert_black_24dp.png',
		icon: 'img/owl2.png',
		tooltip: 'Owl charger ' + String.fromCharCode(9790),
		menu: createMenu(this.batteryMonitor.delete)
	});

} catch (e) {
	console.log(JSON.stringify(e));
	// alert(e);
	// this.batteryMonitor.delete();
	gui.App.quit();
}