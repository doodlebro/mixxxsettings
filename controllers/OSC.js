function OSC() {}
//############################################################################
//Vars to use for various things
//############################################################################
OSC.ShiftStop = 0;
OSC.tempTimer = 0;
OSC.slipToggle = 0;
OSC.slipHoldTimer = 0;
OSC.XforLoop = 8;


//############################################################################
//defaults
//############################################################################

OSC.midiChannel=0xB0;


//############################################################################
//INIT & SHUTDOWN
//############################################################################

OSC.init = function init() { // called when the device is opened & set up
	
	
	}

OSC.shutdown = function shutdown() {
	
	
	}

OSC.setup = function(obj) {
	

}

OSC.Loop = function (channel, control, value, status, group) {
	var loop = engine.getValue(group,"loop_enabled");
	if( value == 0x7F ) { //if button down only
	    if( loop == 0 ) {
		    engine.setValue(group,"beatloop_8_toggle",1)
		    engine.setValue(group,"beatloop_8_toggle",0)
	    }
	    else {
			engine.setValue(group,"reloop_exit",1)
			engine.setValue(group,"reloop_exit",0)
	    }
	}
}










