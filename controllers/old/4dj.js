function S4DJ() {}
//############################################################################
//Vars to use for various things
//############################################################################
S4DJ.shiftStop = 0;
S4DJ.touchShift = [false, false];
S4DJ.loopEdit = [false, false];
S4DJ.beatgridEdit = [false, false];
S4DJ.touchModifier = 16;
S4DJ.loopRollHeld = [false, false];
S4DJ.loopRollHoldTimer = ["null", "null"]
S4DJ.stopIt = [false, false]
S4DJ.timer = ["null", "null"];
S4DJ.slipToggle = 0;
S4DJ.slipHoldTimer = 0;
S4DJ.scratching = [false, false];
S4DJ.quantize = [true, true];
S4DJ.effectList = [{"one":"flanger","two":"moog"},{"one":"echo","two":"bitcrush"}]


//############################################################################
//defaults
//############################################################################

S4DJ.midiChannel=0x97;

//############################################################################
//references
//############################################################################
 

//list controls
S4DJ.FX=[{"rate":0x03,"amount":0x05,"filter":0x0A,"flange":0x0C,"slice":0x0E,"delay":0x10},
	
	{"rate":0x04,"amount":0x06,"filter":0x09,"flange":0x0B,"slice":0x0D,"delay":0x0F}
	];
S4DJ.Loop=[{"loop":0x12,"/":0x14,"*":0x16,"reloop":0x18},

	   {"loop":0x11,"/":0x13,"*":0x15,"reloop":0x17}
	  ];
S4DJ.Transport=[{"selknob":0xFF,"back":0xFF,"enter":0xFF},

		{"play":0x24,"cue":0x26,"sync":0x28,"tap":0x2A,"touch":0x20,"scratch":0x22,"bgedit":0x41,"pfl":0x1E},
		
		{"play":0x23,"cue":0x25,"sync":0x27,"tap":0x29,"touch":0x1F,"scratch":0x21,"bgedit":0x42,"pfl":0x1D}
		];
S4DJ.LEDS=[{"rec":0xFF},

	   {"keylock":0x30,"autopitch":0x36,"level":0x32,"autodj":0x34, 1:0x01,"3":0x03,"5":0x05,"7":0x07},
	    
	   {"keylock":0x31,"autopitch":0x37,"level":0x33,"autodj":0x35, 2:0x02,"4":0x03,"6":0x05,"8":0x07}
	   ];

//############################################################################
//INIT & SHUTDOWN
//############################################################################

S4DJ.init = function init() { // called when the device is opened & set up	
	//enable keylock
	engine.setValue("[Channel1]", "keylock", 1);
	engine.setValue("[Channel2]", "keylock", 1);

    S4DJ.dimLED(S4DJ.Transport[1]["play"])
    S4DJ.dimLED(S4DJ.Transport[2]["play"])
	
	}

S4DJ.shutdown = function shutdown() {
	for( var i = 0x00; i <= 0x7F; i++ ) {
	    S4DJ.dimLED(i);
	}	
}
	
	//LED Hook Functions

//Play, Sync, Cue

	


S4DJ.groupToDeck = function(group) {
    var matches = group.match(/^\[Channel(\d+)\]$/);
    if (matches == null) {
        return -1;
    } else {
        return matches[1];
    }
}

// Buttons
S4DJ.loop = function(channel, control, value, status, group) {
    var deck = S4DJ.groupToDeck(group)
    var loopEnabled = engine.getValue(group,"loop_enabled")
    /**
     *		loopEdit enabled
     */
    if( S4DJ.loopEdit[deck-1] ) {
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
		engine.setValue(group, "reloop_exit", 1);
		engine.setValue(group, "reloop_exit", 0);

	    }
	    
	    else if( control == 0x14 || control == 0x13 ) {
		
	    }
	    
	    else if( control == 0x16 || control == 0x15 ) {
		
	    }
	    
	}
    }
    /**
     * loopEdit Disabled
     */
    
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
		engine.setValue(group, "beatloop", 4);
	    }
	    
	    else if( control == 0x14 || control == 0x13 ) {
		engine.setValue(group, "beatloop", 8);
	    }
	    
	    else if( control == 0x16 || control == 0x15 ) {
		engine.setValue(group, "beatloop", 16);
	    }
	    
	}
    }
}

S4DJ.reLoop = function(channel, control, value, status, group) {
    var deck = S4DJ.groupToDeck(group);
    if( status == 0x97 ) {
	if( S4DJ.loopEdit[deck-1] == false ) {
	    S4DJ.loopEdit[deck-1] = true;
	    S4DJ.lightLED(S4DJ.Loop[deck-1]["reloop"]);
	}
	else {
	    S4DJ.loopEdit[deck-1] = false;
	    S4DJ.dimLED(S4DJ.Loop[deck-1]["reloop"]);
	}
    }
}

S4DJ.beatgridManipulate = function(channel, control, value, status, group) {
    
    var deck = S4DJ.groupToDeck(group);
    var posNeg = 0;
    if( deck == 2 ) {
	posNeg = -1;
    }
    else {
	posNeg = 1;
    }
    
    if( status == 0x97 ) {
	if( S4DJ.beatgridEdit[deck-1] == true && S4DJ.beatgridEdit[deck+posNeg-1] == true ) {
	    
	}
	
	else if( S4DJ.beatgridEdit[deck-1] == false && S4DJ.beatgridEdit[deck+posNeg-1] == true ) {
	    S4DJ.beatgridEdit[deck+posNeg-1] == false;
	    S4DJ.dimLED(S4DJ.Transport[deck+posneg]["bgedit"]);
	    S4DJ.beatgridEdit[deck-1] == true;
	    S4DJ.lightLED(S4DJ.Transport[deck]["bgedit"]);
	}
	
	else if( S4DJ.beatgridEdit[deck-1] == false && S4DJ.beatgridEdit[deck+posNeg-1] == false ) {
	    S4DJ.beatgridEdit[deck-1] == true;
	    S4DJ.lightLED(S4DJ.Transport[deck]["bgedit"]);
	}
	
	else if( S4DJ.beatgridEdit[deck-1] == true && S4DJ.beatgridEdit[deck+posNeg-1] == false ) {
	    S4DJ.beatgridEdit[deck-1] == false;
	    S4DJ.dimLED(S4DJ.Transport[deck]["bgedit"]);
	}
    }
    
    
    
    
}

S4DJ.toggleScratchMode = function(channel, control, value, status, group) {
    
    var deck = S4DJ.groupToDeck(group);
    if( status == 0x97 ) {
	if( S4DJ.scratching[deck-1] ) {
	    S4DJ.scratching[deck-1] = false;
	    S4DJ.dimLED(S4DJ.Transport[deck]["scratch"]);
	}
	else {
	    S4DJ.scratching[deck-1] = true;
	    S4DJ.lightLED(S4DJ.Transport[deck]["scratch"]);
	}
    }
    
}

S4DJ.slipOn = function(group) {
    engine.setValue(group, 'slip_enabled', 1)
}

S4DJ.slipOff = function(group) {
    engine.setValue(group, 'slip_enabled', 0)
}

S4DJ.wheelTouch = function (channel, control, value, status, group) {
    var deck = S4DJ.groupToDeck(group);
    /*
     * Handle starting scratch motion
     */
    if (status == 0x97 && S4DJ.scratching[deck-1]) {
        var alpha = 1.0/8;
        var beta = alpha/32;
        engine.scratchEnable(deck, 280, 33+1/3, alpha, beta);
    }
    /* Handle when not scratching, sets modifier lower when finger is on platter */
    else if(status == 0x97 && !S4DJ.scratching[deck-1]) {
	S4DJ.touchModifier = 1;
    }
    /* Handle letting go of the wheel, reset modifier and disable scratching */
    else if (status == 0x87) {    // If button up
        engine.scratchDisable(deck);
	    S4DJ.touchModifier = 16;
    }
}

S4DJ.shift = function(channel, control, value, status, group) {
    var deck = S4DJ.groupToDeck(group);

    if( status == 0x97 ) {
        if( !S4DJ.touchShift[deck-1] ) {
            S4DJ.touchShift[deck-1] = true;
            S4DJ.lightLED(S4DJ.Transport[deck]["touch"]);
        }
        else {
            S4DJ.touchShift[deck-1] = false;
            S4DJ.dimLED(S4DJ.Transport[deck]["touch"]);
        }
        }
}
 
// The wheel that controls the scratching and jogging
S4DJ.jogWheel = function (channel, control, value, status, group) {
    var deck = S4DJ.groupToDeck(group);

    var adjustedJog = parseFloat(value);
    adjustedJog = value - 64;
    var posNeg = adjustedJog;
    /**
     * If loopEdit enabled, jogwheel edits loop position finely
     * 
     */
    if( S4DJ.loopEdit[deck-1] ) {
	if( adjustedJog > 0 ) {
	    engine.setValue(group, "loop_move_0.03125_forward", 1);
	}
	else {
	    engine.setValue(group, "loop_move_0.03125_backward", 1);
	}
	return;
    }
    /**
     * If loopEdit disabled but shift enabled, jogwheel adjusts BPM grid width
     * 
     */
    else if( !S4DJ.loopEdit[deck-1] && S4DJ.touchShift[deck-1] ) {
        if( adjustedJog > 0 ) {
            engine.setValue(group, "beats_adjust_slower", 1);
        }
        else {
            engine.setValue(group, "beats_adjust_faster", 1);
        }
        return;
    }
  
    /**
     *  Handle scratching the proper way
     * 
     */
    if ( engine.isScratching(deck) && !S4DJ.loopEdit[deck-1] ) {
	engine.scratchTick(deck, adjustedJog);
    }
    
    /**
     * If not scratch and not loop edit, jogging
     * 
     */
    else {
      var gammaInputRange = 5;    // Max jog speed
      var maxOutFraction = 0.99;    // Where on the curve it should peak; 0.5 is half-way
      var sensitivity = 0.9;        // Adjustment gamma
      var gammaOutputRange = 3;    // Max rate change
      if (engine.getValue(group,"play")) {
	  if( control == 0x0D || control == 0x0E ) {
	      adjustedJog = (posNeg * gammaOutputRange * Math.pow(Math.abs(adjustedJog) / (gammaInputRange * maxOutFraction), sensitivity)) / gammaOutputRange * maxOutFraction;
	  }
	  else {
	      adjustedJog = 0.5 * adjustedJog;
	  }
      } else {
	  adjustedJog = S4DJ.touchModifier * gammaOutputRange * adjustedJog / (gammaInputRange * maxOutFraction);
      }
      
      engine.setValue(group, "jog", adjustedJog);
    }
    
}

S4DJ.loopRollHold = function(deck) {
  if( !S4DJ.stopIt[deck-1] ) {
    S4DJ.loopRollHeld[deck-1] = true;
  }
  
  S4DJ.stopIt[deck-1] = false
}

S4DJ.loopRoll = function(channel, control, value, status, group) {
  var deck = S4DJ.groupToDeck(group)
  if( value == 0x7F ) { //if button down only
    S4DJ.quantizeToggle(group)
    engine.stopTimer(S4DJ.loopRollHoldTimer[deck-1])
    S4DJ.loopRollHoldTimer[deck-1] = engine.beginTimer(300, "S4DJ.loopRollHold(" + deck + ")", true)
	//Channel1	Channel2
    if( control == 0x01 || control == 0x02 ) {
	engine.setValue(group,"beatlooproll_1_activate",1);
    }
    else if( control == 0x03 || control == 0x04 ) {
	engine.setValue(group,"beatlooproll_0.5_activate",1);
    }
    else if( control == 0x05 || control == 0x06 ) {
	engine.setValue(group,"beatlooproll_0.25_activate",1);
    }
    else if( control == 0x07 || control == 0x08 ) {
	engine.setValue(group,"beatlooproll_0.125_activate",1);
    }

    S4DJ.quantizeToggle(group)
  }

  else { 	  //Channel1	Channel2
    S4DJ.stopIt[deck-1] = true
    if( control == 0x01 || control == 0x02 ) {
      if( S4DJ.loopRollHeld[deck-1] ){
	//S4DJ.quantizeToggle(group)
      }
      engine.setValue(group,"beatlooproll_1_activate",0);
    }
    else if( control == 0x03 || control == 0x04 ) {
      engine.setValue(group,"beatlooproll_0.5_activate",0);
    }
    else if( control == 0x05 || control == 0x06 ) {
	engine.setValue(group,"beatlooproll_0.25_activate",0);
    }
    else if( control == 0x07 || control == 0x08 ) {
	engine.setValue(group,"beatlooproll_0.125_activate",0);
    }
    S4DJ.loopRollHeld[deck-1] = false
    //engine.beginTimer(50, 'S4DJ.quantizeToggle("' + group + '")', 1)
  }
}

S4DJ.record = function (channel, control, value, status, group) {
  recordStatus = engine.getValue(group, 'status')
  if( recordStatus ) {
    S4DJ.dimLED(0x44)
    engine.setValue(group, 'status', 0)
  }
  else {
    S4DJ.lightLED(0x44)
    engine.setValue(group, 'status', 1)
  }
  
}

S4DJ.quantizeToggle = function(group) {
  var quantized = engine.getValue(group, 'quantize')
  if( quantized ) {
    engine.setValue(group,"quantize",0)
  }
  else {
    engine.setValue(group,"quantize",1)
  }
}

S4DJ.handleQuantize = function (value, group, control) {
  var deck = S4DJ.groupToDeck(group)
  var quantized = engine.getValue(group, 'quantize')

  engine.stopTimer(S4DJ.timer[deck-1])
  if( quantized ) {//init
    if( deck == 2 ) {
	value += 1
    }
    S4DJ.timer[deck-1] = engine.beginTimer(250,"S4DJ.flash("+ value +", 125)")
    S4DJ.quantize[deck-1] = true
  }
  else {
    S4DJ.quantize[deck-1] = false
  }


}

S4DJ.beatJump = function(group, beats, dir) {
    engine.setValue(group, 'beatjump_' + beats + '_' + dir, 1)
}

S4DJ.slipJump = function(channel, control, value, status, group) {
    if( value == 0x7F ) { //if button down only
        //Channel1	Channel2
        if( control == 0x0A || control == 0x09 ) {
            S4DJ.slipOn(group)
            S4DJ.beatJump(group, '0.5', 'backward')
        }
        else if( control == 0x0C || control == 0x0B ) {
            S4DJ.slipOn(group)
            S4DJ.beatJump(group, '1', 'backward')
        }
        else if( control == 0x0E || control == 0x0D ) {
            S4DJ.slipOn(group)
            S4DJ.beatJump(group, '2', 'backward')
        }
        else if( control == 0x10 || control == 0x0F ) {
            S4DJ.slipOn(group)
            S4DJ.beatJump(group, '4', 'backward')
        }
    

      }
    
      else {
        //Channel1	Channel2
        if( control == 0x0A || control == 0x09 ) {
            S4DJ.slipOff(group)
        }
        else if( control == 0x0C || control == 0x0B ) {
            S4DJ.slipOff(group)
        }
        else if( control == 0x0E || control == 0x0D ) {
            S4DJ.slipOff(group)
        }
        else if( control == 0x10 || control == 0x0F ) {
            S4DJ.slipOff(group)
        }
      }

}


/*
S4DJ.toggleControl = function( group, control ) {
    engine.setValue(group, control, 1);
    engine.setValue(group, control, 0);
}
*/

S4DJ.flash = function (value, length) {
    S4DJ.lightLED(value)
    engine.beginTimer(125,"S4DJ.dimLED(" + value + ")",true)
}

S4DJ.lightLED = function (control) {
    midi.sendShortMsg(S4DJ.midiChannel, control, 0x01);
}

S4DJ.lightLEDblink = function (control) {
    midi.sendShortMsg(S4DJ.midiChannel, control, 0x16);
}

S4DJ.lightLEDLower = function (control) {
    midi.sendShortMsg(S4DJ.midiChannel, control, 0x26);
}

S4DJ.lightLEDRampedFast = function (control) {
    midi.sendShortMsg(S4DJ.midiChannel, control, 0x46);
}

S4DJ.lightLEDRampedSlow = function (control) {
    midi.sendShortMsg(S4DJ.midiChannel, control, 0x66);
}

S4DJ.dimLED = function(control) {
    midi.sendShortMsg(S4DJ.midiChannel, control, 0x00);
}

S4DJ.lightShiftLED = function () {
    midi.sendShortMsg(S4DJ.midiChannel, 0x44, 0x06);
}

S4DJ.dimShiftLED = function () {
    midi.sendShortMsg(S4DJ.midiChannel, 0x44, 0x00);
}

S4DJ.sendNoteOffN = function() {
    midi.sendShortMsg(S4DJ.midiChannel, 0x60, 0x00);
}

S4DJ.setSlipToggle = function () {
    S4DJ.slipToggle = 2;
}










