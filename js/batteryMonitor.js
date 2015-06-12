// Owl Charger, http://github.com/jaimeagudo/nightlycharger
// Copyright (C) 2014 Jaime Agudo López
// GNU GPL v2

var Battery = (function() {

	var instance;

	var spawn = require('child_process').spawn;
	var Q = require('q');
	var moment = require('moment');
	var _ = require('underscore');

	function Battery(){

		// this.batStatusListener=batStatusListener;

		//Setup custom battery script and parser based on the running OS
		switch(process.platform){ 
			case "win32": 
			//http://www.robvanderwoude.com/files/battstat_xp.txt
			//http://blogs.technet.com/b/heyscriptingguy/archive/2013/05/01/powertip-use-powershell-to-show-remaining-battery-time.aspx
			//		(Get-WmiObject win32_battery).estimatedChargeRemaining
			case "darwin": 
				this.command="pmset";              
				this.args=["-g", "batt"];       
				this.parser=Battery.darwinParser;  
				break;
			default:
				break;
			case 'sunos' :
			case "freebsd":
			case "linux":
				this.command="upower -i $(upower -e | grep BAT) | grep --color=never -E percentage|xargs|cut -d' ' -f2|sed s/%//"
				this.args=null;
				this.parser=Battery.ubuntuParser;
				break;
		};

		if(! this.command){
			Battery.errorCB("Non compatible with "+  process.platform + ", cannot figure out battery status");
		}

		var bindCheck=_.bind(this.check,this);
		bindCheck(this);
		this.timer=setInterval(bindCheck, global.vars.monitor.intervalMs, this); 
	}
	Battery.prototype.status={};

	Battery.prototype.batStatusListener=function(status){
		global.emitter.emit("batteryMonitor.update",status);
	};

	//Returns a promise on the status check 
	Battery.prototype.check = function(a){
		a= a || this;
		//console.log("check");

		this.status=Battery.runCommand(a.command, a.args)
			.then(a.parser,Battery.errorCB)
			.then(a.batStatusListener,Battery.errorCB);

	};

	Battery.prototype.delete = function(){
		this.timer && clearInterval(this.timer);
		this.status = {};
		this.instance = null;
	};


	Battery.errorCB = function(e){
		console.log("** Error=" + e);
		throw e;
	};


	Battery.runCommand = function(cmd, args) {
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
	};



	Battery.darwinParser = function(cmdOutput){

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
			status.remainingBatteryTime=moment.duration(matches[0]);
		}

		matches=cmdOutput.match(dischargingRE);
		status.charging=! (matches && matches.length && (typeof matches[0] == "string"));
		console.log(JSON.stringify(status));
		return status;
	};



	Battery.ubuntuParser = function(cmdOutput){
		var status={};

		if(cmdOutput && cmdOutput.length){
			var batteryLevel=parseInt(cmdOutput,10);
			if(isNaN(batteryLevel))
				console.log("Ubuntu script failed to figure out battery level")
			else
				//TODO
				return { 
					batteryLevel: batteryLevel,
					remainingBatteryTime: 100,
					charging: false 
				};
		}
		return status;
	};

	return {
		getInstance: function(){
			if (!instance) {
				instance = new Battery();
			}
			return instance;
		}
	};

})();
