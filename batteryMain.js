var main = (function() {
  // GATT Battery Service UUIDs

  function BatteryLevelDemo() {
    // A mapping from device addresses to device names for found devices that
    // expose a Battery service.

    // The currently selected service and its characteristic.
    this.service_ = null;
    this.batteryLevelChrc_ = null;

  }

  /**
   * Sets up the UI for the given service by retrieving its characteristic and
   * setting up notifications.
   */
  BatteryLevelDemo.prototype.selectService = function(service) {
    // Hide or show the appropriate elements based on whether or not
    // |serviceId| is undefined.
    UI.getInstance().resetState(!service);

  

    // Disable notifications from the currently selected Battery Level
    

    this.batteryLevelChrc_ = null;
    this.updateBatteryLevelValue();  // Initialize to unknown

    if (!service) {
      console.log('No service selected.');
    //  return;
    }

//    console.log('GATT service selected: ' + service.instanceId);

    // Get the characteristics of the selected service.
    var self = this;
  };

  BatteryLevelDemo.prototype.updateBatteryLevelValue = function() {


    // if (!this.batteryLevelChrc_) {
    //   console.log('No Battery Level Characteristic selected');
    //   UI.getInstance().setBatteryLevel(null);
    //   return;
    // }

    // // Value field might be undefined if the read request failed or no
    // // notification has been received yet.
    // if (!this.batteryLevelChrc_.value) {
    //   console.log('No Battery Level value received yet');
    //   return;
    // }

    // var valueBytes = this.batteryLevelChrc_.value;

    // // The value should contain a single byte.
    // if (valueBytes.length != 1) {
    //   console.log('Invalid Battery Level value length: ' + valueBytes.length);
    //   return;
    // }

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
  updateContentStyle();
}

window.onload = function() {
  // initCheckbox("top-box", "top-titlebar", "top-titlebar.png", "Top Titlebar");
  // initCheckbox("bottom-box", "bottom-titlebar", "bottom-titlebar.png", "Bottom Titlebar");
  // initCheckbox("left-box", "left-titlebar", "left-titlebar.png", "Left Titlebar");
  // initCheckbox("right-box", "right-titlebar", "right-titlebar.png", "Right Titlebar");
  
  // document.getElementById("close-window-button").onclick = function() {
  //   window.close();
  // }
  
  // updateContentStyle();

  var demo = new main.BatteryLevelDemo();
  demo.init();
  demo.updateBatteryLevelValue(); 

  require("nw.gui").Window.get().show();


}


// document.addEventListener('DOMContentLoaded', function() {
//   var demo = new main.BatteryLevelDemo();
//   demo.init();
// });