var main = (function() {
  // GATT Battery Service UUIDs

  function BatteryLevelDemo() {  }

  /**
   * Sets up the UI for the given service by retrieving its characteristic and
   * setting up notifications.
   */
  BatteryLevelDemo.prototype.selectService = function(service) {
    // Hide or show the appropriate elements based on whether or not
    // |serviceId| is undefined.
    UI.getInstance().resetState(!service);

    // Disable notifications from the currently selected Battery Level
    this.updateBatteryLevelValue();  // Initialize to unknown

    if (!service) {
      console.log('No service selected.');
    //  return;
    }

    // Get the characteristics of the selected service.
    var self = this;
  };

  BatteryLevelDemo.prototype.updateBatteryLevelValue = function() {

    // var batteryLevel = valueBytes[0];
    var batteryLevel=69;
    console.log('updating Battery Level value : ' + batteryLevel);
    UI.getInstance().resetState(false);
    UI.getInstance().setBatteryLevel(batteryLevel);
  };

  

  BatteryLevelDemo.prototype.init = function() {
    // Set up the UI to look like no device was initially selected.
    this.selectService(null);

    // Store the |this| to be used by API callbacks below.
    var self = this;
};
  return {
    BatteryLevelDemo: BatteryLevelDemo
  };

}) ();


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

window.onload = function() {
  

  var demo = new main.BatteryLevelDemo();
  demo.init();
  demo.updateBatteryLevelValue(); 

  require("nw.gui").Window.get().show();


}