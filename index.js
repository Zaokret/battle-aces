var units = [];
var tiers = [];
var isPopoverOpen = false;

fetchBuildId()
    .then(fetchUnitsAndTiers)
    .then((data) => {
        units = data.units;
        tiers = data.tiers;
    })
    .then(() => {
        setupCards();
    });

const unitInput = document.getElementById('select-unit');

const cards = document.getElementsByClassName('card');

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

unitInput.addEventListener('toggle', (event) => {
    isPopoverOpen = event.newState === 'open';
    if (event.newState === 'closed') {
        unitInput.innerHTML = '';
    }
});

function extractBuildId(text) {
    const regex = /"buildId":\s*"(.*?)"/;
    const match = text.match(regex);
    return match ? match[1] : null;
}

function urlBuilder(buildId) {
    return `https://www.playbattleaces.com/_next/data/${buildId}/en-US/units.json`;
}

function parseAndSortUnits(body) {
    const getTechTierNameById = (id) => {
        const tier = body.pageProps.data.allTechTiers.find(
            (tier) => tier.techTierId === id
        );
        return tier.name;
    };

    return body.pageProps.data.allUnits
        .map((unit) => ({
            id: unit.id,
            costBandwidth: unit.costBandwidth,
            costMatter: unit.costMatter,
            costEnergy: unit.costEnergy,
            name: unit.name,
            statDamage: unit.statDamage,
            statHealth: unit.statHealth,
            statRange: unit.statRange,
            statSpeed: unit.statSpeed,
            techTier: getTechTierNameById(unit.techTier.techTierId),
            techTierId: unit.techTier.techTierId,
            unitAbility: unit.unitAbility && unit.unitAbility.name,
            unitTag: unit.unitTag,
            slug: unit.slug,
        }))
        .sort((a, b) => a.techTierId - b.techTierId);
}

function parseTechTiers(body) {
    return body.pageProps.data.allTechTiers.map((tier) => ({
        name: tier.name,
        slug: tier.slug,
        techTierId: tier.techTierId,
    }));
}

function fetchBuildId() {
    const buildId = localStorage.getItem('buildId');
    if (buildId) {
        return Promise.resolve(buildId);
    }

    return fetch(`https://www.playbattleaces.com/units`)
        .then((res) => res.text())
        .then(extractBuildId)
        .then((id) => {
            localStorage.setItem('buildId', id);
            return id;
        });
}

function fetchUnitsAndTiers(buildId) {
    const units = localStorage.getItem('units');
    const tiers = localStorage.getItem('tiers');
    if (units && units.length > 0 && tiers && tiers.length > 0) {
        return Promise.resolve({
            units: JSON.parse(units),
            tiers: JSON.parse(tiers),
        });
    }

    return fetch(urlBuilder(buildId))
        .then((res) => res.json())
        .then((body) => {
            const tiers = parseTechTiers(body);
            const units = parseAndSortUnits(body);
            localStorage.setItem('units', JSON.stringify(units));
            localStorage.setItem('tiers', JSON.stringify(tiers));
            return { units, tiers };
        });
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
                const list = createUnitInputs(filteredUnits, (name, _) => {
                    card.innerHTML = '';

                    const img = createSelectedUnitImage(name);

                    card.appendChild(img);

                    unitInput.hidePopover();
                    saveDeckToUrl(getSelectedUnitSlugs());
                });
                list.id = card.id;
                unitInput.appendChild(list);
            }

            unitInput.togglePopover();
        });
    }
    insertDeckIntoSlots(readDeckFromUrl());
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

function createUnitInputs(unitList, callback) {
    const list = document.createElement('div');
    list.className = 'card-list';
    for (const unit of unitList) {
        const div = document.createElement('div');

        const img = createImageElement(
            getImageUrl(unit.name, 'units'),
            unit.id
        );
        img.className = 'select-image';
        img.addEventListener('click', (event) => {
            callback(unit.name, event);
        });
        addHoverEffect(img);

        const link = document.createElement('a');
        link.className = 'unit-out-link'
        link.href = `https://www.playbattleaces.com/units/${unit.slug}`;
        link.target="_blank" 
        link.rel="noopener noreferrer"

        const text = document.createElement('div');
        text.innerText = unit.name;
        text.className = 'card-name';

        link.appendChild(text)

        div.appendChild(img);
        div.appendChild(link);
        div.appendChild(createUnitStats(unit));
        div.appendChild(createUnitCost(unit));

        // addVideoPreviewOnHover(unit.name, div)

        list.appendChild(div);
    }
    return list;
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

function saveDeckToUrl(ids) {
    const newUrl =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        `?deck=${window.btoa(ids.join(','))}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
}

function readDeckFromUrl() {
    let params = new URL(window.location).searchParams;
    let codedDeck = params.get('deck');
    if (!codedDeck) {
        return [];
    }
    const decodedDeckString = window.atob(codedDeck);
    return decodedDeckString.split(',');
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
        !isPlaying ? video.play(): video.pause()
        isPlaying = !isPlaying;
        
    });

    // video.addEventListener('mouseenter', () => {
    //     video.play()
    // });

    // video.addEventListener('mouseleave', () => {
    //     video.pause()
    // });

    return animation;
}

function removeVideo() {
    const video = document.getElementById('video');
    if (video) {
        video.innerHTML = '';
    }
}

function addAnimateButton(callback) {
    const btn = document.createElement('button');
    btn.id = 'animate-button';
    btn.type = 'button';
    btn.innerText = 'Animate';

    btn.addEventListener('click', () => {
        callback();
    });
}
