// Nightly Charger, http://github.com/jaimeagudo/nightlycharger
// Copyright (C) 2014 Jaime Agudo López
// GNU GPL v2

"use strict";

window.onload = function() {
  
	//DEV TOFIX
	// Load native UI library
	var gui = require('nw.gui');
	// gui.Window.get().show();

	gui.Window.get().showDevTools();

	//Show the nice battery graphical control
	BatteryControl.getInstance(data.CHARGING_LIMITS,data.minListener,data.maxListener);

}