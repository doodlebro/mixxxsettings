function MT() {}



MT.SystemMidi = 0x04
MT.SwitchMidi= 0x01
MT.EncoderMidi = 0x00



// State Vars

var loopEditBuffer = [8,8]

//############################################################################
//INIT & SHUTDOWN
//############################################################################

MT.init = function init() { // called when the device is opened & set up	
    print("Initialized MF Twister")
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

MT.loopSet = function(channel, control, value, status, group) {
    var deck = MT.groupToDeck(group)

    if( value >= 0x00 && value < 0x01 ) {
        engine.setValue(group,"beatloop_size",1);
    }
    else if( value >= 0x01 && value < 0x11 ) {
        engine.setValue(group,"beatloop_size",2);
    }
    else if( value >= 0x11 && value < 0x21 ) {
        engine.setValue(group,"beatloop_size",4);
    }
    else if( value >= 0x21 && value < 0x31 ) {
        engine.setValue(group,"beatloop_size",8);
    }
    else if( value >= 0x31 && value < 0x3F ) {
        engine.setValue(group,"beatloop_size",16);
    }
    else if( value == 0x3F || value == 0x40 ) {
        engine.setValue(group,"beatloop_size",32);
    }
    else if( value > 0x40 && value < 0x4F ) {
        engine.setValue(group,"beatloop_size",64);
    }
    else if( value > 0x4F && value < 0x5F ) {
        engine.setValue(group,"beatloop_size",128);
    }
    else if( value > 0x5F && value < 0x6F ) {
        engine.setValue(group,"beatloop_size",128);
    }
    else if( value > 0x6F && value < 0x7F ) {
        engine.setValue(group,"beatloop_size",3);
    }
    else if( value == 0x7F ) {
        engine.setValue(group,"beatloop_size",6);
    }
}

MT.loopJumpSet = function(channel, control, value, status, group) {
    var deck = MT.groupToDeck(group)

    if( value >= 0x00 && value < 0x01 ) {
        engine.setValue(group,"beatjump_size",0.03125);
    }
    else if( value >= 0x01 && value < 0x11 ) {
        engine.setValue(group,"beatjump_size",0.0625);
    }
    else if( value >= 0x11 && value < 0x21 ) {
        engine.setValue(group,"beatjump_size",0.125);
    }
    else if( value >= 0x21 && value < 0x31 ) {
        engine.setValue(group,"beatjump_size",0.25);
    }
    else if( value >= 0x31 && value < 0x3F ) {
        engine.setValue(group,"beatjump_size",0.5);
    }
    else if( value == 0x3F || value == 0x40 ) {
        engine.setValue(group,"beatjump_size",1);
    }
    else if( value > 0x40 && value < 0x4F ) {
        engine.setValue(group,"beatjump_size",2);
    }
    else if( value > 0x4F && value < 0x5F ) {
        engine.setValue(group,"beatjump_size",4);
    }
    else if( value > 0x5F && value < 0x6F ) {
        engine.setValue(group,"beatjump_size",8);
    }
    else if( value > 0x6F && value < 0x7F ) {
        engine.setValue(group,"beatjump_size",16);
    }
    else if( value == 0x7F ) {
        engine.setValue(group,"beatjump_size",32);
    }
}

MT.loopRollSet = function(channel, control, value, status, group) {
    var deck = MT.groupToDeck(group)

    var loopEnabled = engine.getValue(group,"loop_enabled")
    var slipEnabled = engine.getValue(group,"slip_enabled")

    if( !loopEnabled || slipEnabled ) {
        if( value >= 0x00 && value < 0x01 ) {
            engine.setValue(group,"beatloop_size",0.03125);
        }
        else if( value >= 0x01 && value < 0x11 ) {
            engine.setValue(group,"beatloop_size",0.0625);
        }
        else if( value >= 0x11 && value < 0x21 ) {
            engine.setValue(group,"beatloop_size",0.125);
        }
        else if( value >= 0x21 && value < 0x31 ) {
            engine.setValue(group,"beatloop_size",0.25);
        }
        else if( value >= 0x31 && value < 0x3F ) {
            engine.setValue(group,"beatloop_size",0.5);
        }
        else if( value == 0x3F || value == 0x40 ) {
            engine.setValue(group,"beatloop_size",1);
        }
        else if( value > 0x40 && value < 0x4F ) {
            engine.setValue(group,"beatloop_size",2);
        }
        else if( value > 0x4F && value < 0x5F ) {
            engine.setValue(group,"beatloop_size",4);
        }
        else if( value > 0x5F && value < 0x6F ) {
            engine.setValue(group,"beatloop_size",4);
        }
        else if( value > 0x6F && value < 0x7F ) {
            engine.setValue(group,"beatloop_size",4);
        }
        else if( value == 0x7F ) {
            engine.setValue(group,"beatloop_size",4);
        }
    }
}

MT.loopToggle = function(channel, control, value, status, group) {
    var deck = MT.groupToDeck(group)

    if( value == 0x7F ) engine.setValue(group,"beatloop_activate",1);
}

MT.loopMove = function(channel, control, value, status, group) {
    var deck = MT.groupToDeck(group)

    var loopEnabled = engine.getValue(group,"loop_enabled")

    if( value == 0x41 && loopEditBuffer[deck-1] == 0) {
        engine.setValue(group,"beatjump_forward",1);
        loopEditBuffer[deck-1] = 8;

    }
    else if( value == 0x3F && loopEditBuffer[deck-1] == 0) {
        engine.setValue(group,"beatjump_backward",1);
        loopEditBuffer[deck-1] = 8;
    }
    else loopEditBuffer[deck-1]--;

}

