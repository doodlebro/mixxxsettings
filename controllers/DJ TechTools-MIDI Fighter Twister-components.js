//
// Layer 1 - Remix layer, stems and FX
//  left 8 are stem volumes, click FX toggle
//  right 8 are QFX super knobs with FX selection on press
//    Create an input function that burns a variable buffer to smooth out resolution
//    Try using encoder style (0x3F/0x41) and sending LED updates to get around detent 0x40 bug
//  
// Layer 2 - FX development on FX1
// Use side buttons as shift
// parameters 1-4 for effects 1-3 are accessible
// TODO: buttons cycle super knob interaction for each parameter
// TODO: Left top side shift + parameter1 knob = enable/disable effect

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

    // FX1 special button - super, mix reset, FX1 enable for each deck
    MFT.fx1Special[1] = new components.Button({
        midi: [0xB1, 0x1C],
        group: "[EffectRack1_EffectUnit1]",
        key: 'super1_set_default',
    });
    MFT.fx1Special[2] = new components.Button({
        midi: [0xB1, 0x1D],
        group: "[EffectRack1_EffectUnit1]",
        key: 'mix_set_default',
    });
    MFT.fx1Special[3] = new components.Button({
        midi: [0xB1, 0x1E],
        type: 2,
        group: "[EffectRack1_EffectUnit1]",
        key: 'group_[Channel1]_enable',
    });
    MFT.fx1Special[4] = new components.Button({
        midi: [0xB1, 0x1F],
        type: 2,
        group: "[EffectRack1_EffectUnit1]",
        key: 'group_[Channel2]_enable',
    });

    // Layer 2 - FX1 controls
    for (var i = 1; i <= 4; i++) {
        // FX1 knob
        MFT.fx1Knob[i] = new components.Encoder({
            midi: [0xB0, 0x0F + i],
            group: "[EffectRack1_EffectUnit1_Effect1]",
            key: 'parameter' + i,
        });

        MFT.fx1Knob[i+4] = new components.Encoder({
            midi: [0xB0, 0x13 + i],
            group: "[EffectRack1_EffectUnit1_Effect2]",
            key: 'parameter' + i,
        });

        MFT.fx1Knob[i+8] = new components.Encoder({
            midi: [0xB0, 0x17 + i],
            group: "[EffectRack1_EffectUnit1_Effect3]",
            key: 'parameter' + i,
        });

        // FX1 button
        MFT.fx1Button[i] = new components.Button({
            midi: [0xB1, 0x09 + i],
            group: "[EffectRack1_EffectUnit1_Effect1]",
            key: 'parameter' + i + '_link_type',
        });

        MFT.fx1Button[i+4] = new components.Button({
            midi: [0xB1, 0x13 + i],
            group: "[EffectRack1_EffectUnit1_Effect2]",
            key: 'parameter' + i + '_link_type',
        });

        MFT.fx1Button[i+8] = new components.Button({
            midi: [0xB1, 0x17 + i],
            group: "[EffectRack1_EffectUnit1_Effect3]",
            key: 'parameter' + i + '_link_type',
        });
    }

    // FX1 special (13-16) - super, mix
    MFT.fx1Super = new components.Encoder({
        midi: [0xB0, 0x1C],
        group: "[EffectRack1_EffectUnit1]",
        key: 'super1',
    });
    MFT.fx1Mix = new components.Encoder({
        midi: [0xB0, 0x1D],
        group: "[EffectRack1_EffectUnit1]",
        key: 'mix',

    });

    midi.sendShortMsg(0xB1, 0x0A, 0x00) // janky fix for control 0x0A being a lil B

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
            midi: [0xB0, 0x00 + 4*i - 4 + this.deckNumbers[0] - 1],
            group: "[Channel" + this.deckNumbers + "_Stem" + i + "]",
            key: 'volume',
    
        });

        // Stem button - Toggle effects on/off - For some reason the control at 0x0D is not initialized properly
        this.stemButton[i] = new components.Button({
            midi: [0xB1, 0x00 + 4*i - 4 + this.deckNumbers[0] - 1],
            type: 1,
            group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem" + i + "]]",
            key: 'enabled'
        });

        // FX knob - super knob for stem effects
        this.fxKnob[i] = new components.Encoder({
            midi: [0xB0, 0x02 + 4*i - 4 + this.deckNumbers[0] - 1],
            group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem" + i + "]]",
            key: 'super1',
        });

        this.fxSelectKnob[i] = new components.Encoder({
            midi: [0xB4, 0x02 + 4*i - 4 + this.deckNumbers[0] - 1],
            group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem" + i + "]]",
            input: function(channel, control, value) {
                currentChain = engine.getValue(this.group, 'loaded_chain_preset')
                if (value == 0x00) {
                    if (currentChain != 18) engine.setParameter(this.group, 'loaded_chain_preset', 18)
                }
                else if (value >= 0x01 && value <= 0x0A) {
                    if (currentChain != 1) engine.setParameter(this.group, 'loaded_chain_preset', 1)
                }
                else if (value >= 0x0C && value <= 0x16) {
                    if (currentChain != 2) engine.setParameter(this.group, 'loaded_chain_preset', 2)
                }
                else if (value >= 0x18 && value <= 0x21) {
                    if (currentChain != 3) engine.setParameter(this.group, 'loaded_chain_preset', 3)
                }
                else if (value >= 0x23 && value <= 0x2E) {
                    if (currentChain != 4) engine.setParameter(this.group, 'loaded_chain_preset', 4)
                }
                else if (value >= 0x2F && value <= 0x3A) {
                    if (currentChain != 5) engine.setParameter(this.group, 'loaded_chain_preset', 5)
                }
                else if (value >= 0x3C && value <= 0x45) {
                    if (currentChain != 15) engine.setParameter(this.group, 'loaded_chain_preset', 15)
                }
                else if (value >= 0x46 && value <= 0x51) {
                    if (currentChain != 6) engine.setParameter(this.group, 'loaded_chain_preset', 6)
                }
                else if (value >= 0x53 && value <= 0x5C) {
                    if (currentChain != 10) engine.setParameter(this.group, 'loaded_chain_preset', 10)
                }
                else if (value >= 0x5E && value <= 0x68) {
                    if (currentChain != 13) engine.setParameter(this.group, 'loaded_chain_preset', 13)
                }
                else if (value >= 0x6A && value <= 0x73) {
                    if (currentChain != 16) engine.setParameter(this.group, 'loaded_chain_preset', 16)
                }
                else if (value >= 0x75 && value <= 0x7F) {
                    if (currentChain != 11) engine.setParameter(this.group, 'loaded_chain_preset', 11)
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