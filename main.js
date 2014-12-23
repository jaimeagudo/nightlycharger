"use strict";

	var REFRESH_INTERVAL=1000; //milliseconds
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
  console.log("focus");
  // focusTitlebars(true);
}

window.onblur = function() { 
  console.log("blur");
  // focusTitlebars(false);
}

window.onresize = function() {
  
}


function darwinBatteryParser(cmdOutput){

	var batteryLevelRE=/[0-9][0-9]?[0-9]?(?=%;)/
	var remainingBatteryTimeRE=/[0-9][0-9]?:[0-9][0-9]?(?= remaining)/i

	var batteryLevel;
	var matches;
	var status={};

	console.log("parsing darwin battery status");

	matches=cmdOutput.match(batteryLevelRE);
	if(matches && matches.length){
		batteryLevel=parseInt(matches[0]);
		if(isNaN(batteryLevel))
			console.log("Darwin script failed to figure out battery level")
		else{
			status.batteryLevel=batteryLevel;
			// batteryLevel;
			// var b= { batteryLevel: batteryLevel,
			// 		 remainingBatteryTime: 100,
			// 		 charging: true };
		}
	}

	matches=cmdOutput.match(remainingBatteryTimeRE);
	if(matches && matches.length){
		 console.log(matches[0]);
	//TODO		parseTime
		// var batteryLevel=parseInt(matches[0]);

		// if(isNaN(batteryLevel))
			// console.log("Darwin script failed to figure out battery remaining time")
		// else{
			status.remainingBatteryTime=matches[0];


		// }
	}
	return status;
}


function ubuntuBatteryParser(cmdOutput){
	var status={};

	if(cmdOutput && cmdOutput.length){
		var batteryLevel=parseInt(cmdOutput);
		if(isNaN(batteryLevel))
			console.log("Ubuntu script failed to figure out battery level")
		else
			return { batteryLevel: batteryLevel,
					 remainingBatteryTime: 100,
					 charging: false };
	}
	var status={};
}

/**
* updates UI 
*/
function outlet(batStatus){

	console.log(batStatus);
	Battery.getInstance().setLevel(batStatus.batteryLevel);

	// batStatus.remainingBatteryTime;
	// batStatus.charging;
}


function batteryWatchDog(command,args,stdoutParser,errorCB){

	runCommand(command, args)
	.then(stdoutParser,errorCB)
	.then(outlet,errorCB);
}

window.onload = function() {
  
	// Battery.getInstance().setLevel(0);
	require("nw.gui").Window.get().show();


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

	//Start Polling battery status at defined period
	batteryWatchDog(cmd,args,parser,errorCB);
	window.setInterval(batteryWatchDog.bind(undefined,cmd,args,parser,errorCB), REFRESH_INTERVAL); 

}






