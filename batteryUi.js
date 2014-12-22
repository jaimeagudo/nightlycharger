var UI = (function() {

  // Common functions used for tweaking UI elements.
  function UI() { }

  // Global instance.
  var instance;

  UI.prototype.resetState = function(noDevices) {
    document.getElementById('no-devices-error').hidden = !noDevices;
    document.getElementById('info-div').hidden = noDevices;
    this.clearAllFields();
  };

  UI.prototype.clearAllFields = function() {
    this.setBatteryLevel(null);
  };

  UI.prototype.setBatteryLevel = function(level) {

    var levelField = document.getElementById('battery-level');
    var value = (level == null) ? '-' : level + ' %';

    levelField.innerHTML = '';
    levelField.appendChild(document.createTextNode(value));

    var batteryBox = document.getElementById('battery-level-box');

    if (level == null) {
      batteryBox.style.width = '0%';
      return;
    }

    var levelClass;

    if (level > 65) {
      levelClass = 'high';
    } else if (level > 30) {
      levelClass = 'medium';
    } else {
      levelClass = 'low';
    }

    batteryBox.className = 'level ' + levelClass;
    batteryBox.style.width = level + '%';
    console.log("done");
  };

 

  return {
    getInstance: function() {
      if (!instance) {
        instance = new UI();
      }

      return instance;
    }
  };

})();