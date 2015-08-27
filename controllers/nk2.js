function NK2() {}
//############################################################################
//Vars to use for various things
//############################################################################
NK2.tempTimer = 0;
NK2.leftVXTimer = 'null'
NK2.XforLoop = 8;
NK2.FXMatrix = {'flanger':{'flanger':0, 'echo':1, 'autopan':2, 'reverb':3, 'phaser':4, 'filter':9, 'moog':10, 'bitcrusher':11},
		'echo':{'flanger':11, 'echo':0, 'autopan':1, 'reverb':2, 'phaser':3, 'filter':8, 'moog':9, 'bitcrusher':10},
		'autopan':{'flanger':10, 'echo':11, 'autopan':0, 'reverb':1, 'phaser':2, 'filter':7, 'moog':8, 'bitcrusher':9},
		'reverb':{'flanger':9, 'echo':10, 'autopan':11, 'reverb':0, 'phaser':1, 'filter':6, 'moog':7, 'bitcrusher':8},
		'phaser':{'flanger':8, 'echo':9, 'autopan':10, 'reverb':11, 'phaser':0, 'filter':5, 'moog':6, 'bitcrusher':7},
		'filter':{'flanger':3, 'echo':4, 'autopan':5, 'reverb':6, 'phaser':7, 'filter':0, 'moog':1, 'bitcrusher':2},
		'moog':{'flanger':2, 'echo':3, 'autopan':4, 'reverb':5, 'phaser':6, 'filter':11, 'moog':0, 'bitcrusher':1},
		'bitcrusher':{'flanger':1, 'echo':2, 'autopan':3, 'reverb':4, 'phaser':5, 'filter':10, 'moog':11, 'bitcrusher':0}
	      }
NK2.FX1 = ['moog', 'filter', 'autopan', 'phaser', 'echo', 'reverb']
NK2.FX2 = [['echo', 'bitcrusher'], ['echo', 'autopan'], ['reverb', 'autopan']]

NK2.fx1LED = [0x20, 0x21, 0x30, 0x31, 0x40, 0x41]

NK2.fx2LED = [0x22, 0x32, 0x42]

NK2.S3LED = [0x23, 0x24, 0x25, 0x26, 0x27]

NK2.S4LED = [0x33, 0x34, 0x35, 0x36, 0x37]

NK2.effectBank = [['flanger', 'moog'], ['echo', 'bitcrusher']]


NK2.FXOrder = ['flanger', 'echo', 'autopan', 'reverb', 'phaser', 'bessel4',
	      'bessel8', 'lr8', 'graphiceq', 'filter', 'moog', 'bitcrusher']

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
	NK2.setup()
	
	}

NK2.shutdown = function shutdown() {
	
	
	}

NK2.lightLED = function (control) {
  midi.sendShortMsg(NK2.midiChannel, control, 0x7F);
}

NK2.choiceTriggerLED = function(value, group, control) {
  if( group == "[Sampler3]" ) {
    var newControl = NK2.S3LED[control[7] - 1]
  }
  else {
    var newControl = NK2.S4LED[control[7] - 1]
  }
  if( value ) {
    var temp = 127
  }
  else {
    var temp = 0
  }
  midi.sendShortMsg(NK2.midiChannel, newControl, temp);
}

NK2.dimLED = function(control) {
  midi.sendShortMsg(NK2.midiChannel, control, 0x00);
}

NK2.dimFX1 = function() {
  for(index=0; index < 6; index++) {
     NK2.dimLED(NK2.fx1LED[index])
  }
}

NK2.dimFX2 = function() {
  for(index=0; index < 6; index++) {
     NK2.dimLED(NK2.fx2LED[index])
  }
}


NK2.fxReInit = function() {
  engine.setValue("[EffectRack1]", "clear", 1);
  engine.setValue("[EffectRack1]", "clear", 0);
  
  //LEFT EFFECTS
  //First effect flanger
  engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect1]", "prev_effect", 0);
  
  //second effect moog filter
  engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit1_Effect2]", "prev_effect", 0);
  
  //RIGHT EFFECTS
  //first effect echo
  engine.setValue("[EffectRack1_EffectUnit2_Effect1]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect1]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect1]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect1]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect1]", "prev_effect", 0);

  //second effect bitcrusher
  engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 1);
  engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "prev_effect", 0);
  
  NK2.lightLED(0x20)
  NK2.lightLED(0x22)
}

NK2.resetSamplerPlay = function() {
  engine.setValue("[Sampler1]", "start_stop", 1)
  engine.setValue("[Sampler1]", "start_stop", 0)
  
  engine.setValue("[Sampler2]", "start_stop", 1)
  engine.setValue("[Sampler2]", "start_stop", 0)
  
  engine.setValue("[Sampler3]", "start_stop", 1)
  engine.setValue("[Sampler3]", "start_stop", 0)
  
  engine.setValue("[Sampler4]", "start_stop", 1)
  engine.setValue("[Sampler4]", "start_stop", 0)
  
  engine.setValue("[Sampler5]", "start_stop", 1)
  engine.setValue("[Sampler5]", "start_stop", 0)
  
  engine.setValue("[Sampler6]", "start_stop", 1)
  engine.setValue("[Sampler6]", "start_stop", 0)
  
  engine.setValue("[Sampler7]", "start_stop", 1)
  engine.setValue("[Sampler7]", "start_stop", 0)
  
  engine.setValue("[Sampler8]", "start_stop", 1)
  engine.setValue("[Sampler8]", "start_stop", 0)
}

NK2.fxChange = function (channel, control, value, status, group) {
  if( value == 0x7F ) {
    if( group == '[EffectRack1_EffectUnit1_Effect2]' ) { //only changing effect 2 on this rack
      NK2.dimFX1()
      var from = NK2.effectBank[0][1]
      if( control == NK2.Sbutton[1] ) {//default
	var to = NK2.FX1[0]
	NK2.effectBank[0][1] = NK2.FX1[0]
	NK2.lightLED(NK2.Sbutton[1])
      }
      else if( control == NK2.Mbutton[1] ) {//reg filter
	var to = NK2.FX1[1]
	NK2.effectBank[0][1] = NK2.FX1[1]
	NK2.lightLED(NK2.Mbutton[1])
      }
      else if( control == NK2.Rbutton[1] ) {//reg filter
	var to = NK2.FX1[2]
	NK2.effectBank[0][1] = NK2.FX1[2]
	NK2.lightLED(NK2.Rbutton[1])
      }
      else if( control == NK2.Sbutton[2] ) {//default
	var to = NK2.FX1[3]
	NK2.effectBank[0][1] = NK2.FX1[3]
	NK2.lightLED(NK2.Sbutton[2])
      }
      else if( control == NK2.Mbutton[2] ) {//reg filter
	var to = NK2.FX1[4]
	NK2.effectBank[0][1] = NK2.FX1[4]
	NK2.lightLED(NK2.Mbutton[2])
      }
      else if( control == NK2.Rbutton[2] ) {//reg filter
	var to = NK2.FX1[5]
	NK2.effectBank[0][1] = NK2.FX1[5]
	NK2.lightLED(NK2.Rbutton[2])
      }
      var effect2Jump = NK2.FXMatrix[from][to]
      
      for(index=0; index < effect2Jump; index++) {
	engine.setValue(group, "next_effect", 1);
      }
      engine.setValue(group, "next_effect", 0);
    }
    
    else { //possible to change both effects on this rack
      NK2.dimFX2()
      var from1 = NK2.effectBank[1][0]
      var from2 = NK2.effectBank[1][1]
      if( control == NK2.Sbutton[3] ) {//default
	var to1 = NK2.FX2[0][0]
	var to2 = NK2.FX2[0][1]
	NK2.effectBank[1] = NK2.FX2[0]
	NK2.lightLED(NK2.Sbutton[3])
      }
      else if( control == NK2.Mbutton[3] ) {//reg filter
	var to1 = NK2.FX2[1][0]
	var to2 = NK2.FX2[1][1]
	NK2.effectBank[1] = NK2.FX2[1]
	NK2.lightLED(NK2.Mbutton[3])
      }
      else if( control == NK2.Rbutton[3] ) {//reg filter
	var to1 = NK2.FX2[2][0]
	var to2 = NK2.FX2[2][1]
	NK2.effectBank[1] = NK2.FX2[2]
	NK2.lightLED(NK2.Rbutton[3])
      }
      var effect3Jump = NK2.FXMatrix[from1][to1]
      var effect4Jump = NK2.FXMatrix[from2][to2]
      
      for(index=0; index < effect3Jump; index++) {
	engine.setValue(group, "next_effect", 1);
      }
      engine.setValue(group, "next_effect", 0);
      
      for(index=0; index < effect4Jump; index++) {
	engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "next_effect", 1);
      }
      engine.setValue("[EffectRack1_EffectUnit2_Effect2]", "next_effect", 0);
      
    }
  }
}

NK2.setup = function(obj) {
  for( var i = 0x00; i <= 0x7F; i++ ) {
	    NK2.dimLED(i);
  }
  
  NK2.fxReInit()
  
  engine.connectControl("[Sampler3]", "hotcue_1_enabled", "NK2.choiceTriggerLED")
  engine.connectControl("[Sampler3]", "hotcue_2_enabled", "NK2.choiceTriggerLED")
  engine.connectControl("[Sampler3]", "hotcue_3_enabled", "NK2.choiceTriggerLED")
  engine.connectControl("[Sampler3]", "hotcue_4_enabled", "NK2.choiceTriggerLED")
  engine.connectControl("[Sampler3]", "hotcue_5_enabled", "NK2.choiceTriggerLED")
  
  engine.trigger("[Sampler3]", "hotcue_1_enabled")
  engine.trigger("[Sampler3]", "hotcue_2_enabled")
  engine.trigger("[Sampler3]", "hotcue_3_enabled")
  engine.trigger("[Sampler3]", "hotcue_4_enabled")
  engine.trigger("[Sampler3]", "hotcue_5_enabled")
  
  engine.connectControl("[Sampler4]", "hotcue_1_enabled", "NK2.choiceTriggerLED")
  engine.connectControl("[Sampler4]", "hotcue_2_enabled", "NK2.choiceTriggerLED")
  engine.connectControl("[Sampler4]", "hotcue_3_enabled", "NK2.choiceTriggerLED")
  engine.connectControl("[Sampler4]", "hotcue_4_enabled", "NK2.choiceTriggerLED")
  engine.connectControl("[Sampler4]", "hotcue_5_enabled", "NK2.choiceTriggerLED")
  
  engine.trigger("[Sampler4]", "hotcue_1_enabled")
  engine.trigger("[Sampler4]", "hotcue_2_enabled")
  engine.trigger("[Sampler4]", "hotcue_3_enabled")
  engine.trigger("[Sampler4]", "hotcue_4_enabled")
  engine.trigger("[Sampler4]", "hotcue_5_enabled")

}










