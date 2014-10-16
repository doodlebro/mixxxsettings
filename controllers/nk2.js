function NK2() {}
//############################################################################
//Vars to use for various things
//############################################################################
NK2.ShiftStop = 0;
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
NK2.faders={0x00:1,0x01:2,0x02:3,0x03:4,0x04:5,0x05:6,0x06:7,0x07:8};
NK2.beatloopLengths=new Array(0.03125,0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32);//store loop lengths with presets in Mixxx

//############################################################################
//INIT & SHUTDOWN
//############################################################################

NK2.init = function init() { // called when the device is opened & set up
	NK2.setup();
	
	
	}

NK2.shutdown = function shutdown() {
	
	
	}
	
	//LED Hook Functions

//Play, Sync, Cue 
	
NK2.LEDonPlay1 = function() {
	var tempState = engine.getValue("[Channel1]","play_indicator");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x2C, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x2C, 0x00);
}	

NK2.LEDonPlay2 = function() {
	var tempState = engine.getValue("[Channel2]","play_indicator");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x29, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x29, 0x00);
}

NK2.LEDonCue1 = function() {
	var tempState = engine.getValue("[Channel1]","cue_indicator");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x2E, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x2E, 0x00);
}	

NK2.LEDonCue2 = function() {
	var tempState = engine.getValue("[Channel2]","cue_indicator");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x3C, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x3C, 0x00);
}

NK2.LEDonSync1 = function() {
	var tempState = engine.getValue("[Channel1]","beat_active");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x2B, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x2B, 0x00);
}	

NK2.LEDonSync2 = function() {
	var tempState = engine.getValue("[Channel2]","beat_active");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x2D, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x2D, 0x00);
}

//Loops

NK2.LEDonLoop1 = function() {
	var tempState = engine.getValue("[Channel1]","loop_enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x30, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x30, 0x00);
}	

NK2.LEDonLoop2 = function() {
	var tempState = engine.getValue("[Channel2]","loop_enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x31, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x31, 0x00);
}

//Filters

NK2.LEDonHigh1 = function() {
	var tempState = engine.getValue("[Channel1]","filterHighKill");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x22, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x22, 0x00);
}	

NK2.LEDonHigh2 = function() {
	var tempState = engine.getValue("[Channel2]","filterHighKill");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x27, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x27, 0x00);
}

NK2.LEDonMid1 = function() {
	var tempState = engine.getValue("[Channel1]","filterMidKill");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x32, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x32, 0x00);
}	

NK2.LEDonMid2 = function() {
	var tempState = engine.getValue("[Channel2]","filterMidKill");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x37, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x37, 0x00);
}

NK2.LEDonLow1 = function() {
	var tempState = engine.getValue("[Channel1]","filterLowKill");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x42, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x42, 0x00);
}	

NK2.LEDonLow2 = function() {
	var tempState = engine.getValue("[Channel2]","filterLowKill");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x47, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x47, 0x00);
}

//FX Units

NK2.LEDonFX1000 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit1]", "group_[Channel1]_enable");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x23, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x23, 0x00);
}	

NK2.LEDonFX0100 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit1]", "group_[Channel2]_enable");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x24, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x24, 0x00);
}

NK2.LEDonFX0010 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit2]", "group_[Channel1]_enable");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x25, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x25, 0x00);
}	

NK2.LEDonFX0001 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit2]", "group_[Channel2]_enable");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x26, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x26, 0x00);
}

//FX Modules
NK2.LEDonFX11 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit1_Effect1]", "enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x33, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x33, 0x00);
}

NK2.LEDonFX12 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit1_Effect2]", "enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x34, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x34, 0x00);
}

NK2.LEDonFX13 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit1_Effect3]", "enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x43, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x43, 0x00);
}

NK2.LEDonFX14 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit1_Effect4]", "enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x44, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x44, 0x00);
}

NK2.LEDonFX21 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit2_Effect1]", "enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x35, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x35, 0x00);
}

NK2.LEDonFX22 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit2_Effect2]", "enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x36, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x36, 0x00);
}

NK2.LEDonFX23 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit2_Effect3]", "enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x45, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x45, 0x00);
}

NK2.LEDonFX24 = function() {
	var tempState = engine.getValue("[EffectRack1_EffectUnit2_Effect4]", "enabled");
	if ( tempState ) midi.sendShortMsg(NK2.midiChannel, 0x46, 0x7F);
	else  midi.sendShortMsg(NK2.midiChannel, 0x46, 0x00);
}




// Buttons

NK2.Play = function (channel, control, value, status, group) {
	if( NK2.ShiftStop == 0 ) {
		if( value == 0x7F) { //ensure only happens when button is pressed down
				var currentlyPlaying = engine.getValue(group,"play");
			    if (currentlyPlaying == 1) {    // If currently playing
			        engine.setValue(group,"play",0);    // Stop
			    }
			    
			    else {    // If not currently playing,
			        engine.setValue(group,"play",1);    // Start
			    }
		}
	}
	
	else { //shift function is a brake
		if( value == 0x7F) {
			if( control == 0x2C ) {
				engine.brake(1, true, 1.5);
				NK2.ShiftStopper();
			}
			
			if( control == 0x29 ) {
				engine.brake(2, true, 1.5);
				NK2.ShiftStopper();
			}
		}
		
	}
}

NK2.Loop = function (channel, control, value, status, group) {
	if( NK2.ShiftStop == 0 ) {
		if( value == 0x7F ) { //if button down only
			var temp1 = engine.getValue(group,"loop_enabled")
			if( temp1 == 1 ) {
				//Channel1
				if( control == 0x20 ) {
					engine.setValue(group,"loop_double",1);
					engine.setValue(group,"loop_double",0);
				}
				
				if( control == 0x30 ) {
					engine.setValue(group,"reloop_exit",1);
				}
	
				if( control == 0x40 ) {
					engine.setValue(group,"loop_halve",1);
					engine.setValue(group,"loop_halve",0);
				}
				
				//Channel2
				if( control == 0x21 ) {
					engine.setValue(group,"loop_double",1);
					engine.setValue(group,"loop_double",0);
				}
				
				if( control == 0x31 ) {
					engine.setValue(group,"reloop_exit",1);
				}
	
				if( control == 0x41 ) {
					engine.setValue(group,"loop_halve",1);
					engine.setValue(group,"loop_halve",0);
				}
			}
			else {
				//Channel1
				if( control == 0x20 ) {
					engine.setValue(group,"beatloop_16_activate",1);
				}
				
				if( control == 0x30 ) {
					engine.setValue(group,"beatloop_8_activate",1);
				}
				
				if( control == 0x40 ) {
					engine.setValue(group,"beatloop_4_activate",1);
				}
				
				//Channel2
				if( control == 0x21 ) {
					engine.setValue(group,"beatloop_16_activate",1);
				}
				
				if( control == 0x31 ) {
					engine.setValue(group,"beatloop_8_activate",1);
				}
				
				if( control == 0x41 ) {
					engine.setValue(group,"beatloop_4_activate",1);
				}
			}
		}		
	}
	else { //Shift function not known yet
		if( value == 0x7F ) { //if button down only
			
		}
	}
	
	
}

NK2.FXMod = function(channel, control, value, status, group) {
	if( NK2.ShiftStop == 0 ) {
		if( value == 0x7F ) { //if button down only
			//Channel1
			if( control == 0x33 ) {
				var temp1 = engine.getValue(group,"enabled");
				if( temp1 == 1 ) engine.setValue(group,"enabled",0);
				else engine.setValue(group,"enabled",1);
			}
			
			if( control == 0x34 ) {
				var temp1 = engine.getValue(group,"enabled");
				if( temp1 == 1 ) engine.setValue(group,"enabled",0);
				else engine.setValue(group,"enabled",1);
			}
			
			if( control == 0x43 ) {
				var temp1 = engine.getValue(group,"enabled");
				if( temp1 == 1 ) engine.setValue(group,"enabled",0);
				else engine.setValue(group,"enabled",1);
			}
			
			if( control == 0x44 ) {
				var temp1 = engine.getValue(group,"enabled");
				if( temp1 == 1 ) engine.setValue(group,"enabled",0);
				else engine.setValue(group,"enabled",1);
			}
			
			//Channel2
			if( control == 0x35 ) {
				var temp1 = engine.getValue(group,"enabled");
				if( temp1 == 1 ) engine.setValue(group,"enabled",0);
				else engine.setValue(group,"enabled",1);
			}
			
			if( control == 0x36 ) {
				var temp1 = engine.getValue(group,"enabled");
				if( temp1 == 1 ) engine.setValue(group,"enabled",0);
				else engine.setValue(group,"enabled",1);
			}
			
			if( control == 0x45 ) {
				var temp1 = engine.getValue(group,"enabled");
				if( temp1 == 1 ) engine.setValue(group,"enabled",0);
				else engine.setValue(group,"enabled",1);
			}
			
			if( control == 0x46 ) {
				var temp1 = engine.getValue(group,"enabled");
				if( temp1 == 1 ) engine.setValue(group,"enabled",0);
				else engine.setValue(group,"enabled",1);
			}
		}
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
	NK2.LightShiftLED();
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

NK2.ShiftStopper = function() {
	engine.stopTimer(NK2.tempTimer);
	NK2.ShiftStop = 0;
	
}

NK2.setup = function(obj) {
	
	//Sync, Play, Cue LEDS
	engine.connectControl("[Channel1]", "beat_active", "NK2.LEDonSync1");//
	engine.trigger("[Channel1]", "beat_active");
	
	engine.connectControl("[Channel1]", "play_indicator", "NK2.LEDonPlay1");//
	engine.trigger("[Channel1]", "play_indicator");
	
	engine.connectControl("[Channel1]", "cue_indicator", "NK2.LEDonCue1");//
	engine.trigger("[Channel1]", "cue_indicator");
	
	engine.connectControl("[Channel2]", "beat_active", "NK2.LEDonSync2");//
	engine.trigger("[Channel2]", "beat_active");
	
	engine.connectControl("[Channel2]", "play_indicator", "NK2.LEDonPlay2");//
	engine.trigger("[Channel2]", "play_indicator");
	
	engine.connectControl("[Channel2]", "cue_indicator", "NK2.LEDonCue2");//
	engine.trigger("[Channel2]", "cue_indicator");
	
	//Loop LEDS
	engine.connectControl("[Channel1]", "loop_enabled", "NK2.LEDonLoop1");//
	engine.trigger("[Channel1]", "loop_enabled");
	
	engine.connectControl("[Channel2]", "loop_enabled", "NK2.LEDonLoop2");//
	engine.trigger("[Channel2]", "loop_enabled");
	
	
	//Filter kill LEDS
	engine.connectControl("[Channel1]", "filterHighKill", "NK2.LEDonHigh1");//
	engine.trigger("[Channel1]", "filterHighKill");
	
	engine.connectControl("[Channel1]", "filterMidKill", "NK2.LEDonMid1");//
	engine.trigger("[Channel1]", "filterMidKill");
	
	engine.connectControl("[Channel1]", "filterLowKill", "NK2.LEDonLow1");//
	engine.trigger("[Channel1]", "filterLowKill");
	
	engine.connectControl("[Channel2]", "filterHighKill", "NK2.LEDonHigh2");//
	engine.trigger("[Channel2]", "filterHighKill");
	
	engine.connectControl("[Channel2]", "filterMidKill", "NK2.LEDonMid2");//
	engine.trigger("[Channel2]", "filterMidKill");
	
	engine.connectControl("[Channel2]", "filterLowKill", "NK2.LEDonLow2");//
	engine.trigger("[Channel2]", "filterLowKill");
	
	//FX Unit LEDS
	engine.connectControl("[EffectRack1_EffectUnit1]", "group_[Channel1]_enable", "NK2.LEDonFX1000");//
	engine.trigger("[EffectRack1_EffectUnit1]", "group_[Channel1]_enable");
	
	engine.connectControl("[EffectRack1_EffectUnit1]", "group_[Channel2]_enable", "NK2.LEDonFX0100");//
	engine.trigger("[EffectRack1_EffectUnit1]", "group_[Channel2]_enable");
	
	engine.connectControl("[EffectRack1_EffectUnit2]", "group_[Channel1]_enable", "NK2.LEDonFX0010");//
	engine.trigger("[EffectRack1_EffectUnit2]", "group_[Channel1]_enable");
	
	engine.connectControl("[EffectRack1_EffectUnit2]", "group_[Channel2]_enable", "NK2.LEDonFX0001");//
	engine.trigger("[EffectRack1_EffectUnit2]", "group_[Channel2]_enable");
	
	//FX Module LEDS
	//Channel 1
	engine.connectControl("[EffectRack1_EffectUnit1_Effect1]", "enabled", "NK2.LEDonFX11");//
	engine.trigger("[EffectRack1_EffectUnit1_Effect1]", "enabled");
	
	engine.connectControl("[EffectRack1_EffectUnit1_Effect2]", "enabled", "NK2.LEDonFX12");//
	engine.trigger("[EffectRack1_EffectUnit1_Effect2]", "enabled");
	
	engine.connectControl("[EffectRack1_EffectUnit1_Effect3]", "enabled", "NK2.LEDonFX13");//
	engine.trigger("[EffectRack1_EffectUnit1_Effect3]", "enabled");
	
	engine.connectControl("[EffectRack1_EffectUnit1_Effect4]", "enabled", "NK2.LEDonFX14");//
	engine.trigger("[EffectRack1_EffectUnit1_Effect4]", "enabled");
	
	//Channel 2
	engine.connectControl("[EffectRack1_EffectUnit2_Effect1]", "enabled", "NK2.LEDonFX21");//
	engine.trigger("[EffectRack1_EffectUnit1_Effect1]", "enabled");
	
	engine.connectControl("[EffectRack1_EffectUnit2_Effect2]", "enabled", "NK2.LEDonFX22");//
	engine.trigger("[EffectRack1_EffectUnit1_Effect2]", "enabled");
	
	engine.connectControl("[EffectRack1_EffectUnit2_Effect3]", "enabled", "NK2.LEDonFX23");//
	engine.trigger("[EffectRack1_EffectUnit1_Effect3]", "enabled");
	
	engine.connectControl("[EffectRack1_EffectUnit2_Effect4]", "enabled", "NK2.LEDonFX24");//
	engine.trigger("[EffectRack1_EffectUnit1_Effect4]", "enabled");
	
}








