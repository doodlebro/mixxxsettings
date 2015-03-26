function S4DJ() {}
//############################################################################
//Vars to use for various things
//############################################################################
S4DJ.ShiftStop = 0;
S4DJ.loopEdit = 0;
S4DJ.tempTimer = 0;
S4DJ.slipToggle = 0;
S4DJ.slipHoldTimer = 0;
S4DJ.XforLoop = 8;
S4DJ.scratching = [false, false];


//############################################################################
//defaults
//############################################################################

S4DJ.midiChannel=0x91;

//############################################################################
//references
//############################################################################
 

//list controls
S4DJ.FX=[
	{"rate":0x03,"amount":0x05,"filter":0x0A,"flange":0x0C,"slice":0x0E,"delay":0x10},
	
	{"rate":0x04,"amount":0x06,"filter":0x09,"flange":0x0B,"slice":0x0D,"delay":0x0F}
	];
S4DJ.Loop=[{"loop":0x12,"/":0x14,"*":0x16,"reloop":0x18},

	   {"loop":0x11,"/":0x13,"*":0x15,"reloop":0x17}
	  ];
S4DJ.Transport=[
		{"play":0x24,"cue":0x26,"sync":0x28,"tap":0x2A,"touch":0x20,"scratch":0x22,"pfl":0x1E},
		
		{"play":0x23,"cue":0x25,"sync":0x27,"tap":0x29,"touch":0x1F,"scratch":0x21,"pfl":0x1D}
		];
S4DJ.LEDS=[

	   {"keylock":0x30,"autopitch":0x36,"level":0x32,"autodj":0x34,"1":0x01,"3":0x03,"5":0x05,"7":0x07},
	    
	   {"keylock":0x31,"autopitch":0x37,"level":0x33,"autodj":0x35,"2":0x01,"4":0x03,"6":0x05,"8":0x07}
	   ];

//############################################################################
//INIT & SHUTDOWN
//############################################################################

S4DJ.init = function init() { // called when the device is opened & set up
	S4DJ.setup();
    
	midi.sendShortMsg(0xB1, 0x30, 0x20);
	
	engine.setValue("[Samplers]", "show_samplers", 1);
	engine.setValue("[EffectRack1]", "show", 1);
	
	//set samplers to always headphone cue
	engine.setValue("[Sampler1]", "pfl", 1);
	engine.setValue("[Sampler2]", "pfl", 1);
	engine.setValue("[Sampler3]", "pfl", 1);
	engine.setValue("[Sampler4]", "pfl", 1);
	engine.setValue("[Sampler5]", "pfl", 1);
	
	engine.setValue("[EffectRack1]", "clear", 1);
	engine.setValue("[EffectRack1]", "clear", 0);
	
	//LEFT EFFECTS
	//First effect flanger
	engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 1);
	
	//second effect filter
	engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
	
	//RIGHT EFFECTS
	//first effect echo
	engine.setValue("[EffectRack1_EffectUnit2_Effect1]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit2_Effect1]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit2_Effect1]", "prev_effect", 1);
	
	//second effect bitcrusher
	engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
	engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
	
	}

S4DJ.shutdown = function shutdown() {
	S4DJ.DimLED()
	
	
	}
	
	//LED Hook Functions

//Play, Sync, Cue

	
S4DJ.LEDonPlay1 = function() {
	var tempState = engine.getValue("[Channel1]","play_indicator");
	if ( tempState ) midi.sendShortMsg(S4DJ.midiChannel, S4DJ.Transport[0]["play"], 0x01);
	else  midi.sendShortMsg(S4DJ.midiChannel, S4DJ.Transport[0]["play"], 0x00);
}

S4DJ.LEDonPlay2 = function() {
	var tempState = engine.getValue("[Channel2]","play_indicator");
	if ( tempState ) midi.sendShortMsg(S4DJ.midiChannel, S4DJ.Transport[1]["play"], 0x01);
	else  midi.sendShortMsg(S4DJ.midiChannel, S4DJ.Transport[1]["play"], 0x00);
}

S4DJ.groupToDeck = function(group) {
    var matches = group.match(/^\[Channel(\d+)\]$/);
    if (matches == null) {
        return -1;
    } else {
        return matches[1];
    }
}

// Buttons
S4DJ.Loop = function(channel, control, value, status, group) {
    var deck = S4DJ.groupToDeck(group);
    var loopEnabled = engine.getValue(group,"loop_enabled");
    if( S4DJ.loopEdit == 1 ) {
	if( loopEnabled ) {
	    if( control == 0x12 || control == 0x11 ) {
		engine.setValue(group, "reloop_exit", 1);
		engine.setValue(group, "reloop_exit", 0);
		engine.setValue(group, "reloop_exit", 1);
		engine.setValue(group, "reloop_exit", 0);
	    }
	    
	    else if( control == 0x14 || control == 0x13 ) {
		engine.setValue(group, "loop_move_1_backward", 1);
		engine.setValue(group, "loop_move_1_backward", 0);
	    }
	    
	    else if( control == 0x16 || control == 0x15 ) {
		engine.setValue(group, "loop_move_1_forward", 1);
		engine.setValue(group, "loop_move_1_forward", 0);
	    }
	}
	
	else{
	    if( control == 0x12 || control == 0x11 ) {
		engine.setValue(group, "beatloop_8_activate", 1);
	    }
	    
	    else if( control == 0x14 || control == 0x13 ) {
		
	    }
	    
	    else if( control == 0x16 || control == 0x15 ) {
		
	    }
	    
	}
    }
    
    else {
	if( loopEnabled ) {
	    if( control == 0x12 || control == 0x11 ) {
		engine.setValue(group, "reloop_exit", 1);
		engine.setValue(group, "reloop_exit", 0);
	    }
	    
	    else if( control == 0x14 || control == 0x13 ) {
		engine.setValue(group, "loop_halve", 1);
		engine.setValue(group, "loop_halve", 0);
	    }
	    
	    else if( control == 0x16 || control == 0x15 ) {
		engine.setValue(group, "loop_double", 1);
		engine.setValue(group, "loop_double", 0);
	    }
	}
	
	else{
	    if( control == 0x12 || control == 0x11 ) {
		engine.setValue(group, "beatloop_8_activate", 1);
	    }
	    
	    else if( control == 0x14 || control == 0x13 ) {
		
	    }
	    
	    else if( control == 0x16 || control == 0x15 ) {
		
	    }
	    
	}
    }
}

S4DJ.Reloop = function(channel, control, value, status, group) {
    if( status == 0x91 ) {
	if( S4DJ.loopEdit == 0 ) {
	    S4DJ.loopEdit = 1;
	}
	else {
	    S4DJ.loopEdit = 0;
	}
    }
}

S4DJ.toggleScratchMode = function(channel, control, value, status, group) {
    /*
    var deck = S4DJ.groupToDeck(group);
    if( status == 0x91 ) {
	if( S4DJ.scratching[deck-1] ) {
	    S4DJ.scratching[deck-1] = false;
	    S4DJ.DimLED(0x22);
	}
	else {
	    S4DJ.scratching[deck-1] = true;
	    S4DJ.LightLED(0x22);
	}
    }
    */
}

S4DJ.WheelTouch = function (channel, control, value, status, group) {
    var deck = S4DJ.groupToDeck(group);
    if (status == 0x91 && S4DJ.scratching[deck-1] ) {    // If button down
        var alpha = 1.0/8;
        var beta = alpha/64;
	S4DJ.LightLED(0x20);
        engine.scratchEnable(deck, 280, 33+1/3, alpha, beta);
    }
    if (value == 0x00) {    // If button up
        engine.scratchDisable(deck);
	S4DJ.DimLED(0x20);
    }
    
}
 
// The wheel that controls the scratching and jogging
S4DJ.jogWheel = function (channel, control, value, status, group) {
    var deck = S4DJ.groupToDeck(group);

    var adjustedJog = parseFloat(value);
    adjustedJog = value - 64;
    var posNeg = adjustedJog;

    if (engine.isScratching(deck)) {
        engine.scratchTick(deck, adjustedJog);
    }

    else
    {
        var gammaInputRange = 11;    // Max jog speed
        var maxOutFraction = 1.8;    // Where on the curve it should peak; 0.5 is half-way
        var sensitivity = 0.5;        // Adjustment gamma
        var gammaOutputRange = 200;    // Max rate change
        if (engine.getValue(group,"play")) {
            adjustedJog = (posNeg * gammaOutputRange * Math.pow(Math.abs(adjustedJog) / (gammaInputRange * maxOutFraction), sensitivity)) / gammaOutputRange * maxOutFraction;
        } else {
            adjustedJog = gammaOutputRange * adjustedJog / (gammaInputRange * maxOutFraction);
        }
        engine.setValue(group, "jog", adjustedJog);
    }
    
}	

S4DJ.Shift = function (channel, control, value, status, group) {
	if( value == 0x7F ) {
		if(S4DJ.ShiftStop == 0) {
			S4DJ.tempTimer = engine.beginTimer(333,"S4DJ.LightShift");
			S4DJ.ShiftStop = 1;
		}
		else {
			S4DJ.ShiftStopper();
		}
	}
	
}

S4DJ.LightShift = function (channel, control, value, status, group) {
	S4DJ.LightLED(0x40);
	S4DJ.LightShiftLED();
	engine.beginTimer("55","S4DJ.DimLED(0x40)",true);
	engine.beginTimer("55","S4DJ.LightLED(0x41)",true);
	engine.beginTimer("111","S4DJ.DimLED(0x41)",true);
	engine.beginTimer("111","S4DJ.LightLED(0x42)",true);
	engine.beginTimer("166","S4DJ.DimLED(0x42)",true);
	engine.beginTimer("166","S4DJ.LightLED(0x43)",true);
	engine.beginTimer("222","S4DJ.DimLED(0x43)",true);
	engine.beginTimer("222","S4DJ.LightLED(0x42)",true);
	engine.beginTimer("278","S4DJ.DimLED(0x42)",true);
	engine.beginTimer("278","S4DJ.LightLED(0x41)",true);
	engine.beginTimer("333","S4DJ.DimLED(0x41)",true);
	
}


S4DJ.LightLED = function (control) {
	midi.sendShortMsg(S4DJ.midiChannel, control, 0x01);
}

S4DJ.blinkfastLED = function (control) {
    midi.sendShortMsg(S4DJ.midiChannel, control, 0x16);
}

S4DJ.DimLED = function(control) {
	midi.sendShortMsg(S4DJ.midiChannel, control, 0x00);
}

S4DJ.LightShiftLED = function () {
	midi.sendShortMsg(S4DJ.midiChannel, 0x44, 0x06);
}

S4DJ.DimShiftLED = function () {
	midi.sendShortMsg(S4DJ.midiChannel, 0x44, 0x00);
}

S4DJ.ShiftStopper = function () {
	engine.stopTimer(S4DJ.tempTimer);
	S4DJ.ShiftStop = 0;
	S4DJ.DimShiftLED;
	engine.beginTimer("334","S4DJ.linkPostShift",true);
}

S4DJ.setSlipToggle = function () {
	S4DJ.slipToggle = 2;
}

S4DJ.linkPostShift = function () {

}



S4DJ.setup = function(obj) {
	
	//Play LEDS
	engine.connectControl("[Channel1]", "play_indicator", "S4DJ.LEDonPlay1");//
	engine.trigger("[Channel1]", "play_indicator");
	
	engine.connectControl("[Channel2]", "play_indicator", "S4DJ.LEDonPlay2");//
	engine.trigger("[Channel2]", "play_indicator");
	
	
}










