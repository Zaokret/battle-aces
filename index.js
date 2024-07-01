// MAIN

var units = [];
var tiers = [];
var abilityToId = {
    "blink": 7,
    "overclock": 1,
    "recall": 8,
    "setup": 4
}
let selectedDeckIndex = -1;

fetchUnitsAndTiers()
    .then((data) => {
        units = data.units;
        tiers = data.tiers;
    })
    .then(() => {
        setupCards();
        setupAbilities();
        setupStorage();
    });


const unitInput = document.getElementById('select-unit');
const cards = document.getElementsByClassName('card');
const abilityInput = document.getElementById('select-ability')
const abilities = document.getElementsByClassName('ability slot');
const screenshot = document.getElementById('screenshot');
const fileInput = document.getElementById('file-input')
const loadBtn = document.getElementById('load-deck')
const saveBtn = document.getElementById('save-deck')
const downloadBtn = document.getElementById('download-deck')
const deckSelection = document.getElementById('deck-selection')

document.getElementById('load-file').addEventListener('click', ()=>{
    fileInput.click();
})

Array.from(cards).forEach(card => {
    addHoverEffect(card);
    card.addEventListener('click', () => {
        const selectionOpen = unitInput.hasChildNodes();
        if (selectionOpen) {
            const list = unitInput.children[0];
            if (list && list.id === card.id) {
                unitInput.togglePopover(false);
                return;
            }
        }

        unitInput.innerHTML = '';
        removeInProgress();

        const tierClasses = card.className
            .split(' ')
            .filter((c) => c.indexOf('t') > -1);

        const tierIds = tierClasses.map((c) =>
            parseInt(c.replace('t', ''))
        );

        const unitList = getUnitsByTier(tierIds);

        const selected = getSelectedUnitSlugs().filter(Boolean);
        const filteredUnits = unitList.filter(
            (unit) => !selected.some((slug) => unit.slug === slug)
        );

        if (filteredUnits.length === 0) {
            unitInput.innerHTML = `Every unit from ${getTierNamesByIds(tierIds).join(' and ')} already selected.`;
        } else {
            resetAnimation();
            const list = createUnitInputs(filteredUnits, (name, _) => {
                card.innerHTML = '';

                const img = createSelectedUnitImage(name);

                card.appendChild(img);

                unitInput.hidePopover();
                const slugs = getSelectedUnitSlugs();
                saveDeckToUrl(slugs);
                checkSelectedAbilities(slugs);
            });
            list.classList.add(card.id);
            card.classList.add('selection-in-progress');
            unitInput.appendChild(list);
        }

        unitInput.togglePopover();
    });
})

Array.from(abilities).forEach(slot => {
    addHoverToRelatedUnits(slot)
    slot.addEventListener('click', () => {
        const selectedUnits = getSelectedUnitSlugs();
        const available = units
        .filter(unit => selectedUnits.includes(unit.slug))
        .reduce((abs, unit) => {
            if(unit.unitAbility && !abs.includes(unit.unitAbility)) {
                abs.push(unit.unitAbility.toLowerCase())
            }
            return abs;
        }, [])
        abilityInput.innerHTML = ''
        removeInProgressAbility();

        const selected = getSelectedAbilityNames()
        
        Array.from(new Set(available)).sort((a,b) => {
            return selected.indexOf(a) - selected.indexOf(b);
        }).forEach(name => {
            // create and handle selection
            abilityInput.appendChild(createAbilitySelection(name, () => {
                // check if the ability is already populated in slots and remove it
                Array.from(abilities).forEach(selectedAbility => {
                    const img = selectedAbility.querySelector('img')
                    if(img && img.id.includes(name.toLowerCase())) {
                        selectedAbility.innerHTML = ''
                        selectedAbility.classList.remove('filled-slot')
                    }
                })
                slot.innerHTML = ''
                slot.appendChild(createAbilityIcon(name));
                slot.classList.add('filled-slot')
                
                saveAbilitiesToUrl(getSelectedAbilityNames())
                abilityInput.togglePopover(false)
            }))
        })

        slot.classList.add('selection-in-progress')
        abilityInput.style.left = slot.offsetLeft + slot.clientWidth + 'px';
        abilityInput.style.top = slot.offsetTop + 'px'; 
        abilityInput.togglePopover();
    })
})

document.getElementById('share-button').addEventListener('click', () => {
    copyDeck();
});
document.getElementById('reset-button').addEventListener('click', () => {
    resetDeck();
    resetAnimation();
    resetAbilities();
});

unitInput.addEventListener('toggle', (event) => {
    if (event.newState === 'closed') {
        unitInput.innerHTML = '';
        removeInProgress();
    }
});

abilityInput.addEventListener('toggle', (event) => {
    if (event.newState === 'closed') {
        removeInProgressAbility();
    }
})

document.getElementById('animate-button').addEventListener('click', () => {
    const row1 = document.createElement('div');
    row1.className = 'row';
    const row2 = document.createElement('div');
    row2.className = 'row';
    getSelectedUnitSlugs()
        .map((slug) => {
            return createVideo(slug);
        })
        .forEach((video, index) => {
            index > 3 ? row2.appendChild(video) : row1.appendChild(video);
        });
    const el = document.getElementById('video');
    el.innerHTML = '';
    el.appendChild(row1);
    el.appendChild(row2);
});

screenshot.addEventListener('click', () => {
    const videoContainer = document.getElementById('video')
    if(videoContainer.hasChildNodes()) {
        const height = 2160; //px
        const width = 3840; //px
        const crop = 2;
        const scaleDown = 8;
        capture(width, height, videoContainer.querySelectorAll('video'), scaleDown, crop);
    }
    else {
        const height = 256; //px
        const width = 256; //px
        const crop = 1;
        const scaleDown = 1;
        capture(width, height, document.getElementsByClassName('card-img'), scaleDown, crop)
    }
});

downloadBtn.addEventListener('click', () => {
    const fileString = localStorage.getItem('gameconfig-localuser')
    var blob = new Blob([fileString]);
    var url  = URL.createObjectURL(blob);
    const now = new Date();
    downloadImage(`gameconfig-localuser-${now.toLocaleDateString()}-${now.toLocaleTimeString()}.toml`, url)
    URL.revokeObjectURL(url);
})

loadBtn.addEventListener('click', () => {
    deckSelection.innerHTML = '';

    const actions = document.createElement('div')
    actions.className='deck-actions'
    const confirm = document.createElement('button')
    confirm.innerText = 'Load';
    confirm.addEventListener('click', () => {
        if(selectedDeckIndex > -1) {

            const decks = JSON.parse(localStorage.getItem('parsed-decks'));
            
            resetAbilities();
            resetDeck();

            saveAbilitiesToUrl(decks[selectedDeckIndex].abilities)
            saveDeckToUrl(decks[selectedDeckIndex].slugs)

            resetSelectedDeck();

            setupCards();
            setupAbilities();
        }
        deckSelection.togglePopover(false);
    })
    const cancel = document.createElement('button')
    cancel.innerText = 'Cancel';
    cancel.addEventListener('click', () => {
        resetSelectedDeck();
        deckSelection.togglePopover(false);
    })

    actions.appendChild(confirm)
    actions.appendChild(cancel)

    deckSelection.appendChild(createDeckPreviews(JSON.parse(localStorage.getItem('parsed-decks'))))
    deckSelection.appendChild(actions)

    deckSelection.togglePopover();
})

saveBtn.addEventListener('click', () => {
    deckSelection.innerHTML = '';

    const actions = document.createElement('div')
    actions.className='deck-actions'
    const confirm = document.createElement('button')
    confirm.innerText = 'Overwrite';
    confirm.addEventListener('click', () => {
        if(selectedDeckIndex > -1) {
            let deck = getDeckFromURL(window.location.href);
            let initial = JSON.parse(localStorage.getItem('gameconfig-localuser-decks')) 
            if(selectedDeckIndex === 0) {
                deck._name = 'SelectedDeck';
                initial.SelectedDeck = deck;
            }
            else {
                initial.Decks[selectedDeckIndex-1] = deck;
            }
            const initialJSON = JSON.stringify(initial);
            localStorage.setItem('gameconfig-localuser-decks', initialJSON)
            replaceDecks(JSON.stringify(initialJSON))

            const inGameSelected = getSlugsAndAbilities(initial.SelectedDeck)
            const inGameSaved = initial.Decks.map(d => getSlugsAndAbilities(d))
            localStorage.setItem('parsed-decks', JSON.stringify([inGameSelected, ...inGameSaved]))
        }
        deckSelection.togglePopover(false);
    })
    const cancel = document.createElement('button')
    cancel.innerText = 'Cancel';
    cancel.addEventListener('click', () => {
        resetSelectedDeck();
        deckSelection.togglePopover(false);
    })

    actions.appendChild(confirm)
    actions.appendChild(cancel)
    deckSelection.appendChild(createDeckPreviews(JSON.parse(localStorage.getItem('parsed-decks'))))
    deckSelection.appendChild(actions)

    deckSelection.togglePopover();
})

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0]
    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = function (evt) {
    try {
        const decksJSON = parseDeck(evt.target.result);
        const obj = JSON.parse(decksJSON);
        const inGameSelected = getSlugsAndAbilities(obj.SelectedDeck)
        const inGameSaved = obj.Decks.map(d => getSlugsAndAbilities(d))

        const all = [inGameSelected, ...inGameSaved];
        if(all.some(d => !validateAbilities(d.abilities, d.slugs) || !validateDeck(d.slugs))) {
            throw new Error('Imported deck did not pass validation');
        }
        localStorage.clear();
        localStorage.setItem('gameconfig-localuser', evt.target.result)
        localStorage.setItem('gameconfig-localuser-decks', decksJSON)
        localStorage.setItem('parsed-decks', JSON.stringify(all))
    } catch (error) {
        console.error(error)
    }
        
    loadBtn.click();
    }
})

// FUNCTIONS

function resetSelectedDeck() {
    selectedDeckIndex = -1;
    removeDeckPreviewBorder();
}

function createDeckPreviews(decks) {
    const preview = document.createElement('div')

    const handleDeckSelection = (index) => (el) => {
        selectedDeckIndex = index;
        removeDeckPreviewBorder()
        el.currentTarget.classList.add('brighten')
    }

    const row1 = document.createElement('div')
    row1.className = 'row'
    const deckPreview1 = document.createElement('div')
    deckPreview1.addEventListener('click', handleDeckSelection(0))
    deckPreview1.appendChild(createDeckPreview(decks[0], 0))
    deckPreview1.className = 'deck-preview'

    const deckPreview2 = document.createElement('div')
    deckPreview2.addEventListener('click', handleDeckSelection(1))
    deckPreview2.appendChild(createDeckPreview(decks[1], 1))
    deckPreview2.className = 'deck-preview'

    row1.appendChild(deckPreview1)
    row1.appendChild(deckPreview2)

    const row2 = document.createElement('div')
    row2.className = 'row'
    const deckPreview3 = document.createElement('div')
    deckPreview3.addEventListener('click', handleDeckSelection(2))
    deckPreview3.appendChild(createDeckPreview(decks[2], 2))
    deckPreview3.className = 'deck-preview'

    const deckPreview4 = document.createElement('div')
    deckPreview4.addEventListener('click', handleDeckSelection(3))
    deckPreview4.appendChild(createDeckPreview(decks[3], 3))
    deckPreview4.className = 'deck-preview'

    row2.appendChild(deckPreview3)
    row2.appendChild(deckPreview4)

    preview.appendChild(row1)
    preview.appendChild(row2)
    return preview;
}

function prettyStringify(obj) {
    return JSON.stringify(obj, undefined, 2)
}

function createDeckPreview(deck, index) {
    const container = document.createElement('div')
    container.className = `${index}-deck-preview deck-preview-group`
    const row1 = document.createElement('row')
    row1.className = 'row'
    const row2 = document.createElement('row')
    row2.className = 'row'
    for(let i = 0; i < deck.slugs.length; i++) {
        const slug = deck.slugs[i];
        const cardImage = slug ? createImageElement(getImageUrl(slug, 'units'), `${slug}-${index}-deck-review`) : document.createElement('div');
        cardImage.className = slug ? 'select-image' : 'select-image empty'
        if(i < 4) {
            row1.appendChild(cardImage)
        }
        else {
            row2.appendChild(cardImage)
        }
    }
    container.appendChild(row1)
    container.appendChild(row2)
    return container;
}

function parseDeck(fileAsString) {
    const line = fileAsString
            .split('\n')
            .find(line => line && line.startsWith('decks'))
    
    if(line) {
        try {
            return JSON.parse(line.replace(' ', '').replace('decks=', ''))
        } catch (error) {
            console.error(error)
            return ''
        }
    }
    return ''
}

function replaceDecks(deckStr) {
    let fileAsString = localStorage.getItem('gameconfig-localuser')
    let lines = fileAsString.split('\n');
    let lineIndex = lines.findIndex(line => line && line.startsWith('decks'))
    if(lineIndex > -1) {
        lines[lineIndex] = `decks = ${deckStr}`
    }
    else {
        lines.push(`decks = ${deckStr}`)
    }

    localStorage.setItem(
        'gameconfig-localuser', 
        lines.join('\n')
    )
}

function createEmptyDeckObj(name = '') {
    return {
        _name: name,
        _activeAbilities: new Array(4).fill({_id: 0}),
        _units: new Array(8).fill({_id: 0})
    };
}

function createEmptyDeck() {
    const deckObj = {
        SelectedDeck: getDeckFromURL(window.location.href, 'SelectedDeck'),
        Decks: new Array(3).fill(createEmptyDeckObj())
    }
    return deckObj
}

function addEmptyConfig() {
    const empty = createEmptyDeck()

    const fromURL = getSlugsAndAbilities(empty.SelectedDeck)
    const emptyDecks = empty.Decks.map(d => getSlugsAndAbilities(d))
    localStorage.setItem('parsed-decks', JSON.stringify([fromURL, ...emptyDecks]))

    const deckJSON = JSON.stringify(empty);
    localStorage.setItem('gameconfig-localuser-decks', deckJSON)
    localStorage.setItem('gameconfig-localuser', `decks = ${JSON.stringify(deckJSON)}`)
}

function setupStorage() {
    try {
        const decks = JSON.parse(localStorage.getItem('parsed-decks'))
        if(decks.some(d => !validateAbilities(d.abilities, d.slugs) || !validateDeck(d.slugs))) {
            throw new Error('Deck in local storage did not pass validation');
        }
        const configDecks = decks.map((d, index) => getDeckFromURL(createURL(d), index === 0 ? 'SelectedDeck' : ''))
        const full = JSON.stringify({
            SelectedDeck: configDecks[0],
            Decks: configDecks.slice(1)
        });
        localStorage.setItem('gameconfig-localuser-decks',full)
        replaceDecks(full)
    } catch (error) {
        console.error(error)
        addEmptyConfig();
    }
}

function createURL({slugs, abilities}) {
    const url = new URL('https://zaokret.github.io/battle-aces/')
    url.searchParams.set('deck', window.btoa(slugs))
    url.searchParams.set('abs', window.btoa(abilities))
    return url;
}

function getDeckBuilderURL(deck) {
    return createURL(getSlugsAndAbilities(deck));
}

function getSlugsAndAbilities(deck) {
    const abilities = deck._activeAbilities.map(abi => {
        return Object.keys(abilityToId).find((key) => abilityToId[key] === abi?._id) || ''
    });
    
    let midpoint = deck._units.length/2;
    let newArray = new Array(deck._units.length);
    // de-interleaving
    for (let i = 0; i < midpoint; i++) {
        newArray[i] = deck._units[2 * i]._id;
        if((2 * i + 1) < 8) {
            newArray[midpoint + i] = deck._units[2 * i + 1]._id;
        }
    }
    const slugs = newArray.map(id => units.find(unit => unit.unitId === id)?.slug || '')
    return {
        slugs,
        abilities
    }
}

function getDeckFromURL(str, name='') {
    const url = new URL(str)

    let newUnits = new Array(8).fill({ _id: 0 })
    let slugs = [];
    if(url.searchParams.has('deck')) {
        const encoded = url.searchParams.get('deck')
        try {
            const decoded = window.atob(encoded)
            const arr = decoded.split(',')

            if(!validateDeck(arr)) {
                throw new Error('Invalid deck in URL');
            }
            slugs = arr;

            if(arr.length > 8) {
                throw new Error('Deck is of wrong size.')
            }

            const midpoint = 4;
            let newArray = new Array(8).fill('');
            for (let i = 0; i < midpoint; i++) {
                newArray[2 * i] = arr[i];
                newArray[2 * i + 1] = arr[midpoint + i];
            }

            newArray.forEach((slug, index) => {
                newUnits[index] = {_id: units.find(unit => slug && unit.slug.includes(slug))?.unitId || 0}
            })
        } catch (err) {
            console.error(err)
        }
    }

    let newAbilities = new Array(4).fill({ _id: 0 })
    if(url.searchParams.has('abs')) {
        const encoded = url.searchParams.get('abs')
        try {
            const decoded = window.atob(encoded)
            const arr = decoded.split(',')
            
            if(!validateAbilities(arr, slugs)) {
                throw new Error('Invalid abilities');
            }

            arr.forEach((key, index) => {
                newAbilities[index] = { _id: abilityToId[key] || 0 }
            })
        } catch (err) {
            console.error(err)
        }
    }

    

    return {
        _name: name,
        _activeAbilities: newAbilities,
        _units: newUnits
    }
}

function removeDeckPreviewBorder() {
    Array.from(document.querySelectorAll('.deck-preview'))
    .forEach(preview => preview.classList.remove('brighten'))
}

function createDeckButtonHandler(name, callback) {
    deckSelection.innerHTML = '';

    const actions = document.createElement('div')
    actions.className='deck-actions'
    const confirm = document.createElement('button')
    confirm.innerText = name;
    confirm.addEventListener('click', () => {
        if(selectedDeckIndex > -1) {
            callback()
        }
        deckSelection.togglePopover(false);
    })
    const cancel = document.createElement('button')
    cancel.innerText = 'Cancel';
    cancel.addEventListener('click', () => {
        resetSelectedDeck();
        deckSelection.togglePopover(false);
    })

    actions.appendChild(confirm)
    actions.appendChild(cancel)

    deckSelection.appendChild(createDeckPreviews(JSON.parse(localStorage.getItem('parsed-decks'))))
    deckSelection.appendChild(actions)

    deckSelection.togglePopover();
}


function setupAbilities() {
    const abs = readAbilitiesFromUrl();
    if (validateAbilities(abs)) {
        insertAbilitiesIntoSlots(abs);
    } else {
        saveAbilitiesToUrl([]);
    }
}

function insertAbilitiesIntoSlots(abs) {
    if(abs && abs.length > 0) {
        for(let i = 0; i < abs.length; i++) {
            if(abs[i]) {
                abilities[i].appendChild(createAbilityIcon(abs[i]));
                abilities[i].classList.add('filled-slot')
            }
        }
    }
}

function validateAbilities(abs, selectedUnits = getSelectedUnitSlugs()) {
    if(abs.length > 4) {
        return false;
    }
    
    if(abs.length === 0) {
        return true;
    }

    if(abs.every(a => a === '')) {
        return true;
    }

    const filtered = abs.filter(Boolean);
    const set = [...new Set(filtered)];
    if (filtered.length !== set.length) {
        return false;
    }

    const available = units
    .filter(unit => selectedUnits.includes(unit.slug))
    .reduce((abs, unit) => {
        if(unit.unitAbility && !abs.includes(unit.unitAbility)) {
            abs.push(unit.unitAbility.toLowerCase())
        }
        return abs;
    }, [])

    return abs.filter(Boolean).every(abName => available.includes(abName)) 
}

function getSelectedAbilityNames() {
    return Array.from(abilities).map(ab => {
        const img = ab.querySelector('img') 
        return img ? img.id.replace('-ability-icon', '') : ''
    })
}

function checkSelectedAbilities(selectedUnitSlugs) {
        const available = units
        .filter(unit => selectedUnitSlugs.includes(unit.slug))
        .reduce((abs, unit) => {
            if(unit.unitAbility && !abs.includes(unit.unitAbility)) {
                abs.push(unit.unitAbility)
            }
            return abs;
        }, [])
    Array.from(abilities).forEach(selectedAbility => {
        const img = selectedAbility.querySelector('img')
        if(img && available.every(aa => !img.id.includes(aa.toLowerCase()))) {
                selectedAbility.innerHTML = ''
                selectedAbility.classList.remove('filled-slot')
        }
    })
    saveAbilitiesToUrl(getSelectedAbilityNames())
}

function createAbilitySelection(name, handleSelected) {
    const el = document.createElement('div')
    el.classList.add('ability')
    el.classList.add('selection')
    el.appendChild(createAbilityIcon(name))
    el.addEventListener('click', handleSelected)
    el.classList.add('ability-icon-selection')
    addHoverToRelatedUnits(el)
    return el;
}

function createAbilityIcon(name) {
    const url = 
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname + 
    'images/abilities/' +
    name.toLowerCase() +
    '.png'
    const icon = createImageElement(url, `${name.toLowerCase()}-ability-icon`);
    icon.className = 'ability-icon'
    return icon;
}

function resetAnimation() {
    const el = document.getElementById('video');
    el.innerHTML = '';
}

function resetAbilities() {
    for(const ability of abilities) {
        ability.innerHTML = ''
        ability.classList.remove('filled-slot')
    }
    saveAbilitiesToUrl([]);
}

function removeInProgress() {
    Array.from(cards).forEach((card) =>
        card.classList.remove('selection-in-progress')
    );
}

function removeInProgressAbility() {
    Array.from(abilities).forEach(ab => ab.classList.remove('selection-in-progress'))
}

function getBackendUrl() {
    if (window.location.hostname.includes('github')) {
        return 'https://deckbuilder.autos/data';
    }
    return 'http://localhost:3000/data';
}

function fetchUnitsAndTiers() {
    return fetch(getBackendUrl()).then((res) => res.json());
}

function setupCards() {
    let sharedDeck = readDeckFromUrl();
    if (validateDeck(sharedDeck)) {
        insertDeckIntoSlots(sharedDeck);
    } else {
        saveDeckToUrl([]);
    }
}

function addVideoPreviewOnHover(name, el) {
    el.addEventListener('mouseenter', () => {
        createVideo(name.replace(' ', '').toLowerCase());
    });
    el.addEventListener('mouseleave', () => {
        removeVideo();
    });
}

function getSelectedUnitSlugs() {
    return Array.from(cards).map((card) =>
        card.hasChildNodes()
            ? card.children[0].id.replace(' ', '').toLowerCase()
            : ''
    );
}

function addHoverEffect(el) {
    el.addEventListener('mouseenter', () => {
        el.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        el.classList.remove('hover');
    });
}

function addHoverToRelatedAbilities(el) {
    el.addEventListener('mouseenter', () => {
        const slug = el.id
        const unit = units.find(unit => unit.slug === slug)
        if(unit && unit.unitAbility) {
            document.querySelectorAll(`#${unit.unitAbility.toLowerCase()}-ability-icon`).forEach(icon => {
                if(icon) {
                    icon.classList.add('hover');
                }
            })
            
        }
        el.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        el.classList.remove('hover');
        Array.from(document.querySelectorAll(`.ability-icon`)).forEach(el => el.classList.remove('hover'))
    });
}

function addHoverToRelatedUnits(el) {
    el.addEventListener('mouseenter', () => {
        if(['ability-icon-selection', 'filled-slot'].some(className => el.classList.contains(className))) {
            const icon = el.querySelector('.ability-icon')
            const ability = icon.id.replace('-ability-icon', '')
            const selectedUnitSlugs = getSelectedUnitSlugs()
            units.forEach(unit => {
                const index = selectedUnitSlugs.indexOf(unit.slug);
                if(index > -1 && unit.unitAbility?.toLowerCase() === ability) {
                    const el = document.querySelector(`.card-img#${unit.slug}`)
                    if(el) {
                        el.classList.add('hover')
                    }
                }
            })
        }
        el.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        el.classList.remove('hover');
        Array.from(document.querySelectorAll(`.card-img`)).forEach(el => el.classList.remove('hover'))
    });
}

function getUniqTagsFromUnits(unitList) {
    const allTags = unitList.reduce((tags, unit) => {
        tags = tags.concat(parseUnitTags(unit));
        return tags;
    }, []);

    const set = [...new Set(allTags)];

    return set;
}

function createTagFilter(tags, handleChecked) {
    const filter = document.createElement('div');
    filter.className = 'tag-filter';
    const sortedTags = tags.sort();

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.innerText = 'Filters';
    details.appendChild(summary);
    
    const detailInner = document.createElement('div');

    sortedTags.forEach((tag) => {
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'tag-input-wrapper';

        const checkbox = document.createElement('input');
        checkbox.className = 'tag-input';
        checkbox.type = 'checkbox';
        checkbox.id = tag;
        checkbox.value = tag;

        const label = document.createElement('label');
        label.className = 'tag-input-label';
        label.setAttribute('for', tag);
        label.innerText = tag;
        label.style.userSelect = 'none';

        checkbox.addEventListener('input', () => {
            if (checkbox.checked) {
                label.classList.add('checked');
            } else {
                label.classList.remove('checked');
            }
            handleChecked(tag, checkbox.checked);
        });

        inputWrapper.appendChild(checkbox);
        inputWrapper.appendChild(label);

        detailInner.appendChild(inputWrapper);
    });
    details.appendChild(detailInner)
    filter.appendChild(details);
    return filter;
}

function createUnitInput(unitList, callback) {
    return unitList.map((unit) => {
        const div = document.createElement('div');
        div.id = `unit-input-${unit.slug}`;
        const img = createImageElement(
            getImageUrl(unit.name, 'units'),
            unit.id
        );
        img.className = 'select-image';
        img.addEventListener('click', (event) => {
            callback(unit.slug, event);
        });
        addHoverEffect(img);

        const link = document.createElement('a');
        link.className = 'unit-out-link';
        link.href = `https://www.playbattleaces.com/units/${unit.slug}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const text = document.createElement('div');
        text.innerText = unit.name;
        text.className = 'card-name';

        link.appendChild(text);

        div.appendChild(img);
        div.appendChild(link);
        div.appendChild(createUnitStats(unit));
        div.appendChild(createUnitCost(unit));
        div.appendChild(createUnitDescription(unit, minHeight(unitList)));

        // addVideoPreviewOnHover(unit.name, div)
        return div;
    });
}

function createUnitInputs(unitList, callback) {
    const list = document.createElement('div');
    list.className = 'card-list';
    const filter = createTagFilter(
        getUniqTagsFromUnits(unitList),
        (tag, checked) => {
            const checkboxes = Array.from(
                document.getElementsByClassName('tag-input')
            );
            const tags = checkboxes
                .filter((box) => box.checked)
                .map((box) => box.value);
            unitList.forEach((unit) => {
                const unitTags = parseUnitTags(unit);
                const included = tags.every((tag) => {
                    if (tag === 'Anti-Air') {
                        return ['Anti-Air', 'Versatile'].some((t) =>
                            unitTags.some((ut) => t === ut)
                        );
                    }
                    if (tag === 'Anti-Ground') {
                        return ['Anti-Ground', 'Versatile'].some((t) =>
                            unitTags.some((ut) => t === ut)
                        );
                    }
                    return unitTags.some((ut) => tag === ut);
                });
                const el = document.getElementById(`unit-input-${unit.slug}`);
                included
                    ? el.classList.remove('hide')
                    : el.classList.add('hide');
            });
        }
    );
    list.appendChild(filter);
    list.append(...createUnitInput(unitList, callback));
    return list;
}

function minHeight(unitList) {
    const highest = unitList
        .map((unit) => parseUnitTags(unit).length)
        .sort((a, b) => b - a)[0];
    return highest * 30;
}

function parseUnitTags(unit) {
    return unit.unitTag
        .replace(' Unit', '')
        .replace(' Damage', '')
        .replace(' Defense', '-Defense')
        .replace(' Range', '-Range')
        .replace('\n', '')
        .split(' ')
        .concat(unit.unitAbility ? unit.unitAbility : []);
}

function createUnitDescription(unit, minHeight) {
    const tags = parseUnitTags(unit);
    const desc = document.createElement('div');
    desc.className = 'tag-list';
    desc.style.minHeight = minHeight + 'px';
    tags.forEach((tag) => {
        const p = document.createElement('p');
        p.innerText = tag;
        p.className = 'tag';
        desc.appendChild(p);
    });

    return desc;
}

function createUnitCost(unit) {
    const costList = document.createElement('div');
    costList.className = 'cost-list';

    ['matter', 'energy', 'bandwidth'].forEach((type) => {
        const cost = document.createElement('div');
        cost.classList.add('cost-type');
        cost.classList.add(`cost-type-${type}`);

        const img = createImageElement(
            getImageUrl(type, 'resources'),
            unit.name + `-${type}`
        );
        img.className = 'cost-type-img';

        const num = document.createElement('div');
        num.className = 'cost-type-num';

        num.innerText = unit[`cost${capitalize(type)}`];

        cost.appendChild(img);
        cost.appendChild(num);

        costList.appendChild(cost);
    });
    return costList;
}

function createUnitStats(unit) {
    const statList = document.createElement('div');
    statList.className = 'stat-list';

    statList.appendChild(createStat(unit, 'health'));
    statList.appendChild(createStat(unit, 'damage'));
    statList.appendChild(createStat(unit, 'speed'));
    statList.appendChild(createStat(unit, 'range'));
    return statList;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createStat(unit, statName) {
    const statContainer = document.createElement('div');
    statContainer.className = 'stat-container';

    const icon = createImageElement(
        getImageUrl(statName, 'stats'),
        unit.name + `-${statName}`
    );
    icon.className = 'stat-icon';

    statContainer.appendChild(icon);
    statContainer.appendChild(
        createStatNumber(unit['stat' + capitalize(statName)])
    );
    return statContainer;
}

function createStatNumber(stat) {
    const statNum = document.createElement('div');
    statNum.className = 'stat-number';

    for (let index = 0; index < 5; index++) {
        const number = document.createElement('div');
        number.className =
            stat > index ? 'stat-number-full' : 'stat-number-empty';
        statNum.appendChild(number);
    }
    return statNum;
}

function getUnitsByTier(ids) {
    return units.filter((unit) => ids.some((id) => id === unit.techTierId));
}

function getTierNamesByIds(ids) {
    return tiers
        .filter((tier) => ids.some((id) => tier.techTierId === id))
        .map((tier) => tier.name);
}

function saveAbilitiesToUrl(ids) {
    const newUrl = new URL(window.location)
    newUrl.searchParams.set('abs', window.btoa(ids.join(',')))
    window.history.pushState({ path: newUrl.href }, '', newUrl.href);
}

function readAbilitiesFromUrl() {
    let params = new URL(window.location).searchParams;
    let codedDeck = params.get('abs');
    if (!codedDeck) {
        return [];
    }
    let decodedDeckString = '';
    try {
        decodedDeckString = window.atob(codedDeck);
    } catch (error) {
        console.error(error)
        saveAbilitiesToUrl([])
    }
    
    const arr = decodedDeckString
        .split(',')
        .map((s) => s.replace('\n', '').trim());

    return arr;
}

function saveDeckToUrl(ids) {
    const newUrl = new URL(window.location)
    newUrl.searchParams.set('deck', window.btoa(ids.join(',')))
    window.history.pushState({ path: newUrl.href }, '', newUrl.href);
}

function readDeckFromUrl() {
    let params = new URL(window.location).searchParams;
    let codedDeck = params.get('deck');
    if (!codedDeck) {
        return [];
    }

    let decodedDeckString = ''
    try {
        decodedDeckString = window.atob(codedDeck);
    } catch (error) {
        console.error(error)
        saveDeckToUrl([])
    }

    const arr = decodedDeckString
        .split(',')
        .map((s) => s.replace('\n', '').trim());

    return arr;
}

function validateDeck(names) {
    if(names.every(n => n === '')) {
        return true;
    }
    // check for duplicates
    const filtered = names.filter(Boolean);
    const set = [...new Set(filtered)];
    if (filtered.length !== set.length) {
        return false;
    }

    // allowed tiers
    const tiers = [
        [0], [1], [3], [3, 1],
        [0], [2], [4], [4, 2]
    ];

    const deck = names.map((name) => units.find((unit) => unit.slug === name));
    return tiers.every((tier, index) => {
        return !deck[index] || tier.includes(deck[index].techTierId);
    });
}

function insertDeckIntoSlots(deck) {
    if (deck && deck.length > 0) {
        for (let index = 0; index < cards.length; index++) {
            if (deck[index]) {
                const name = deck[index].replace(' ', '').toLowerCase();
                cards[index].appendChild(createSelectedUnitImage(name));
            }
        }
    }
}

function createSelectedUnitImage(name) {
    const cardImage = createImageElement(getImageUrl(name, 'units'), name);
    cardImage.className = 'card-img';
    addHoverToRelatedAbilities(cardImage);

    const unit = units.find((unit) => unit.slug === name);

    cardImage.addEventListener('mouseenter', function (event) {
        const existing = document.getElementById('selected-unit-preview');
        if (existing || !unit) {
            return;
        }
        const preview = createUnitInput([unit], () => {})[0];
        preview.id = 'selected-unit-preview';

        const main = document.querySelector('main');
        main.appendChild(preview);
    });

    cardImage.addEventListener('mouseleave', function () {
        const preview = document.getElementById('selected-unit-preview');
        if (preview) preview.remove();
    });

    return cardImage;
}

function resetDeck() {
    for (const card of cards) {
        card.innerHTML = '';
    }
    saveDeckToUrl([]);
}

function resetAbilities() {
    for(const ability of abilities) {
        ability.innerHTML = ''
        ability.classList.remove('filled-slot')
    }
    saveAbilitiesToUrl([]);
}

function copyDeck() {
    navigator.clipboard.writeText(window.location.href);
}

function getImageUrl(name, dir) {
    const root = 'https://cdn.playbattleaces.com/images/icons';
    const extByDir = {
        techtiers: 'svg',
        stats: 'png',
        abilities: 'png',
        units: 'png',
        resources: 'svg',
    };
    const slug = name.replace(' ', '').toLowerCase();
    if (extByDir[dir] === 'svg') {
        return `./images/${dir}/${slug}.svg`;
    }

    const url = `${root}/${dir}/${slug}.${extByDir[dir]}`;
    return url;
}

function createImageElement(url, id) {
    const img = document.createElement('img');
    img.src = url;
    img.id = id;
    img.setAttribute('crossOrigin', "anonymous");
    return img;
}

function createVideo(slug) {
    const video = document.createElement('video');
    video.id = `${slug}-video`;
    video.className = 'video'
    // video.setAttribute("autoplay", '')
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('height', '100px');
    video.setAttribute('crossOrigin', "anonymous");
    video.setAttribute('preload', 'metadata');
    video.setAttribute('playsInline', '');
    const source = document.createElement('source');
    source.id = 'video-source';
    source.src = `https://cdn.playbattleaces.com/videos/turnarounds/${slug}.mp4`;
    source.type = 'video/mp4';
    video.appendChild(source);
    const animation = document.createElement('div');
    animation.className = 'animation';
    animation.appendChild(video);

    let isPlaying = false;

    video.addEventListener('click', () => {
        !isPlaying ? video.play() : video.pause();
        isPlaying = !isPlaying;
    });

    return animation;
}

function removeVideo() {
    const video = document.getElementById('video');
    if (video) {
        video.innerHTML = '';
    }
}

function downloadImage(name, image) {
    const downloadLink = document.createElement('a');
    downloadLink.download = name;
    downloadLink.href = image;
    downloadLink.click();
    downloadLink.remove()
}

// get drawing offset for element at index, 
// assuming all elements have same width and height
// and the final shape has xcount of horizontal images
function getDrawingOffset(index, width, height, xcount) {
    const y = Math.floor(index / xcount)
    const x = index % xcount
    return { 
        xOffset: x * width, 
        yOffset: y * height
    }
}

const capture = (width, height, sources, scale, crop) => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const size = width/scale
    const lineWidth = Math.floor(size/50);
    const columns = 4
    const rows = 2
    canvas.width = size * columns;
    canvas.height = size * rows;
    context.strokeStyle = 'white';
    context.lineWidth = lineWidth;
    const selectedUnits = getSelectedUnitSlugs();
    const fileName = selectedUnits.map(slug => 
        slug ? 
            units.find(unit => unit.slug === slug).name : 
            'Empty'
    )

    fillMissing(Array.from(sources)).forEach((source, index) => {
        const {xOffset, yOffset} = getDrawingOffset(index, size, size, columns, rows)
        if(source) {
            context.drawImage(
                source,
                0,       0,       width/crop, height,
                xOffset, yOffset, size,    size
            );
        }
        else {
            context.fillStyle = 'gray';
            context.fillRect(xOffset, yOffset, size, size);
        }
        // draw border
        context.rect(xOffset, yOffset, size, size);
        context.stroke();
    });

    downloadImage(fileName, canvas.toDataURL());
};

function fillMissing(elements) {
    if(elements.length < 8) {
        const selected = getSelectedUnitSlugs();
        const filled = new Array(8).fill(undefined);
        
        elements.forEach(element => {
            const index = selected.findIndex(slug => slug && element.id.includes(slug));
            filled[index] = element;   
        })
        //todo: fill with createImageElement ( tier svg )
        return filled;
    }
    return elements;
}

