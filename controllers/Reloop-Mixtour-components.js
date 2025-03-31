var Mixtour = {};

// Global state vars
Mixtour.shifted = false;
Mixtour.loopShifted = [false, false]
Mixtour.fxShifted = [false, false]
Mixtour.backShifted = false

Mixtour.padColors = {
    mix: 127,
    green: 1,
    orange: 85
};

Mixtour.init = function () {
    components.Component.prototype.shiftControl = true;
    components.Component.prototype.shiftOffset = 64;

    Mixtour.leftDeck = new Mixtour.Deck([1], 0);
    Mixtour.rightDeck = new Mixtour.Deck([2], 1);
    Mixtour.global = new Mixtour.Global();

    // init fxSelect buttons
    midi.sendShortMsg(0x90, 0x01, 1)
    midi.sendShortMsg(0x91, 0x01, 1)
};

Mixtour.shutdown = function () {
    // TODO - dim all LEDs?
};

Mixtour.Deck = function (deckNumbers, midiChannel) {
    components.Deck.call(this, deckNumbers);
    this.playButton = new components.PlayButton({
        midi: [0x90 + midiChannel, 0x0C],
        on: Mixtour.padColors.green,
        shiftOffset: 63,
        sendShifted: true,
        shift: function() {
            this.inKey = "start_stop";
        }
    });
    this.cueButton = new components.CueButton({
        midi: [0x90 + midiChannel, 0x0B],
        on: Mixtour.padColors.orange,
        type: 0
    });
    this.quantizeButton = new components.Button({ // Should be part of cueButton, but shift interaction was strange so this works
        midi: [0x90 + midiChannel, 0x4A],
        on: Mixtour.padColors.green,
        key: "quantize",
        type: 1
    })
    this.syncButton = new components.SyncButton({
        midi: [0x90 + midiChannel, 0x0A],
        on: Mixtour.padColors.orange,
        shiftOffset: 63,
        sendShifted: true,
        shift: function() {
            this.input = components.Button.prototype.input;
            this.inKey = "loop_double";
        },
        unshift: function() {
            this.input = components.SyncButton.prototype.input;
        }
    });

    this.loopButton = new components.Button({
        midi: [0x90 + midiChannel, 0x09],
        inKey: "beatloop_activate",
        outKey: "loop_enabled",
        input: function(channel, control, value, status, _group) {
            if (this.isPress(channel, control, value, status)) {
                this.isLongPressed = false;
                this.longPressTimer = engine.beginTimer(this.longPressTimeout, () => {
                    this.isLongPressed = true;
                    this.longPressTimer = components.NO_TIMER;
                    Mixtour.loopShifted[channel] = true
                }, true);
            } else {
                if (this.isLongPressed) {
                    Mixtour.loopShifted[channel] = false
                }
                else {
                    this.inToggle()
                    this.inToggle()
                }
                if (this.longPressTimer !== components.NO_TIMER) {
                    engine.stopTimer(this.longPressTimer);
                    this.longPressTimer = components.NO_TIMER;
                }
                this.isLongPressed = false;
            }
        },
        on: Mixtour.padColors.green,
        shift: function() {
            this.inKey = "loop_halve";
        },
        unshift: function() {
            this.inKey = "beatloop_activate";
        },
        shiftOffset: 63,
        sendShifted: true});

    this.pflButton = new components.Button({
        midi: [0x90 + midiChannel, 0x03],
        key: 'pfl',
        type: 2
    });

    this.hotcueButtons = [];
    for (var i = 1; i <= 4; i++) {
        this.hotcueButtons[i] = new components.HotcueButton({
            midi: [0x90 + midiChannel, 0x0C + i],
            number: i,
            on: Mixtour.padColors.orange,
            shiftOffset: 63,
            sendShifted: true
        });
    }

    this.volume = new components.Pot({
        midi: [0xB0 + midiChannel, 0x05],
        inKey: 'volume'
    });

    this.pregain = new components.Pot({
        midi: [0xB0 + midiChannel, 0x00],
        inKey: 'pregain',
        relative: true
    });

    this.eqKnob = [];
    for (var k = 1; k <= 3; k++) {
        this.eqKnob[k] = new components.Pot({
            midi: [0xB0 + midiChannel, 0x00 + k],
            group: '[EqualizerRack1_' + this.currentDeck + '_Effect1]',
            inKey: 'parameter' + k,
            softTakeover: false
        });
    }

    this.filterFXKnob = new components.Pot({ // Activates FX when not centered
        midi: [0xB0 + midiChannel, 0x04],
        group: '[QuickEffectRack1_' + this.currentDeck + ']',
        input: function(channel, control, value) {
            engine.setParameter(this.group, "super1", value / 0x7F)
            if (value < 0x40) {
                engine.setParameter(this.group, "enabled", 1)
            }

            else if (value == 0x40) {
                engine.setParameter(this.group, "enabled", 0) //might want to check if load is held here
            }

            else if (value > 0x40) {
                engine.setParameter(this.group, "enabled", 1)
            }
        },

        shift: function() {
            this.input = function(channel, control, value) {
                groupe = this.group.slice(0, -1) + '_Effect1]'
                engine.setParameter(groupe, "parameter2", value / 0x7F)
            }
        },
        unshift: function() {
            this.input = function(channel, control, value) {
                engine.setParameter(this.group, "super1", value / 0x7F)
                if (value < 0x40) {
                    engine.setParameter(this.group, "enabled", 1)
                }
    
                else if (value == 0x40) {
                    engine.setParameter(this.group, "enabled", 0) //might want to check if load is held here
                }
    
                else if (value > 0x40) {
                    engine.setParameter(this.group, "enabled", 1)
                }
            }
        }

    })

    this.filterFXLED = new components.Component({
        midi: [0x90 + midiChannel, 0x00],
        group: '[QuickEffectRack1_' + this.currentDeck + ']',
        outKey: 'enabled',
        output: function(value, group) {
            midi.sendShortMsg(0x90 + midiChannel, 0x00, value * 0x7F);
            midi.sendShortMsg(0x90 + midiChannel, 0x40, value * 0x7F); // no sendShifted support
        }
    })

    // fx button - we use this to select quick FX
    this.fxButton = new components.Button({
        midi: [0x90 + midiChannel, 0x01],
        input: function(channel, control, value, status, _group) {
            if (this.isPress(channel, control, value, status)) {
                Mixtour.fxShifted[channel] = true
                midi.sendShortMsg(0x90 + midiChannel, 0x01, 0)
            }
            else {
                Mixtour.fxShifted[channel] = false
                midi.sendShortMsg(0x90 + midiChannel, 0x01, 1)
            }
        }
    })

    // load button - we use this as the quick effect enable button since it is fat
    this.loadButton = new components.Button({
        midi: [0x90 + midiChannel, 0x02],
        type: 2,
        group: '[QuickEffectRack1_' + this.currentDeck + ']',
        inKey: 'enabled',
        outKey: 'loaded_chain_preset'
    })

    // transport controls using T button/knob
    this.transportKnob = new components.Encoder({
        midi: [0xB0 + midiChannel, 0x09],
        shiftOffset: 64,
        input: function(channel, control, value) {
            direction = (value > 0x40) ? "earlier" : "later";
            engine.setParameter(this.group, "beats_translate_" + direction, 1);
            engine.setParameter(this.group, "beats_translate_" + direction, 0);
        },
        shift: function() {
            this.input = function(channel, control, value) {
                direction = (value > 0x40) ? "slower" : "faster";
                engine.setParameter(this.group, "beats_adjust_" + direction, 1);
                engine.setParameter(this.group, "beats_adjust_" + direction, 0);
            }
        },
        unshift:  function() {
            this.input = function(channel, control, value) {
                direction = (value > 0x40) ? "earlier" : "later";
                engine.setParameter(this.group, "beats_translate_" + direction, 1);
                engine.setParameter(this.group, "beats_translate_" + direction, 0);
            }
        }
    });

    // T button - unused
    this.tButton = new components.Button({
        midi: [0x90 + midiChannel, 0x04],
    });

    // C button - unused
    this.cButton = new components.Button({
        midi: [0x90 + midiChannel, 0x05],
    });
    
    this.reconnectComponents(function (c) {
        if (c.group === undefined) {
            c.group = this.currentDeck;
        }
    })
};

Mixtour.Deck.prototype = new components.Deck();

Mixtour.Global = function() {
    this.shiftOffset = 63;
    this.mainGain = new components.Pot({
        midi: [0xB4, 0x00],
        group: "[Master]",
        inKey: "gain",
        relative: true
    });

    this.cueGain = new components.Pot({
        midi: [0xB4, 0x01],
        group: "[Master]",
        inKey: "headGain",
        relative: true
    });

    this.cueMix = new components.Pot({
        midi: [0xB0, 0x06],
        group: "[Master]",
        inKey: "headMix",
        relative: true
    });

    this.shiftButton = new components.Button({
        midi: [0x90, 0x06],
        input: function(channel, control, value) {
            if (this.isPress(channel, control, value)) {
                Mixtour.shift();
            } else {
                Mixtour.unshift();
            }
        }
    });

    this.shiftButton.trigger();

    this.backButton = new components.Button({ // We use this to shift into a mode to adjust the playback speed
        midi: [0x90, 0x08],
        input: function(channel, control, value, status, _group) {
            if (this.isPress(channel, control, value, status)) {
                Mixtour.backShifted = true;
                midi.sendShortMsg(0x90, 0x08, 1);
            }
            else {
                Mixtour.backShifted = false;
                midi.sendShortMsg(0x90, 0x08, 0);
            }
        }
    });

    this.backButton.trigger();

    this.selectButton = new components.Button({
        midi: [0x90, 0x07],
        input: function(channel, control, value) {
            if( Mixtour.backShifted ) {
                // get master deck
                deck1 = engine.getValue("[Channel1]", "sync_leader");
                deck2 = engine.getValue("[Channel2]", "sync_leader");
                if (deck1) {
                    engine.setParameter("[Channel1]", "rate", 0.5);
                }
                if (deck2) {
                    engine.setParameter("[Channel2]", "rate", 0.5);
                }
            }
            else {
                engine.setParameter("[Library]", "GoToItem", 1);
                engine.setParameter("[Library]", "GoToItem", 0);
            }
        },
        unshift: function() {
            this.input = function(channel, control, value) {
                if( Mixtour.backShifted ) {
                    // get master deck
                    deck1 = engine.getValue("[Channel1]", "sync_leader");
                    deck2 = engine.getValue("[Channel2]", "sync_leader");
                    if (deck1) {
                        engine.setParameter("[Channel1]", "rate", 0.5);
                    }
                    if (deck2) {
                        engine.setParameter("[Channel2]", "rate", 0.5);
                    }
                }
                else {
                    engine.setParameter("[Library]", "GoToItem", 1);
                    engine.setParameter("[Library]", "GoToItem", 0);
                }
            }
        }
    })

    this.selectKnob = new components.Encoder({
        midi: [0xB0, 0x07],
        group: "[Library]",
        shiftOffset: 64,
        input: function(channel, control, value) {
            direction = (value > 0x40) ? value - 0x80 : value;
            loop_direction = (value > 0x40) ? 1: -1;
            back_direction = (value > 0x40) ? "down":"up"
            fx_direction = (value > 0x40) ? "prev":"next"
            if( Mixtour.backShifted ) {
                // get master deck
                deck1 = engine.getValue("[Channel1]", "sync_leader");
                deck2 = engine.getValue("[Channel2]", "sync_leader");
                if (deck1) {
                    engine.setParameter("[Channel1]", "rate_perm_" + back_direction, 1);
                    engine.setParameter("[Channel1]", "rate_perm_" + back_direction, 0);
                }
                if (deck2) {
                    engine.setParameter("[Channel2]", "rate_perm_" + back_direction, 1);
                    engine.setParameter("[Channel2]", "rate_perm_" + back_direction, 0);
                }
            }
            else {
                if( !Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] && !Mixtour.fxShifted[0] && !Mixtour.fxShifted[1]) {
                    engine.setParameter("[Library]", "MoveVertical", direction);
                }
                else if( Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] ) {
                    engine.setParameter("[Channel1]", "loop_move", loop_direction * engine.getParameter("[Channel1]", "beatjump_size"));
                }
                else if( !Mixtour.loopShifted[0] && Mixtour.loopShifted[1] ) {
                    engine.setParameter("[Channel2]", "loop_move", loop_direction * engine.getParameter("[Channel1]", "beatjump_size"));
                }

                else if( Mixtour.fxShifted[0] && !Mixtour.fxShifted[1] ) {
                    engine.setParameter("[QuickEffectRack1_[Channel1]]", fx_direction + "_chain_preset", 1);
                }
                else if( !Mixtour.fxShifted[0] && Mixtour.fxShifted[1] ) {
                    engine.setParameter("[QuickEffectRack1_[Channel2]]", fx_direction + "_chain_preset", 1);
                }
                else if (Mixtour.fxShifted[0] && Mixtour.fxShifted[1]) {
                    engine.setParameter("[QuickEffectRack1_[Channel1]]", fx_direction + "_chain_preset", 1);
                    engine.setParameter("[QuickEffectRack1_[Channel2]]", fx_direction + "_chain_preset", 1);
                }
            }
        },
        shift: function() {
            this.input = function(channel, control, value) {
                direction = (value > 0x40) ? "up" : "down";
                loop_direction = (value > 0x40) ? "halve": "double";
                if( !Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] ) {
                    engine.setParameter("[Channel1]", "waveform_zoom_" + direction, 1);
                    engine.setParameter("[Channel2]", "waveform_zoom_" + direction, 1);
                }
                else if( Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] ) {
                    engine.setParameter("[Channel1]", "beatjump_size_" + loop_direction, 1);
                }
                else if( !Mixtour.loopShifted[0] && Mixtour.loopShifted[1] ) {
                    engine.setParameter("[Channel2]", "beatjump_size_" + loop_direction, 1);
                }
            }
        },
        unshift: function() {
            this.input = function(channel, control, value) {
                direction = (value > 0x40) ? value - 0x80 : value;
                loop_direction = (value > 0x40) ? -1: 1;
                back_direction = (value > 0x40) ? "down":"up"
                fx_direction = (value > 0x40) ? "prev":"next"
                if( Mixtour.backShifted ) {
                    // get master deck
                    deck1 = engine.getValue("[Channel1]", "sync_leader");
                    deck2 = engine.getValue("[Channel2]", "sync_leader");
                    if (deck1) {
                        engine.setParameter("[Channel1]", "rate_perm_" + back_direction, 1);
                        engine.setParameter("[Channel1]", "rate_perm_" + back_direction, 0);
                    }
                    if (deck2) {
                        engine.setParameter("[Channel2]", "rate_perm_" + back_direction, 1);
                        engine.setParameter("[Channel2]", "rate_perm_" + back_direction, 0);
                    }
                }
                else {
                    if( !Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] && !Mixtour.fxShifted[0] && !Mixtour.fxShifted[1]) {
                        engine.setParameter("[Library]", "MoveVertical", direction);
                    }
                    else if( Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] ) {
                        engine.setParameter("[Channel1]", "loop_move", loop_direction * engine.getParameter("[Channel1]", "beatjump_size"));
                    }
                    else if( !Mixtour.loopShifted[0] && Mixtour.loopShifted[1] ) {
                        engine.setParameter("[Channel2]", "loop_move", loop_direction * engine.getParameter("[Channel1]", "beatjump_size"));
                    }
    
                    else if( Mixtour.fxShifted[0] && !Mixtour.fxShifted[1] ) {
                        engine.setParameter("[QuickEffectRack1_[Channel1]]", fx_direction + "_chain_preset", 1);
                    }
                    else if( !Mixtour.fxShifted[0] && Mixtour.fxShifted[1] ) {
                        engine.setParameter("[QuickEffectRack1_[Channel2]]", fx_direction + "_chain_preset", 1);
                    }
                    else if (Mixtour.fxShifted[0] && Mixtour.fxShifted[1]) {
                        engine.setParameter("[QuickEffectRack1_[Channel1]]", fx_direction + "_chain_preset", 1);
                        engine.setParameter("[QuickEffectRack1_[Channel2]]", fx_direction + "_chain_preset", 1);
                    }
                }
            }
        }
    })

    this.previewButton = new components.Button({
        midi: [0x90, 0x43],
        group: "[PreviewDeck1]",
        inKey: "LoadSelectedTrack",
        outKey: "track_loaded"
    });

    // xfader
    this.crossfader = new components.Pot({
        midi: [0xB0, 0x08],
        group: "[Master]",
        inKey: "crossfader",
        relative: true
    });

    // VU Meters
    // MST Shift - MST
    this.vuMeterShiftR = new components.Component({
        midi: [0x91, 0x51],
        group: "[Main]",
        outKey: "vu_meter_right",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else if (engine.getValue(group, "vu_meter") >= 0.9) {
                value = 0x67;
            } else {
                value = Math.round(value * 0x4D);
            }
            this.send(value);
        },
    })

    this.vuMeterShiftL = new components.Component({
        midi: [0x90, 0x51],
        group: "[Main]",
        outKey: "vu_meter_left",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else if (engine.getValue(group, "vu_meter") >= 0.9) {
                value = 0x67;
            } else {
                value = Math.round(value * 0x4D);
            }
            this.send(value);
        },
    })
    // MST - Decks
    this.vuMeterDeckR = new components.Component({
        midi: [0x91, 0x12],
        group: "[Channel2]",
        outKey: "vu_meter",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else if (engine.getValue(group, "vu_meter") >= 0.9) {
                value = 0x67;
            } else {
                value = Math.round(value * 0x4D);
            }
            this.send(value);
        },
    })

    this.vuMeterDeckL = new components.Component({
        midi: [0x90, 0x12],
        group: "[Channel1]",
        outKey: "vu_meter",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else if (engine.getValue(group, "vu_meter") >= 0.9) {
                value = 0x67;
            } else {
                value = Math.round(value * 0x4D);
            }
            this.send(value);
        },
    })
    // PFL Shift - MST
    this.vuMeterShiftPFLR = new components.Component({
        midi: [0x91, 0x50],
        group: "[Main]",
        outKey: "vu_meter_right",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else if (engine.getValue(group, "vu_meter") >= 0.9) {
                value = 0x67;
            } else {
                value = Math.round(value * 0x4D);
            }
            this.send(value);
        },
    })

    this.vuMeterShiftPFLL = new components.Component({
        midi: [0x90, 0x50],
        group: "[Main]",
        outKey: "vu_meter_left",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else if (engine.getValue(group, "vu_meter") >= 0.9) {
                value = 0x67;
            } else {
                value = Math.round(value * 0x4D);
            }
            this.send(value);
        },
    })
    this.vuMeterPFLR = new components.Component({
        midi: [0x91, 0x11],
        group: "[Channel2]",
        outKey: "vu_meter",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else if (engine.getValue(group, "vu_meter") >= 0.9) {
                value = 0x67;
            } else {
                value = Math.round(value * 0x4D);
            }
            this.send(value);
        },
    })

    this.vuMeterPFLL = new components.Component({
        midi: [0x90, 0x11],
        group: "[Channel1]",
        outKey: "vu_meter",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else if (engine.getValue(group, "vu_meter") >= 0.9) {
                value = 0x67;
            } else {
                value = Math.round(value * 0x4D);
            }
            this.send(value);
        },
    })
}
Mixtour.Global.prototype = Object.create(components.ComponentContainer.prototype)


// Other LED interactions (FX, )

Mixtour.shift = function() {
    Mixtour.shifted = true;
    Mixtour.leftDeck.shift();
    Mixtour.rightDeck.shift();
    Mixtour.global.shift();
}

Mixtour.unshift = function() {
    Mixtour.shifted = false;
    Mixtour.leftDeck.unshift();
    Mixtour.rightDeck.unshift();
    Mixtour.global.unshift();
}