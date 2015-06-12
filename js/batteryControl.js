// Nightly Charger, http://github.com/jaimeagudo/nightlycharger
// Copyright (C) 2014 Jaime Agudo López
// GNU GPL v2

// Work derived from https://github.com/GoogleChrome/chrome-app-samples
// Apache License Version 2.0, January 2004 http://www.apache.org/licenses/

var BatteryControl = (function() {

  // Common functions used for tweaking Battery elements.
  function BatteryControl(limits){

	  	var that=this;
	  	this.limits=limits;

	   	//Globar vals EVIL
	   	var maxL=document.getElementById('maximum-level');
		//Initialize
		maxL.value=this.limits.max;
		maxL.onchange = function() {
			var newMax=parseInt(this.value, 10);
			var safeMax=that.limits.min + that.limits.minGap	
			if(newMax > safeMax ){
				that.limits.max=newMax;
			} else{
				that.limits.max=safeMax;
				this.value=safeMax;
			}

			that.setLevel("max");
			global.emitter.emit("batteryControl.newmax",that.limits.max);

		};
		var minL=document.getElementById('minimum-level');
		//Initialize
		minL.value=this.limits.min;
		minL.onchange = function() {

			var newMin=parseInt(this.value, 10);
			// console.log("newMin="+ newMin + "CHARGING_LIMITS=" +  JSON.stringify(CHARGING_LIMITS));
			var safeMin=that.limits.max - that.limits.minGap;
			if(newMin < safeMin){
				that.limits.min=newMin;
			} else{			
				that.limits.min=safeMin;
				this.value=safeMin;
			}

			that.setLevel("min");
			global.emitter.emit("batteryControl.newmin",that.limits.min);
		};

		that.setLevel("min");
		that.setLevel("max");
	}

BatteryControl.prototype.visible = function(b) {
	document.getElementById('no-devices-error').hidden = b;
	document.getElementById('info-div').hidden = !b;
};

BatteryControl.prototype.setLevel = function(way) {
	var level = way === "max" ? this.limits.max : this.limits.min;
	this.visible(true);

	var levelField = document.getElementById('battery-level-' + way);
	levelField.innerHTML = '';
	levelField.appendChild(document.createTextNode(level + '%'));

	var batteryBox = document.getElementById('battery-level-box-' + way);
	batteryBox.className = 'level '+way;
	batteryBox.style.width = level + '%';


};

BatteryControl.prototype.getLimits = function(){
	return this.limits;
};
	console.log("global="+JSON.stringify(global.vars));
	return new BatteryControl(global.vars.monitor.limits);


})();