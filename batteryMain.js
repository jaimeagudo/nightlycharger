

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
  

	Battery.getInstance().setLevel(0);
	require("nw.gui").Window.get().show();

}