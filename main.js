


function runCommand(cmd, args, cb, endCb) {
    var spawn = require('child_process').spawn,
        child = spawn(cmd, args),
        me = this;
    child.stdout.on('data', function (buffer) { cb(me, buffer) });
    child.stdout.on('end', endCb);
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

	var matches=cmdOutput.match(/[0-9][0-9]?[0-9]?%;/);

	if(matches && matches.length){
		var stringNumber=matches[0].replace("%;","");
		bateryLevel=parseInt(stringNumber);
		if(isNaN(bateryLevel))
			console.log("Darwin script failed to figure out battery level")
		else
			return bateryLevel;
	}
	return null;
}


function ubuntuBatteryParser(cmdOutput){


	if(cmdOutput && cmdOutput.length){
		bateryLevel=parseInt(cmdOutput);
		if(isNaN(bateryLevel))
			console.log("Ubuntu script failed to figure out battery level")
		else
			return bateryLevel;
	}
	return null;
}


window.onload = function() {
  
	Battery.getInstance().setLevel(0);
	require("nw.gui").Window.get().show();
	var command, args;

	switch(process.platform){
		case "win32":
		break;
		case 'darwin':
			command ="pmset"
			args=["-g", "batt"];
			bInfoParser=darwinBatteryParser;
			break;
		case 'freebsd':
		break;
		case 'linux':
			command="upower -i $(upower -e | grep BAT) | grep --color=never -E percentage|xargs|cut -d' ' -f2|sed s/%//"
			bInfoParser=ubuntuBatteryParser;
			break;
		case 'sunos' :
		break;

	}


	// Run C:\Windows\System32\netstat.exe -an
	var batteryStatus = new runCommand(
		command, args,
		function (me, buffer) { me.stdout += buffer.toString() },
		function () { 
	    	Battery.getInstance().setLevel(bInfoParser(batteryStatus.stdout));
	    }
	);
}






