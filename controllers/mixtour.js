function MT() {}


MT.Channel1Midi = 0x00
MT.Channel2Midi = 0x01
MT.SystemMidi = 0x04



// State Vars

var loopEditBuffer = [8,8]

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



