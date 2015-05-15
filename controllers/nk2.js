function NK2() {}
//############################################################################
//Vars to use for various things
//############################################################################
NK2.ShiftStop = 0;
NK2.tempTimer = 0;
NK2.slipToggle = 0;
NK2.slipHoldTimer = 0;
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
	/*
	//LED Hook Functions
//Sampler Play button LEDs
NK2.LEDonPlaySampler1 = function() {
	var tempState = engine.getValue("[Sampler1]","play_indicator");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x44, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x44, 0x00);
}

NK2.LEDonPlaySampler2 = function() {
	var tempState = engine.getValue("[Sampler2]","play_indicator");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x45, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x45, 0x00);
}

NK2.LEDonPlaySampler3 = function() {
	var tempState = engine.getValue("[Sampler3]","play_indicator");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x46, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x46, 0x00);
}

NK2.LEDonPlaySampler4 = function() {
	var tempState = engine.getValue("[Sampler4]","play_indicator");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x47, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x47, 0x00);
}
*/

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
    /*}
    
    else {
	if( value == 0x7F ) { //if button down only
		//Channel1	Channel2
	    if( control == 0x31 || control == 0x33 ) {
		
	    }
	    
	    if( control == 0x41 || control == 0x43 ) {
		
	    }
	}
	
	else {
	    if( control == 0x31 || control == 0x33 ) {
		
	    }
	    
	    if( control == 0x41 || control == 0x43 ) {
		
	    }   
	}
	NK2.ShiftStopper();
    }*/
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

NK2.Shift = function (channel, control, value, status, group) {
	if( value == 0x7F ) {
		if(NK2.ShiftStop == 0) {
			NK2.tempTimer = engine.beginTimer(333,"NK2.LightShift");
			NK2.ShiftStop = 1;
		}
		else {
			NK2.ShiftStopper();
		}
	}
	
}

NK2.LightShift = function (channel, control, value, status, group) {
	NK2.LightLED(0x20);
	NK2.LightShiftLED();
	engine.beginTimer("55","NK2.DimLED(0x20)",true);
	engine.beginTimer("55","NK2.LightLED(0x30)",true);
	engine.beginTimer("111","NK2.DimLED(0x30)",true);
	engine.beginTimer("111","NK2.LightLED(0x40)",true);
	engine.beginTimer("166","NK2.DimLED(0x40)",true);
	engine.beginTimer("166","NK2.LightLED(0x41)",true);
	engine.beginTimer("222","NK2.DimLED(0x41)",true);
	engine.beginTimer("222","NK2.LightLED(0x31)",true);
	engine.beginTimer("278","NK2.DimLED(0x31)",true);
	engine.beginTimer("278","NK2.LightLED(0x21)",true);
	engine.beginTimer("333","NK2.DimLED(0x21)",true);
	engine.beginTimer(50,"NK2.DimShiftLED",true);
	
}

NK2.LightLED = function (control) {
	midi.sendShortMsg(NK2.midiChannel, control, 0x7F);
}

NK2.DimLED = function(control) {
	midi.sendShortMsg(NK2.midiChannel, control, 0x00);
}

NK2.LightShiftLED = function () {
	midi.sendShortMsg(NK2.midiChannel, 0x2A, 0x7F);
}

NK2.DimShiftLED = function () {
	midi.sendShortMsg(NK2.midiChannel, 0x2A, 0x00);
}

NK2.ShiftStopper = function () {
	engine.stopTimer(NK2.tempTimer);
	NK2.ShiftStop = 0;
	NK2.DimShiftLED;
	engine.beginTimer("334","NK2.linkPostShift",true);
}

NK2.setSlipToggle = function () {
	NK2.slipToggle = 2;
}

NK2.linkPostShift = function () {
	engine.trigger("[EffectRack1_EffectUnit1]", "group_[Channel1]_enable");
	engine.trigger("[EffectRack1_EffectUnit1]", "group_[Channel2]_enable");
	engine.trigger("[EffectRack1_EffectUnit1_Effect1]", "enabled");
	engine.trigger("[EffectRack1_EffectUnit1_Effect2]", "enabled");
}

NK2.setup = function(obj) {
	/*
	//sampler stop&begin
	engine.connectControl("[Sampler1]","play_indicator","NK2.LEDonPlaySampler1");
	engine.trigger("[Sampler1]","play_indicator");
	
	engine.connectControl("[Sampler2]","play_indicator","NK2.LEDonPlaySampler2");
	engine.trigger("[Sampler2]","play_indicator");
	
	engine.connectControl("[Sampler3]","play_indicator","NK2.LEDonPlaySampler3");
	engine.trigger("[Sampler3]","play_indicator");
	
	engine.connectControl("[Sampler4]","play_indicator","NK2.LEDonPlaySampler4");
	engine.trigger("[Sampler4]","play_indicator");
	*/
}










