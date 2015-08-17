function NK2() {}
//############################################################################
//Vars to use for various things
//############################################################################
NK2.tempTimer = 0;
NK2.XforLoop = 8;


//############################################################################
//defaults
//############################################################################

NK2.midiChannel=0xB0;

//############################################################################
//references
//############################################################################
 

//list controls
NK2.Knob={1:0x10,2:0x11,3:0x12,4:0x13,5:0x14,6:0x15,7:0x16,8:0x17};
NK2.Sbutton={1:0x20,2:0x21,3:0x22,4:0x23,5:0x24,6:0x25,7:0x26,8:0x27};
NK2.Mbutton={1:0x30,2:0x31,3:0x32,4:0x33,5:0x34,6:0x35,7:0x36,8:0x37};
NK2.Rbutton={1:0x40,2:0x41,3:0x42,4:0x43,5:0x44,6:0x45,7:0x46,8:0x47};
NK2.leftButton={"trdown":0x3A,"trup":0x3B,"cycle":0x2E,"mset":0x3C,"mdown":0x3D,"mup":0x3E,"rev":0x2B,"ff":0x2C,"stop":0x2A,"play":0x29,"rec":0x2D};

//############################################################################
//INIT & SHUTDOWN
//############################################################################

NK2.init = function init() { // called when the device is opened & set up
	NK2.setup();
	
	}

NK2.shutdown = function shutdown() {
	
	
	}

// Buttons
NK2.LoopRoll = function(channel, control, value, status, group) {
    //if( NK2.ShiftStop == 0 ) {
		if( value == 0x7F ) { //if button down only
		    	//Channel1	Channel2
		    if( control == 0x20 || control == 0x21 ) {
			engine.setValue(group,"beatlooproll_0.5_activate",1);
		    }
		    if( control == 0x30 || control == 0x31 ) {
			engine.setValue(group,"beatlooproll_0.25_activate",1);
		    }
		    if( control == 0x40 || control == 0x41 ) {
			engine.setValue(group,"beatlooproll_0.125_activate",1);
		    }
		}
		
		else { //TODO: Logic for holding the looproll button down versus pressing it
		    	//Channel1	Channel2
		    if( control == 0x20 || control == 0x21 ) {
			engine.setValue(group,"beatlooproll_0.5_activate",0);
		    }
		    if( control == 0x30 || control == 0x31 ) {
			engine.setValue(group,"beatlooproll_0.25_activate",0);
		    }
		    if( control == 0x40 || control == 0x41 ) {
			engine.setValue(group,"beatlooproll_0.125_activate",0);
		    }
		}
}

NK2.ShortLoop  = function(channel, control, value, status, group) {
	if( value == 0x7F ) { //if button down only
		//Channel1	Channel2
	    if( control == 0x22 || control == 0x23 ) {
		var enabled = engine.getValue(group, "beatloop_0.5_enabled");
		if( enabled ) {
		    engine.setValue(group,"beatloop_0.5",0);
		}
		else {
		    engine.setValue(group,"beatloop_0.5",1);
		}
	    }
	    if( control == 0x32 || control == 0x33 ) {
		var enabled = engine.getValue(group, "beatloop_0.25_enabled");
		if( enabled ) {
		    engine.setValue(group,"beatloop_0.25",0);
		}
		else {
		    engine.setValue(group,"beatloop_0.25",1);
		}
	    }
	    if( control == 0x42 || control == 0x43 ) {
		var enabled = engine.getValue(group, "beatloop_0.125_enabled");
		if( enabled ) {
		    engine.setValue(group,"beatloop_0.125",0);
		}
		else {
		    engine.setValue(group,"beatloop_0.125",1);
		}
	    }
	}
	
	else {
	    
	}
}

NK2.LightLED = function (control) {
	midi.sendShortMsg(NK2.midiChannel, control, 0x7F);
}

NK2.DimLED = function(control) {
	midi.sendShortMsg(NK2.midiChannel, control, 0x00);
}

NK2.samplerTest = function(value, group, control) {
  if( value == 1 ) {
    engine.setValue(group, 'start_stop', 1)
    engine.setValue(group, 'start_stop', 0)
    engine.setValue(group, 'play', 0)
  }
  
  
}

NK2.setup = function(obj) {
  //setup trigger for sampler1 end playback
  engine.connectControl('[Sampler1]', 'playposition', 'NK2.samplerTest')

}










