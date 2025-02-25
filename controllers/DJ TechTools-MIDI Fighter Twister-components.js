//
// Layer 1 - Remix layer, stems and FX
//  left 8 are stem volumes, click FX toggle
//  right 8 are QFX super knobs with FX selection on press
//    Create an input function that burns a variable buffer to smooth out resolution
//    Try using encoder style (0x3F/0x41) and sending LED updates to get around detent 0x40 bug
//  
// Layer 2 - FX development on FX1

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
};

MFT.shutdown = function () {
    // TODO - dim all LEDs
};

MFT.Deck = function (deckNumbers) {
    components.Deck.call(this, deckNumbers);

    this.stemKnob = [];
    this.stemButton = [];
    this.fxKnob = [];

    this.stemButton[0] = new components.Button({ //broken for deck2 due to hardcoded midi numbers... need to reprogram MFT and then code generating buttons/knobs can be cleaned up as well
        midi: [0xB1, 0x00],
        type: 1,
        group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem1]]",
        key: 'enabled'
    });
    this.stemButton[1] = new components.Button({
        midi: [0xB1, 0x04],
        type: 1,
        group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem2]]",
        key: 'enabled'
    });
    this.stemButton[2] = new components.Button({
        midi: [0xB1, 0x08],
        type: 1,
        group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem3]]",
        key: 'enabled'
    });
    this.stemButton[3] = new components.Button({
        midi: [0xB1, 0x0C],
        type: 1,
        group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem4]]",
        key: 'enabled'
    });

    this.stemKnob[0] = new components.Pot({
        midi: [0xB0, 0x00],
        group: "[Channel" + this.deckNumbers + "_Stem1]",
        key: 'volume',

    });

    this.stemKnob[1] = new components.Pot({
        midi: [0xB0, 0x04],
        group: "[Channel" + this.deckNumbers + "_Stem2]",
        key: 'volume',

    });

    this.stemKnob[2] = new components.Pot({
        midi: [0xB0, 0x08],
        group: "[Channel" + this.deckNumbers + "_Stem3]",
        key: 'volume',

    });

    this.stemKnob[3] = new components.Pot({
        midi: [0xB0, 0x0C],
        group: "[Channel" + this.deckNumbers + "_Stem4]",
        key: 'volume',

    });

    this.fxKnob[0] = new components.Pot({
        midi: [0xB0, 0x02],
        group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem1]]",
        key: 'super1',
    });

    this.fxKnob[1] = new components.Pot({
        midi: [0xB0, 0x06],
        group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem2]]",
        key: 'super1',
    });

    this.fxKnob[2] = new components.Pot({
        midi: [0xB0, 0x0A],
        group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem3]]",
        key: 'super1',
    });

    this.fxKnob[3] = new components.Pot({
        midi: [0xB0, 0x0E],
        group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem4]]",
        key: 'super1',
    });

/*     this.fxSelect = new components.Pot({ // needs work: custom input and buffer to move through available quick effects
        midi: [0xB0, 0x04],
        group: "[QuickEffectRack1_[Channel" + this.deckNumbers + "_Stem1]]"
    }); */
    
    
    this.reconnectComponents(function (c) {
        if (c.group === undefined) {
            c.group = this.currentDeck;
        }
    })
};

MFT.Deck.prototype = new components.Deck();