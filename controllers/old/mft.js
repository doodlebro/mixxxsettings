function MFT() {}



MFT.SystemMidi = 0x04
MFT.SwitchMidi= 0x01
MFT.EncoderMidi = 0x00



// State Vars

var loopEditBuffer = [0,0]
var bjBuffer = [0,0]
var blBuffer = [0,0]

//############################################################################
//INIT & SHUTDOWN
//############################################################################

MFT.init = function init() { // called when the device is opened & set up	
    print("Initialized MF Twister")
}

MFT.shutdown = function shutdown() {

}

// Helper functions
MFT.groupToDeck = function(group) {
    var matches = group.match(/^\[Channel(\d+)\]$/);
    if (matches == null) {
        return -1;
    } else {
        return matches[1];
    }
}

// Value based set functions, hardcodes midi values along the encoder to beatloop sizes
MFT.loopSet = function(channel, control, value, status, group) {
    var deck = MFT.groupToDeck(group)

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

MFT.jumpSet = function(channel, control, value, status, group) {
    var deck = MFT.groupToDeck(group)

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

MFT.loopRollSet = function(channel, control, value, status, group) {
    var deck = MFT.groupToDeck(group)

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

// End value based set functions

MFT.loopToggle = function(channel, control, value, status, group) {
    var deck = MFT.groupToDeck(group)

    if( value == 0x7F ) engine.setValue(group,"beatloop_activate",1);
}

// Relative move/set functions
MFT.loopSetRel = function(channel, control, value, status, group) {
    var deck = MFT.groupToDeck(group)

    var blSize = engine.getValue(group, "beatloop_size")

    if( value == 0x41 ) {
        blBuffer[deck-1]++;
        if( blBuffer[deck-1] >= 10 ) {
            newSize = blSize * 2
            engine.setValue(group,"beatloop_size",newSize);
            blBuffer[deck-1] = 0;
        }

    }
    else if( value == 0x3F ) {
        blBuffer[deck-1]--;
        if( blBuffer[deck-1] <= -10 ) {
            newSize = blSize / 2.0
            engine.setValue(group,"beatloop_size",newSize);
            blBuffer[deck-1] = 0;
        }
    }
}

MFT.loopRollRel = function(channel, control, value, status, group) {
    var deck = MFT.groupToDeck(group)

    var loopEnabled = engine.getValue(group,"loop_enabled")
    var slipEnabled = engine.getValue(group,"slip_enabled")

    var blSize = engine.getValue(group, "beatloop_size")

    if( value == 0x41 ) {
        blBuffer[deck-1]++;
        if( blBuffer[deck-1] >= 10 ) {
            if( !loopEnabled || slipEnabled ) {
                newSize = blSize * 2
                engine.setValue(group,"beatloop_size",newSize);
            }
            blBuffer[deck-1] = 0;
        }

    }
    else if( value == 0x3F ) {
        blBuffer[deck-1]--;
        if( blBuffer[deck-1] <= -10 ) {
            if( !loopEnabled || slipEnabled ) {
                newSize = blSize / 2.0
                engine.setValue(group,"beatloop_size",newSize);
            }
            blBuffer[deck-1] = 0;
        }
    }
}

MFT.beatjumpMove = function(channel, control, value, status, group) {
    var deck = MFT.groupToDeck(group)

    var loopEnabled = engine.getValue(group,"loop_enabled")

    if( value == 0x41 ) {
        loopEditBuffer[deck-1]++;
        if( loopEditBuffer[deck-1] >= 16 ) {
            engine.setValue(group,"beatjump_forward",1);
            engine.setValue(group,"beatjump_forward",0);
            loopEditBuffer[deck-1] = 0;
        }

    }
    else if( value == 0x3F ) {
        loopEditBuffer[deck-1]--;
        if( loopEditBuffer[deck-1] <= -16 ) {
            engine.setValue(group,"beatjump_backward",1);
            engine.setValue(group,"beatjump_backward",0);
            loopEditBuffer[deck-1] = 0;
        }
    }
}

MFT.beatjumpSet = function(channel, control, value, status, group) {
    var deck = MFT.groupToDeck(group)

    var bjSize = engine.getValue(group, "beatjump_size")

    if( value == 0x41 ) {
        bjBuffer[deck-1]++;
        if( bjBuffer[deck-1] >= 10 ) {
            newSize = bjSize * 2
            engine.setValue(group,"beatjump_size",newSize);
            bjBuffer[deck-1] = 0;
        }

    }
    else if( value == 0x3F ) {
        bjBuffer[deck-1]--;
        if( bjBuffer[deck-1] <= -10 ) {
            newSize = bjSize / 2.0
            engine.setValue(group,"beatjump_size",newSize);
            bjBuffer[deck-1] = 0;
        }
    }
}

