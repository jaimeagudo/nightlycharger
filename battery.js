// github.com/jaimeagudo
// Extracted from https://github.com/GoogleChrome/chrome-app-samples
// Apache License Version 2.0, January 2004 http://www.apache.org/licenses/

var Battery = (function() {

  // Common functions used for tweaking Battery elements.
  function Battery(limits) {
  	this.MAX_LEVEL=limits.max;
  	this.MIN_LEVEL=limits.min;
  }

  // Global instance.
  var instance;

   Battery.prototype.show = function(){
   	document.getElementById('no-devices-error').hidden = true;
    document.getElementById('info-div').hidden = false;
   }

  Battery.prototype.hide = function(b) {
    document.getElementById('no-devices-error').hidden = false;
    document.getElementById('info-div').hidden = true;
  };

  Battery.prototype.setMinLevel = function(level) {

	if(typeof level !== "number"){
		this.hide();
		return;
	} else{
		this.show();
	}

    var levelField = document.getElementById('battery-level-min');

    levelField.innerHTML = '';
    levelField.appendChild(document.createTextNode(level + ' %'));

    var batteryBox = document.getElementById('battery-level-box-min');
    var levelClass;

    // if (level > this.MAX_LEVEL) {
    //   levelClass = 'high';
    // } else if (level > this.MIN_LEVEL) {
    //   levelClass = 'medium';
    // } else {
      levelClass = 'medium';
    // }

    batteryBox.className = 'level ' + levelClass;
    batteryBox.style.width = level + '%';
  };


  Battery.prototype.setMaxLevel = function(level) {

	if(typeof level !== "number"){
		this.hide();
		return;
	} else{
		this.show();
	}

    var levelField = document.getElementById('battery-level-max');

    levelField.innerHTML = '';
    levelField.appendChild(document.createTextNode(level + ' %'));

    var batteryBox = document.getElementById('battery-level-box-max');
    var levelClass;

    // if (level > this.MAX_LEVEL) {
      levelClass = 'high';
    // } else if (level > this.MIN_LEVEL) {
    //   levelClass = 'medium';
    // } else {
    //   levelClass = 'low';
    // }

    batteryBox.className = 'level ' + levelClass;
    batteryBox.style.width = level + '%';
  };

  return {
    getInstance: function() {
      if (!instance) {
        instance = new Battery(arguments);
      }

      return instance;
    }
  };

})();