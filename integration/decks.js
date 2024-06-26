const decks = {
    SelectedDeck: {
        _name: 'SelectedDeck',
        _units: [
            {
                _id: 0,
            },
            {
                _id: 0,
            },
            {
                _id: 0,
            },
            {
                _id: 0,
            },
            {
                _id: 0,
            },
            {
                _id: 0,
            },
            {
                _id: 0,
            }
        ],
        _activeAbilities: [
            {
                _id: 0,
            },
            {
                _id: 0,
            },
            {
                _id: 0,
            },
            {
                _id: 0,
            },
        ],
    },
    Decks: [
        {
            _name: 'SelectedDeck',
            _units: [
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                }
            ],
            _activeAbilities: [
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
            ],
        },
        {
            _name: 'SelectedDeck',
            _units: [
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                }
            ],
            _activeAbilities: [
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
            ],
        },
        {
            _name: 'SelectedDeck',
            _units: [
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                }
            ],
            _activeAbilities: [
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
                {
                    _id: 0,
                },
            ],
        }
    ],
};

const unitSlotTiers = [
    [0], [0], [1], [2], [3], [4], [1,3], [2,4]
]

const deckAbilities = [
    'q', 'w', 'e', 'r'
]

function createDeckConfiguration(obj) {
    return JSON.stringify(JSON.stringify(decks));
}
