import puppeteer from "puppeteer";

export const getSmFirstSample = async (req, res) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

    const page = await browser.newPage();
    const { pokemon } = req.params;

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
            page.$eval("#PokemonPage-HeaderGrouper h1", (el) => el.textContent.trim()),
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
                evs.forEach((ev) => {
                    const evText = ev.textContent.trim();
                    evsList.push(evText);
                });
                set.push({ item, ability, nature, evsList });
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

