"use strict";

	var REFRESH_INTERVAL=1000; //milliseconds
	var NOTIFICATIONS_SHOWTIME=1000; //milliseconds

	var CHARGING_LIMITS={
		max: 80,
		min: 40,
		minGap: 10
	};



function setRunAtLogin(){
	console.log("Set run at login");
}



function showPluginNotification(title,sticky){


	var notification = new Notification(title, {
		icon: "imgs/flag-red.png",
		body: "Battery discharging too deep, please plug in the charger"
	});

	// notification.onclick = function () {
	// 	notification.close();
	// }

	notification.onshow = function () {
	  // play sound on show
	  // myAud=document.getElementById("audio1");
	  // myAud.play();

	  // auto close after NOTIFICATIONS_SHOWTIME
	  if(!sticky)
	  	setTimeout(function() {notification.close();}, NOTIFICATIONS_SHOWTIME);
	}
}


function showUnplugNotification(title,sticky){

	var notification = new Notification(tittle, {
		icon: "imgs/flag-green.png",
		body: "Battery charged enough, please unplug the charger"
	});

	notification.onshow = function () {
	  // play sound on show
	  // myAud=document.getElementById("audio1");
	  // myAud.play();

	  // auto close after NOTIFICATIONS_SHOWTIME
	  if(!sticky)
	  	setTimeout(function() {notification.close();}, NOTIFICATIONS_SHOWTIME);
	}
}

/**
* updates UI 
*/
function checkLevels(batStatus){

	console.log("checkLevels"+batStatus);
	if(batStatus.charging){
		if(batStatus.batteryLevel > CHARGING_LIMITS.max)
			showUnplugNotification( CHARGING_LIMITS.max + " battery level reached");
	}else{
		if(batStatus.batteryLevel < CHARGING_LIMITS.min)
			showPluginNotification( CHARGING_LIMITS.min + " battery level reached");
	}
}



window.onload = function() {
  
	//DEV TOFIX
	// Load native UI library
	var gui = require('nw.gui');
	gui.Window.get().showDevTools();
	gui.Window.get().show();

	

	

	

//https://github.com/rogerwang/node-webkit/wiki/Icons

// Create a tray icon
//https://github.com/google/material-design-icons/tree/master/device
	var tray = new gui.Tray({  icon: 'imgs/ic_battery_alert_black_24dp.png' });
	tray.tooltip="Nighlty charger";

// Give it a menu
	var menu = new gui.Menu();
	menu.append(new gui.MenuItem({ type: 'normal', label: 'About Nightly Charger' }));
	menu.append(new gui.MenuItem({ type: 'separator'}));

	menu.append(new gui.MenuItem({ 
		type: 'checkbox',
		label: 'Run at login',
		click: setRunAtLogin,
		key: "l",
		modifiers: "cmd"
	}));
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ type: 'normal', label: 'Preferences...' }));
	//Silent notifications
	//Run at login
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
