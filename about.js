// Nightly Charger, http://github.com/jaimeagudo/nightlycharger
// Copyright (C) 2014 Jaime Agudo López
// GNU GPL v2

"use strict";

window.onload = function() {
  
	// Load native UI library
	var gui = require('nw.gui');
	// gui.Window.get().showDevTools();

	var fs = require("fs");
	fs.readFile("LICENSE", function (err, data) {
		if (err) throw err;       
		var licenseTA=document.getElementById("license");
		licenseTA.value=data;
	});
}