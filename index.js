var units = [];
var tiers = [];

fetchUnitsAndTiers()
    .then((data) => {
        units = data.units;
        tiers = data.tiers;
    })
    .then(() => {
        setupCards();
        setupAbilities();
    });

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

function validateAbilities(abs) {
    if(abs.length > 4) {
        return false;
    }
    
    // check for duplicates
    const filtered = abs.filter(Boolean);
    const set = [...new Set(filtered)];
    if (filtered.length !== set.length) {
        return false;
    }

    const selectedUnits = getSelectedUnitSlugs();
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

const unitInput = document.getElementById('select-unit');
const cards = document.getElementsByClassName('card');

const abilityInput = document.getElementById('select-ability')
const abilities = document.getElementsByClassName('ability slot');

function getSelectedAbilityNames() {
    return Array.from(abilities).map(ab => {
        const img = ab.querySelector('img') 
        return img ? img.id.replace('-ability-icon', '') : ''
    })
}

Array.from(abilities).forEach(slot => {
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

document.getElementById('share-button').addEventListener('click', () => {
    copyDeck();
});
document.getElementById('reset-button').addEventListener('click', () => {
    resetDeck();
    resetAnimation();
});

function resetAnimation() {
    const el = document.getElementById('video');
    el.innerHTML = '';
}

function removeInProgress() {
    Array.from(cards).forEach(card => card.classList.remove('selection-in-progress'))
}

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

function removeInProgressAbility() {
    Array.from(abilities).forEach(ab => ab.classList.remove('selection-in-progress'))
}

function getBackendUrl() {
    if(window.location.hostname.includes('github')) {
        return 'https://deckbuilder.autos/data'
    }
    return 'http://localhost:3000/data'
}

getBackendUrl()

function fetchUnitsAndTiers() {
    return fetch(getBackendUrl())
        .then((res) => res.json())
}

function setupCards() {
    for (const card of cards) {
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
    }

    const sharedDeck = readDeckFromUrl();
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

        filter.appendChild(inputWrapper);
    });
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
        .concat(unit.unitAbility ? unit.unitAbility : [])
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
    addHoverEffect(cardImage);

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
    return img;
}

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

function createVideo(slug) {
    const video = document.createElement('video');
    video.id = `${slug}-video`;
    // video.setAttribute("autoplay", '')
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('height', '100px');
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

