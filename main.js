"use strict";

	var REFRESH_INTERVAL=1000; //milliseconds
	var NOTIFICATIONS_SHOWTIME=1000; //milliseconds

	var CHARGING_LIMITS={
		max: 80,
		min: 40,
		minGap: 10
	};

	var Q = require("q");
	var spawn = require('child_process').spawn;



function runCommand(cmd, args) {
    var deferred = Q.defer();
    var child = spawn(cmd, args);

    child.stdout.on('data', function (buffer) { 
    	child.stdout += buffer.toString();
    	deferred.notify();
    });

    child.stdout.on('end',function(){
    	deferred.resolve(child.stdout);
    });

	child.stderr.on('data', function (data) {
	  console.log('stderr: ' + data);
	  deferred.reject(new Error("stdeerr: " + data));  
	});

    return deferred.promise;
}

window.onfocus = function() { 
  // console.log("focus");
  // focusTitlebars(true);
}

window.onblur = function() { 
  // console.log("blur");
  // focusTitlebars(false);
}

window.onresize = function() {
  
}


function darwinBatteryParser(cmdOutput){

	var batteryLevelRE=/[0-9][0-9]?[0-9]?(?=%;)/
	var remainingBatteryTimeRE=/[0-9][0-9]?:[0-9][0-9]?(?= remaining)/i
	var dischargingRE=/discharging/i

	var batteryLevel;
	var matches;
	var status={};

	// console.log("parsing darwin battery status");

	matches=cmdOutput.match(batteryLevelRE);
	if(matches && matches.length){
		batteryLevel=parseInt(matches[0],10);
		if(isNaN(batteryLevel))
			console.log("Darwin script failed to figure out battery level")
		else{
			status.batteryLevel=batteryLevel;
		}
	}

	matches=cmdOutput.match(remainingBatteryTimeRE);
	if(matches && matches.length){
		 // console.log(matches[0]);
	   	//TODO		parseTime
		// var batteryLevel=parseInt(matches[0]);
		// if(isNaN(batteryLevel))
			// console.log("Darwin script failed to figure out battery remaining time")
		// else{
			status.remainingBatteryTime=matches[0];

		// }
	}

	matches=cmdOutput.match(dischargingRE);
	status.charging=! (matches && matches.length && (typeof matches[0] == "string"));

	return status;
}


function ubuntuBatteryParser(cmdOutput){
	var status={};

	if(cmdOutput && cmdOutput.length){
		var batteryLevel=parseInt(cmdOutput,10);
		if(isNaN(batteryLevel))
			console.log("Ubuntu script failed to figure out battery level")
		else
			return { batteryLevel: batteryLevel,
					 remainingBatteryTime: 100,
					 charging: false };
	}
	var status={};
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
function outlet(batStatus){

	// console.log(batStatus);
	// Battery.getInstance(CHARGING_LIMITS).setLevel(batStatus.batteryLevel);
	if(batStatus.charging){
		if(batStatus.batteryLevel > CHARGING_LIMITS.max)
			showUnplugNotification(CHARGING_LIMITS.max + " battery level reached");
	}else{
		if(batStatus.batteryLevel < CHARGING_LIMITS.min)
			showPluginNotification(CHARGING_LIMITS.min + " battery level reached");
	}
	// batStatus.remainingBatteryTime;
}


function batteryWatchDog(command,args,stdoutParser,errorCB){

	runCommand(command, args)
	.then(stdoutParser,errorCB)
	.then(outlet,errorCB);
}

window.onload = function() {
  
	//DEV TOFIX
	// Load native UI library
	var gui = require('nw.gui');
	gui.Window.get().showDevTools();
	gui.Window.get().show();


	//Globar vals EVIL
	var maxL=document.getElementById('maximum-level');
	//Initialize
	maxL.value=CHARGING_LIMITS.max;
	maxL.onchange = function() {
		var newMax=parseInt(this.value, 10);
		// console.log("newMax="+newMax +"CHARGING_LIMITS=" + JSON.stringify(CHARGING_LIMITS));
		var safeMax=CHARGING_LIMITS.min + CHARGING_LIMITS.minGap
		if(newMax > safeMax ){
			CHARGING_LIMITS.max=newMax;
		} else{
			CHARGING_LIMITS.max=safeMax;
			this.value=safeMax;
			// console.log("******* gap violed set max=" + this.value);
		}


		Battery.getInstance(CHARGING_LIMITS).setMaxLevel(CHARGING_LIMITS.max);
	};

	var minL=document.getElementById('minimum-level');
	//Initialize
	minL.value=CHARGING_LIMITS.min;
	minL.onchange = function() {

		var newMin=parseInt(this.value, 10);
		// console.log("newMin="+ newMin + "CHARGING_LIMITS=" +  JSON.stringify(CHARGING_LIMITS));
		var safeMin=CHARGING_LIMITS.max - CHARGING_LIMITS.minGap;
		if(newMin < safeMin){
			CHARGING_LIMITS.min=newMin;
		} else{			
			CHARGING_LIMITS.min=safeMin;
			this.value=safeMin;
			// console.log("******* gap violed set min=" + safeMin);
		}
		Battery.getInstance(CHARGING_LIMITS).setLevel(CHARGING_LIMITS.min);

	};


	var cmd, args, parser;
	var errorCB=function(e){
		console.log("error" + e);
	};

	//Setup custom battery script and parser based on the running OS
	switch(process.platform){ 
		case "win32": 
//http://www.robvanderwoude.com/files/battstat_xp.txt
//http://blogs.technet.com/b/heyscriptingguy/archive/2013/05/01/powertip-use-powershell-to-show-remaining-battery-time.aspx
//		(Get-WmiObject win32_battery).estimatedChargeRemaining
		case "darwin": 
			cmd="pmset";              
			args=["-g", "batt"];       
			parser=darwinBatteryParser;  
			break;
		default:
			break;
		case 'sunos' :
		case "freebsd":
		case "linux":
			cmd="upower -i $(upower -e | grep BAT) | grep --color=never -E percentage|xargs|cut -d' ' -f2|sed s/%//"
			args=null;
			parser=ubuntuBatteryParser;
			break;
	};

	var bindedWD=batteryWatchDog.bind(undefined,cmd,args,parser,errorCB);

	//Start Polling battery status at defined period
	bindedWD();
	window.setInterval(bindedWD, REFRESH_INTERVAL); 
//https://github.com/rogerwang/node-webkit/wiki/Icons

// Create a tray icon
//https://github.com/google/material-design-icons/tree/master/device
	var tray = new gui.Tray({  icon: 'imgs/ic_battery_alert_black_24dp.png' });
	tray.tooltip="Nighlty charger";

// Give it a menu
	var menu = new gui.Menu();
	menu.append(new gui.MenuItem({ type: 'checkbox', label: 'About Nightly Charger' }));
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ type: 'checkbox', label: 'Preferences...' }));
	//Silent notifications
	//Run at login
	//Levels
	//Nightly-eco mode
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ type: 'checkbox', label: 'Quit' }));
	tray.menu = menu;

}
