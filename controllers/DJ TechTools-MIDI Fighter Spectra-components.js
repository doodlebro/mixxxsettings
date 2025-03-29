// MIDI Fighter Spectra Controller
// Routes through DoRe MIDI

var MFS = {}

MFS.selectedDeck = 0

MFS.init = function () {
    MFS.global = new MFS.Global();
    MFS.armLEDS(MFS.selectedDeck)
}

MFS.shutdown = function () {
    // TODO - dim all LEDs
}

MFS.armLEDS = function(deck) {
    // blink loop halve/double buttons
    midi.sendShortMsg(0x9B, 0x58, 0x25)
    midi.sendShortMsg(0x9B, 0x5C, 0x27)

    // set color for deck dependent buttons
    midi.sendShortMsg(0x9A, 0x55, 0x54 + (6 * deck + deck))
    midi.sendShortMsg(0x9A, 0x59, 0x54 + (6 * deck + deck))
    midi.sendShortMsg(0x9A, 0x5D, 0x54 + (6 * deck + deck))
    midi.sendShortMsg(0x9A, 0x61, 0x54 + (6 * deck + deck))

    midi.sendShortMsg(0x9A, 0x56, 0x54 + (6 * deck + deck))
    midi.sendShortMsg(0x9A, 0x5A, 0x54 + (6 * deck + deck))
    midi.sendShortMsg(0x9A, 0x5E, 0x54 + (6 * deck + deck))
    midi.sendShortMsg(0x9A, 0x62, 0x54 + (6 * deck + deck))

    midi.sendShortMsg(0x9A, 0x57, 0x54 + (6 * deck + deck))
    midi.sendShortMsg(0x9A, 0x5B, 0x54 + (6 * deck + deck))
    midi.sendShortMsg(0x9A, 0x5F, 0x54 + (6 * deck + deck))
    midi.sendShortMsg(0x9A, 0x63, 0x54 + (6 * deck + deck))

    // pulse looproll buttons
    midi.sendShortMsg(0x9B, 0x55, 0x30)
    midi.sendShortMsg(0x9B, 0x59, 0x2F)
    midi.sendShortMsg(0x9B, 0x5D, 0x2E)
    midi.sendShortMsg(0x9B, 0x61, 0x2D)

    // blink beat/loop jump buttons

}

MFS.Global = function() {
    // Only 1 button mapped to each deck, others depend on selection
    this.leftSlip = new components.Button({
        midi: [0x9A, 0x54],
        group: '[Channel1]',
        key: 'slip_enabled',
        input: function(channel, control, value, status, _group) {
            if (this.isPress(channel, control, value, status)) {
                MFS.selectedDeck = 0
                MFS.armLEDS(MFS.selectedDeck);
                this.inToggle();
                this.isLongPressed = false;
                this.longPressTimer = engine.beginTimer(this.longPressTimeout, () => {
                    this.isLongPressed = true;
                    this.longPressTimer = components.NO_TIMER;
                }, true);
            } else {
                if (this.isLongPressed) {
                    this.inToggle();
                } else if (this.triggerOnRelease) {
                    this.trigger();
                }
                if (this.longPressTimer !== components.NO_TIMER) {
                    engine.stopTimer(this.longPressTimer);
                    this.longPressTimer = components.NO_TIMER;
                }
                this.isLongPressed = false;
            }
        }

    })
    this.rightSlip = new components.Button({
        midi: [0x9A, 0x60],
        group: '[Channel2]',
        key: 'slip_enabled',
        input: function(channel, control, value, status, _group) {
            if (this.isPress(channel, control, value, status)) {
                MFS.selectedDeck = 1
                MFS.armLEDS(MFS.selectedDeck);
                this.inToggle();
                this.isLongPressed = false;
                this.longPressTimer = engine.beginTimer(this.longPressTimeout, () => {
                    this.isLongPressed = true;
                    this.longPressTimer = components.NO_TIMER;
                }, true);
            } else {
                if (this.isLongPressed) {
                    this.inToggle();
                } else if (this.triggerOnRelease) {
                    this.trigger();
                }
                if (this.longPressTimer !== components.NO_TIMER) {
                    engine.stopTimer(this.longPressTimer);
                    this.longPressTimer = components.NO_TIMER;
                }
                this.isLongPressed = false;
            }
        }
    })
    this.loopHalve = new components.Button({
        midi: [0x9A, 0x58],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        key: 'loop_halve'
    })
    this.loopDouble = new components.Button({
        midi: [0x9A, 0x5C],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        key: 'loop_double'
    })
    //beatlooprolls
    this.beatLoopRoll = new components.Button({
        midi: [0x9A, 0x61],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatlooproll_1_activate',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    this.beatLoopRollHalf = new components.Button({
        midi: [0x9A, 0x59],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatlooproll_0.5_activate',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    this.beatLoopRollQuarter = new components.Button({
        midi: [0x9A, 0x5D],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatlooproll_0.25_activate',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    this.beatLoopRollEighth = new components.Button({
        midi: [0x9A, 0x55],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatlooproll_0.125_activate',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    // half beat jumps
    this.jumpHalfBeatBack = new components.Button({
        midi: [0x9A, 0x56],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatjump_0.5_backward',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    this.jumpHalfBeatForward = new components.Button({
        midi: [0x9A, 0x5A],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatjump_0.5_forward',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    //full beat jumps
    this.jumpBeatBack = new components.Button({
        midi: [0x9A, 0x5E],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatjump_1_backward',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    this.jumpBeatForward = new components.Button({
        midi: [0x9A, 0x62],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatjump_1_forward',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    //two beat jumps
    this.jumpTwoBeatBack = new components.Button({
        midi: [0x9A, 0x57],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatjump_2_backward',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    this.jumpTwoBeatForward = new components.Button({
        midi: [0x9A, 0x5B],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatjump_2_forward',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    //four beat jumps
    this.jumpFourBeatBack = new components.Button({
        midi: [0x9A, 0x5F],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatjump_4_backward',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })
    this.jumpFourBeatForward = new components.Button({
        midi: [0x9A, 0x63],
        group: '[Channel' + (MFS.selectedDeck + 1) + ']',
        inKey: 'beatjump_4_forward',
        input: function(channel, control, value, status, _group) {
            this.group = '[Channel' + (MFS.selectedDeck + 1) + ']',
            this.inSetValue(this.isPress(channel, control, value, status));
        },
    })

    this.reconnectComponents(function (c) {
        if (c.group === undefined) {
            // 'this' inside a function passed to reconnectComponents refers to the ComponentContainer
            // so 'this' refers to the custom Deck object being constructed
            c.group = this.currentDeck;
        }
    });
}
MFS.Global.prototype = Object.create(components.ComponentContainer.prototype)