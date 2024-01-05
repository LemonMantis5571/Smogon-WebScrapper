import puppeteer from "puppeteer";

export const getSmFirstSample = async (req, res) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();
    const { pokemon } = req.params;
    page.setDefaultNavigationTimeout(10 * 60 * 1000);

    try {
        await page.goto(`https://www.smogon.com/dex/sm/pokemon/${pokemon}/`, {
            waitUntil: "networkidle2",
        });

        const [
            PokemonName,
            pokemonType,
            Tier,
            setSummary,
            moveSet
        ] = await Promise.all([
            page.$eval("#PokemonPage-HeaderGrouper h1", (el) => el.textContent.trim()).catch(() => {
              res.status(404).send('Pokemon not found');
            }),
            page.$$eval(".PokemonSummary-types a", (types) => types.map((type) => type.textContent.trim())),
            page.$eval(".FormatList li:first-child a", (el) => el.textContent.trim()),
            page.evaluate(() => {
                const divThatContainsSetSummary = document.querySelector(".MovesetInfo-misc");
                if (!divThatContainsSetSummary) return null;
                const setSummary = divThatContainsSetSummary.getElementsByTagName("table");
                const set = [];
                const evsList = [];
                const item = setSummary[0].querySelector('.ItemLink').querySelector('span').querySelector('span:nth-child(3)')
                    .textContent.trim();
                const ability = setSummary[0].querySelectorAll("td")[1].querySelector(".AbilityLink").querySelector("span")
                    .textContent.trim();
                const nature = setSummary[0].querySelectorAll("td")[2].textContent.trim();
                const evs = setSummary[0].querySelectorAll("td")[3].querySelector('ul').querySelectorAll('li');
                const statMap = {
                    'HP': 0,
                    'Atk': 0,
                    'Def': 0,
                    'SpA': 0,
                    'SpD': 0,
                    'Spe': 0
                };

                evs.forEach((ev) => {
                    const evText = ev.textContent.trim();
                    const [value, stat] = evText.split(' ');
                    statMap[stat] = parseInt(value);
                });

                const formattedEvs = {
                    HP: statMap['HP'],
                    Atk: statMap['Atk'],
                    Def: statMap['Def'],
                    SpA: statMap['SpA'],
                    SpD: statMap['SpD'],
                    Spe: statMap['Spe']
                };

                set.push({ item, ability, nature, evsList: formattedEvs });
                return set;
              }),
            page.evaluate(() => {
                const moves = Array.from(document.querySelectorAll(".MoveList")).slice(0, 4);
                if (!moves.length) return null;

                return moves.map((move) => {
                    const moveType = move.querySelector(".Type").textContent.trim();
                    const spansText = Array.from(move.querySelectorAll("span")).map((span) => span.textContent.trim());

                    return { Move: spansText, moveType };
                });
            }),
        ]);
        
        if(!PokemonName) res.status(404).send('Not found');

        res.json({
            PokemonName,
            Tier,
            setSummary,
            Types: pokemonType,
            moveSet,
        });

    } catch (error) {
        console.log(error);
    }

    await browser.close();
};

