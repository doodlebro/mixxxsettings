var Mixtour = {};

// Global state vars
Mixtour.shifted = false;
Mixtour.loopShifted = [false, false]

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
};

Mixtour.shutdown = function () {
    // TODO - dim all LEDs
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
        shiftOffset: 63,
        sendShifted: true,
        shift: function() {
            this.type = 1,
            this.inKey = "quantize",
            this.outKey = "quantize",
            this.on = Mixtour.padColors.green
        },
        unshift: function() {
            this.type = 0,
            this.inKey = "cue_default",
            this.outKey = "cue_indicator",
            this.on = Mixtour.padColors.orange
        }
    });
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
    this.loopButton = new components.Button({ // TODO: convert to hold like sync and reloop_toggle when held
        midi: [0x90 + midiChannel, 0x09],
        type: 0,
        inKey: "beatloop_activate",
        outKey: "loop_enabled",
        input: function(channel, control, value) {
            if( value === 0x7F ) {
                if (engine.getValue(this.group, "loop_enabled") === 1 && !Mixtour.shifted) {
                    engine.setParameter(this.group, "reloop_toggle", 1)
                    engine.setParameter(this.group, "reloop_toggle", 0)
                } else {
                    engine.setParameter(this.group, this.inKey, 1)
                    engine.setParameter(this.group, this.inKey, 0)
                }
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
        type: 1,
        sendShifted: true,
        shift: function() { //TODO: move this shift function to a global dedicated button
            this.lastgroup = this.group
            this.group = "[PreviewDeck1]"
            this.inKey = "LoadSelectedTrack";
        },
        unshift: function() {
            this.group = this.lastgroup
            this.inKey = "pfl";
        }
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
        inKey: 'volume',
        relative: true
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

    // filter/fx - a lil janky
    this.filterFXKnob = new components.Pot({
        midi: [0xB0 + midiChannel, 0x04],
        raw_channel: this.currentDeck,
        group: '[QuickEffectRack1_' + this.raw_channel + ']',
        inKey: 'super1',

        shift: function() {
            this.group = '[QuickEffectRack1_' + this.raw_channel + '_Effect1]',
            this.inKey = "parameter2"
        },
        unshift: function() {
            this.group = '[QuickEffectRack1_' + this.raw_channel + ']',
            this.inKey = "super1"
        }

    });

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
        group: '[QuickEffectRack1_' + this.currentDeck + ']',
        inKey: "next_chain_preset",
        outKey: "loaded_chain_preset",
        sendShifted: true,
        shift: function() {
            this.inKey = "prev_chain_preset"
        },
        unshift: function() {
            this.inKey = "next_chain_preset"
        }
    })

    // load button - we use this as the quick effect enable button since it is fat
    this.loadButton = new components.Button({
        midi: [0x90 + midiChannel, 0x02],
        type: 1,
        group: '[QuickEffectRack1_' + this.currentDeck + ']',
        inKey: 'enabled',
        outKey: 'loaded_chain_preset',
        sendShifted: true
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

    // C button - we use this to edit loop position
    this.cButton = new components.Button({
        midi: [0x90 + midiChannel, 0x05],
        input: function(channel, control, value, status, _group) {
            if (this.isPress(channel, control, value, status)) {
                Mixtour.loopShifted[channel] = true;
                print(Mixtour.loopShifted);
            }
            else Mixtour.loopShifted[channel] = false;
        }
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

    this.backButton = new components.Button({ //unused
        midi: [0x90, 0x08]
    })

    this.selectButton = new components.Button({
        midi: [0x90, 0x07],
        group: "[Library]",
        inKey: "GoToItem"
    })

    this.selectKnob = new components.Encoder({
        midi: [0xB0, 0x07],
        group: "[Library]",
        shiftOffset: 64,
        input: function(channel, control, value) {
            direction = (value > 0x40) ? value - 0x80 : value;
            loop_direction = (value > 0x40) ? 1: -1;
            if( !Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] ) {
                engine.setParameter("Library]", "MoveVertical", direction);
            }
            else if( Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] ) {
                engine.setParameter("[Channel1]", "loop_move", loop_direction * engine.getParameter("[Channel1]", "beatjump_size"));
            }
            else if( !Mixtour.loopShifted[0] && Mixtour.loopShifted[1] ) {
                engine.setParameter("[Channel2]", "loop_move", loop_direction * engine.getParameter("[Channel1]", "beatjump_size"));
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
                if( !Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] ) {
                    engine.setParameter("[Library]", "MoveVertical", direction);
                }
                else if( Mixtour.loopShifted[0] && !Mixtour.loopShifted[1] ) {
                    engine.setParameter("[Channel1]", "loop_move", loop_direction * engine.getParameter("[Channel1]", "beatjump_size"));
                }
                else if( !Mixtour.loopShifted[0] && Mixtour.loopShifted[1] ) {
                    engine.setParameter("[Channel2]", "loop_move", loop_direction * engine.getParameter("[Channel1]", "beatjump_size"));
                }
            }
        }
    })

    // xfader
    this.crossfader = new components.Pot({
        midi: [0xB0, 0x08],
        group: "[Master]",
        inKey: "crossfader",
        relative: true
    });

    // VU Meters
    this.vuMeterR = new components.Component({
        midi: [0x91, 0x12],
        group: "[Main]",
        outKey: "vu_meter_right",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else {
                value = Math.round(value * 0x67);
            }
            this.send(value);
        },
    });

    this.vuMeterL = new components.Component({
        midi: [0x90, 0x12],
        group: "[Main]",
        outKey: "vu_meter_left",
        output: function(value, group) {
            // The red LEDs light up with MIDI values greater than 0x68.
            // The Red LEDs should only be illuminated if the track is clipping.
            if (engine.getValue(group, "peak_indicator") === 1) {
                value = 0x68;
            } else {
                value = Math.round(value * 0x67);
            }
            this.send(value);
        },
    });
};
Mixtour.Global.prototype = Object.create(components.ComponentContainer.prototype);


// Other LED interactions (FX, )

Mixtour.shift = function() {
    Mixtour.shifted = true;
    Mixtour.leftDeck.shift();
    Mixtour.rightDeck.shift();
    Mixtour.global.shift();
};

Mixtour.unshift = function() {
    Mixtour.shifted = false;
    Mixtour.leftDeck.unshift();
    Mixtour.rightDeck.unshift();
    Mixtour.global.unshift();
};