// Layer 1 - Main FX controls
// Tries to mimic a DJM mixer's effects as closely as possible
// QuickFX on reloop are for effect chain loading
// FX1 maps noise, crush, and space effects in that order so that they can build on top of one another (knobs 0, 4, 8)
// FX2 maps to sweep, filer, and dub echo (knobs 1, 5, 9). knob 13 is dry wet mix
// FX4 maps to beatFX, which is remaining effects
// Knobs 3, 7, 11, 14, 15 mapped to FX4 to mimic beatFX as closely as possible
  
// Layer 2 - FX development on FX3: needs work, crashes mixxx when FX/controls don't map anywhere
// Use side buttons as shift
// parameters 1-4 for effects 1-3 are accessible
// TODO: buttons cycle super knob interaction for each parameter
// TODO: Left top side shift + parameter1 knob = enable/disable effect

// Layer 3 - Unused

// Layer 4 - Remix layer, stems and FX
//  left 8 are stem volumes, click FX toggle
//  right 8 are QFX super knobs with FX selection on press
//    Create an input function that burns a variable buffer to smooth out resolution
//    Try using encoder style (0x3F/0x41) and sending LED updates to get around detent 0x40 bug

var MFT = {};

MFT.colors = {
    blue: 1,
    green: 60,
    yellow: 70,
    orange: 80,
    red: 90,
    pink: 100,
    violet: 126
};

MFT.init = function () {
    MFT.leftDeck = new MFT.Deck([1]);
    MFT.rightDeck = new MFT.Deck([2]);

    MFT.fx1Special = []
    MFT.fx1Knob = []
    MFT.fx1Button = []

    // Layer 1 - DJM clone
    MFT.colorFX1A = new components.Button({
        midi: [0xB1, 0x00],
        type: 2,
        group: "[EffectRack1_EffectUnit1_Effect1]",
        key: 'enabled'
    })

    MFT.colorFX1B = new components.Button({
        midi: [0xB1, 0x04],
        type: 2,
        group: "[EffectRack1_EffectUnit1_Effect2]",
        key: 'enabled'
    })

    MFT.colorFX1C = new components.Button({
        midi: [0xB1, 0x08],
        type: 2,
        group: "[EffectRack1_EffectUnit1_Effect3]",
        key: 'enabled'
    })

    MFT.colorFX2A = new components.Button({
        midi: [0xB1, 0x01],
        type: 2,
        group: "[EffectRack1_EffectUnit2_Effect1]",
        key: 'enabled'
    })

    MFT.colorFX2B = new components.Button({
        midi: [0xB1, 0x05],
        type: 2,
        group: "[EffectRack1_EffectUnit2_Effect2]",
        key: 'enabled'
    })

    MFT.colorFX2C = new components.Button({
        midi: [0xB1, 0x09],
        type: 2,
        group: "[EffectRack1_EffectUnit2_Effect3]",
        key: 'enabled'
    })

    MFT.beatFXSelect = new components.Encoder({
        midi: [0xB4, 0x03],
        group: "[EffectRack1_EffectUnit4_Effect2]",
        input: function(channel, control, value) {
            currentChain = engine.getValue(this.group, 'loaded_effect')
            if (value == 0x00) {
                if (currentChain != 0) engine.setParameter(this.group, 'loaded_effect', 0)
            }
            else if (value >= 0x01 && value <= 0x10) {
                if (currentChain != 1) engine.setParameter(this.group, 'loaded_effect', 1)
            }
            else if (value >= 0x11 && value <= 0x20) {
                if (currentChain != 2) engine.setParameter(this.group, 'loaded_effect', 2)
            }
            else if (value >= 0x21 && value <= 0x30) {
                if (currentChain != 3) engine.setParameter(this.group, 'loaded_effect', 3)
            }
            else if (value >= 0x31 && value <= 0x3E) {
                if (currentChain != 4) engine.setParameter(this.group, 'loaded_effect', 4)
            }
            else if (value >= 0x3F && value <= 0x40) { // center
                if (currentChain != 5) engine.setParameter(this.group, 'loaded_effect', 5)
            }
            else if (value >= 0x41 && value <= 0x4E) {
                if (currentChain != 6) engine.setParameter(this.group, 'loaded_effect', 6)
            }
            else if (value >= 0x4F && value <= 0x5E) {
                if (currentChain != 7) engine.setParameter(this.group, 'loaded_effect', 7)
            }
            else if (value >= 0x5F && value <= 0x6E) {
                if (currentChain != 8) engine.setParameter(this.group, 'loaded_effect', 8)
            }
            else if (value >= 0x6F && value <= 0x7E) {
                if (currentChain != 9) engine.setParameter(this.group, 'loaded_effect', 9)
            }
            else if (value == 0x7F) {
                if (currentChain != 10) engine.setParameter(this.group, 'loaded_effect', 10)
            }
        }
    });

    MFT.beatFXChannelSelect = new components.Encoder({
        midi: [0xB4, 0x07],
        group: "[EffectRack1_EffectUnit4]",
        input: function(channel, control, value) {
            if (value == 0x00) {
                engine.setParameter(this.group, 'group_[Master]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel1]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 0)
                engine.setParameter(this.group, 'group_[Headphone]_enable', 0)
            }
            else if (value >= 0x01 && value <= 0x10) {
                engine.setParameter(this.group, 'group_[Master]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel1]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 0)
                engine.setParameter(this.group, 'group_[Headphone]_enable', 1)
            }
            else if (value >= 0x11 && value <= 0x20) {
                engine.setParameter(this.group, 'group_[Headphone]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel1]_enable', 1)
            }
            else if (value >= 0x21 && value <= 0x30) {
                engine.setParameter(this.group, 'group_[Channel1]_enable', 0)
                engine.setParameter(this.group, 'group_[Headphone]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 1)
            }
            else if (value >= 0x31 && value <= 0x3E) {
                engine.setParameter(this.group, 'group_[Master]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel1]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 0)
                engine.setParameter(this.group, 'group_[Headphone]_enable', 1)
            }
            else if (value >= 0x3F && value <= 0x40) { // center
                engine.setParameter(this.group, 'group_[Headphone]_enable', 0)
                engine.setParameter(this.group, 'group_[Master]_enable', 1)
            }
            else if (value >= 0x41 && value <= 0x4E) {
                engine.setParameter(this.group, 'group_[Master]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel1]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 0)
                engine.setParameter(this.group, 'group_[Headphone]_enable', 1)
            }
            else if (value >= 0x4F && value <= 0x5E) {
                engine.setParameter(this.group, 'group_[Master]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel1]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 0)
                engine.setParameter(this.group, 'group_[Headphone]_enable', 1)
            }
            else if (value >= 0x5F && value <= 0x6E) {
                engine.setParameter(this.group, 'group_[Master]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel1]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 0)
                engine.setParameter(this.group, 'group_[Headphone]_enable', 1)
            }
            else if (value >= 0x6F && value <= 0x7E) {
                engine.setParameter(this.group, 'group_[Master]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel1]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 0)
                engine.setParameter(this.group, 'group_[Headphone]_enable', 1)
            }
            else if (value == 0x7F) {
                engine.setParameter(this.group, 'group_[Master]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel1]_enable', 0)
                engine.setParameter(this.group, 'group_[Channel2]_enable', 0)
                engine.setParameter(this.group, 'group_[Headphone]_enable', 1)
            }
        }
    });

    // FX1 special button - super, mix reset, FX1 enable for each deck
    MFT.fx1Special[1] = new components.Button({
        midi: [0xB1, 0x1C],
        group: "[EffectRack1_EffectUnit3]",
        key: 'super1_set_default',
    });
    MFT.fx1Special[2] = new components.Button({
        midi: [0xB1, 0x1D],
        group: "[EffectRack1_EffectUnit3]",
        key: 'mix_set_default',
    });
    MFT.fx1Special[3] = new components.Button({
        midi: [0xB1, 0x1E],
        type: 2,
        group: "[EffectRack1_EffectUnit3]",
        key: 'group_[Channel1]_enable',
    });
    MFT.fx1Special[4] = new components.Button({
        midi: [0xB1, 0x1F],
        type: 2,
        group: "[EffectRack1_EffectUnit3]",
        key: 'group_[Channel2]_enable',
    });

    // Layer 2 - FX3 controls
    for (var i = 1; i <= 4; i++) {
        // FX1 knob
        MFT.fx1Knob[i] = new components.Encoder({
            midi: [0xB0, 0x0F + i],
            group: "[EffectRack1_EffectUnit3_Effect1]",
            key: 'parameter' + i,
        });

        MFT.fx1Knob[i+4] = new components.Encoder({
            midi: [0xB0, 0x13 + i],
            group: "[EffectRack1_EffectUnit3_Effect2]",
            key: 'parameter' + i,
        });

        MFT.fx1Knob[i+8] = new components.Encoder({
            midi: [0xB0, 0x17 + i],
            group: "[EffectRack1_EffectUnit3_Effect3]",
            key: 'parameter' + i,
        });

        // FX1 button
        MFT.fx1Button[i] = new components.Button({
            midi: [0xB1, 0x09 + i],
            group: "[EffectRack1_EffectUnit3_Effect1]",
            key: 'parameter' + i + '_link_type',
        });

        MFT.fx1Button[i+4] = new components.Button({
            midi: [0xB1, 0x13 + i],
            group: "[EffectRack1_EffectUnit3_Effect2]",
            key: 'parameter' + i + '_link_type',
        });

        MFT.fx1Button[i+8] = new components.Button({
            midi: [0xB1, 0x17 + i],
            group: "[EffectRack1_EffectUnit3_Effect3]",
            key: 'parameter' + i + '_link_type',
        });
    }

    // FX1 special (13-16) - super, mix
    MFT.fx1Super = new components.Encoder({
        midi: [0xB0, 0x1C],
        group: "[EffectRack1_EffectUnit3]",
        key: 'super1',
    });
    MFT.fx1Mix = new components.Encoder({
        midi: [0xB0, 0x1D],
        group: "[EffectRack1_EffectUnit3]",
        key: 'mix',

    });

    //midi.sendShortMsg(0xB1, 0x3A, 0x00) // janky fix for control 0x3A being a lil B (was 0x0A)

};

MFT.shutdown = function () {
    // TODO - dim all LEDs
};

MFT.Deck = function (deckNumbers) {
    components.Deck.call(this, deckNumbers);

    this.stemKnob = [];
    this.stemButton = [];
    this.fxKnob = [];
    this.fxSelectKnob = []
    this.fxButton = [];

    this.fx1Knob = [];
    this.fx1Button = [];

        // Stem knob - Stem volume
    for (var i = 1; i <= 4; i++) {
        this.stemKnob[i] = new components.Encoder({
            midi: [0xB0, 0x30 + 4*i - 4 + this.deckNumbers[0] - 1],
            group: "[Channel" + this.deckNumbers + "_Stem" + i + "]",
            key: 'volume',
    
        });

        // Stem button - Toggle effects on/off - For some reason the control at 0x0D is not initialized properly
        this.stemButton[i] = new components.Button({
            midi: [0xB1, 0x30 + 4*i - 4 + this.deckNumbers[0] - 1],
            type: 1,
            group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem" + i + "]]",
            key: 'enabled'
        });

        // FX knob - super knob for stem effects
        this.fxKnob[i] = new components.Encoder({
            midi: [0xB0, 0x32 + 4*i - 4 + this.deckNumbers[0] - 1],
            group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem" + i + "]]",
            key: 'super1',
        });

        this.fxSelectKnob[i] = new components.Encoder({
            midi: [0xB4, 0x32 + 4*i - 4 + this.deckNumbers[0] - 1],
            group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem" + i + "]]",
            input: function(channel, control, value) {
                currentChain = engine.getValue(this.group, 'loaded_chain_preset')
                if (value == 0x00) {
                    if (currentChain != 0) engine.setParameter(this.group, 'loaded_chain_preset', 0)
                }
                else if (value >= 0x01 && value <= 0x10) {
                    if (currentChain != 1) engine.setParameter(this.group, 'loaded_chain_preset', 1)
                }
                else if (value >= 0x11 && value <= 0x20) {
                    if (currentChain != 2) engine.setParameter(this.group, 'loaded_chain_preset', 2)
                }
                else if (value >= 0x21 && value <= 0x30) {
                    if (currentChain != 3) engine.setParameter(this.group, 'loaded_chain_preset', 3)
                }
                else if (value >= 0x31 && value <= 0x3E) {
                    if (currentChain != 4) engine.setParameter(this.group, 'loaded_chain_preset', 4)
                }
                else if (value >= 0x3F && value <= 0x40) { // center
                    if (currentChain != 5) engine.setParameter(this.group, 'loaded_chain_preset', 5)
                }
                else if (value >= 0x41 && value <= 0x4E) {
                    if (currentChain != 6) engine.setParameter(this.group, 'loaded_chain_preset', 6)
                }
                else if (value >= 0x4F && value <= 0x5E) {
                    if (currentChain != 7) engine.setParameter(this.group, 'loaded_chain_preset', 7)
                }
                else if (value >= 0x5F && value <= 0x6E) {
                    if (currentChain != 8) engine.setParameter(this.group, 'loaded_chain_preset', 8)
                }
                else if (value >= 0x6F && value <= 0x7E) {
                    if (currentChain != 9) engine.setParameter(this.group, 'loaded_chain_preset', 9)
                }
                else if (value == 0x7F) {
                    if (currentChain != 10) engine.setParameter(this.group, 'loaded_chain_preset', 10)
                }
            }
        });
    }
    
    this.reconnectComponents(function (c) {
        if (c.group === undefined) {
            c.group = this.currentDeck;
        }
    })
};

MFT.Deck.prototype = new components.Deck();