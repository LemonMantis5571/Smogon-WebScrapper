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
        const PokemonName = await page.evaluate(() => {
            const divthatcontainsName = document.querySelectorAll("#PokemonPage-HeaderGrouper");
            const name = divthatcontainsName[0].querySelector("h1").textContent.trim();
            return name;
        });

        const pokemonType = await page.evaluate(() => {
            const divthatcontainsType = document.querySelectorAll(".PokemonSummary-types");
            const type = divthatcontainsType[0].querySelectorAll("a");
            const typeArray = [];
            type.forEach((type) => {
                typeArray.push(type.textContent.trim());
            });
            return typeArray;
        });


        const Tier = await page.evaluate(() => {
            const divThatContainsTier = document.querySelectorAll(".FormatList");
            const tierli = divThatContainsTier[0].querySelectorAll("li");
            const tier = tierli[0].querySelector("a").textContent.trim();
            return tier;
        });

        const setSummary = await page.evaluate(() => {
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
        });

        const moveSet = await page.evaluate(() => {
            const moves = document.querySelectorAll(".MoveList");
            if (!moves) return null;
            const moveSet = [];
            firstMovePool = Array.from(moves).slice(0, 4);
            firstMovePool.forEach((move) => {
                const spans = move.querySelectorAll("span");
                const moveType = move.querySelector(".Type").textContent.trim(); 
                const spansText = Array.from(spans).slice(0, 1).map((span) => span.textContent.trim()); 

                moveSet.push({ Move: spansText, moveType }); 
            });

            return moveSet;
        });

        res.json({
            PokemonName,
            Tier: Tier,
            setSummary,
            Types: pokemonType,
            moveSet,
        });

    } catch (error) {
        console.log(error);
    }

    await browser.close();
  };


