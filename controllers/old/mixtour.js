function MT() {}


MT.Channel1Midi = 0x00
MT.Channel2Midi = 0x01
MT.SystemMidi = 0x04

MT.Midi=[MT.SystemMidi, MT.Channel1Midi, MT.Channel2Midi]

// State Vars

var loopEditBuffer = [8,8]
var fxSelect = 0

// Controls

MT.LED=[{"back":0x08},

    {"fx":0x01}

]

//############################################################################
//INIT & SHUTDOWN
//############################################################################

MT.init = function init() { // called when the device is opened & set up	
    print("Initialized Mixtour")
}

MT.shutdown = function shutdown() {

}

// Helper functions
MT.groupToDeck = function(group) {
    var matches = group.match(/^\[Channel(\d+)\]$/);
    if (matches == null) {
        return -1;
    } else {
        return matches[1];
    }
}

MT.otherDeck = function(deck) {
    return deck == 1 ? 2 : 1;
}

MT.engineToggle = function(group, engine_param) {
    engine.setValue(group, engine_param, 1)
    engine.setValue(group, engine_param, 0)
}

MT.loopToggle = function(channel, control, value, status, group) {

    var loopEnabled = engine.getValue(group,"loop_enabled")

    if( value == 0x7F ) {
        if( loopEnabled ) MT.engineToggle(group,"reloop_toggle");
        else MT.engineToggle(group,"beatloop_activate");
    }
}

MT.tempo = function(channel, control, value, status, group) { // Controls beatgrid using the T button, shift button, and select knob

    if( value == 0x7F ) { // <<
        if( control == 0x49 ) MT.engineToggle(group, "beats_adjust_slower");
        else if( control == 0x09 ) MT.engineToggle(group, "beats_translate_earlier");
    }

    else { // Value is 0x01 >>
        if( control == 0x49 ) MT.engineToggle(group, "beats_adjust_faster");
        else if( control == 0x09 ) MT.engineToggle(group, "beats_translate_later");
    }
}

MT.zoom = function(channel, control, value, status, group) {
    //currentZoom = engine.getValue(group, "waveform_zoom")
    if( value == 0x7F ) { // <<
        engine.setValue(group, "waveform_zoom_up", 1);
    }

    else { // Value is 0x01 >>
        engine.setValue(group, "waveform_zoom_down", 1);
    }
}

MT.fx = function(channel, control, value, status, group) { // Use the small FX buttons to enable a quick FX select mode that takes over the select knob
    var deck = MT.groupToDeck(group);
    if( value == 0x7F ) { // <<
        if( fxSelect == deck ) {
            fxSelect = 0; // toggle off if enabled for current deck
            midi.sendShortMsg(MT.deckLED(deck), MT.LED[1]["fx"], 0x00)
        }
        else if ( fxSelect == 0 ) {
            fxSelect = deck; // toggle on for current deck
            midi.sendShortMsg(MT.deckLED(deck), MT.LED[1]["fx"], 0x7F)
        }
        else { // other deck was enabled, handle LED swap!
            fxSelect = deck; // take over control
            otherDeck = MT.otherDeck(deck)
            midi.sendShortMsg(MT.deckLED(deck), MT.LED[1]["fx"], 0x7F)
            midi.sendShortMsg(MT.deckLED(otherDeck), MT.LED[1]["fx"], 0x00)
        }
    }
}

MT.selectKnob = function(channel, control, value, status, group) { // select knob handler, since we have multiple shift buttons
    qfx_prefix = "[QuickEffectRack1_[Channel"
    qfx_suffix = "]]"
    qfx_full = qfx_prefix + fxSelect + qfx_suffix;
    if( value == 0x7F ) { // <<
        if ( fxSelect > 0 ) {
            engine.setValue(qfx_full, "next_chain_preset", 1)
        }
        else engine.setValue("[Playlist]", "SelectPrevTrack", 1);
    }

    else { // Value is 0x01 >>
        if ( fxSelect > 0 ) {
            engine.setValue(qfx_full, "prev_chain_preset", 1)
        }
        else engine.setValue("[Playlist]", "SelectNextTrack", 1);
    }
}

MT.deckLED = function(deck) { // converts deck to the correct Midi channel
    if( deck == 1 ) {
        return 0x90
    }
    else return 0x91
}