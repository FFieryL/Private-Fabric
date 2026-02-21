import c from "../../config"
import PogObject from "../../../PogData";
import { chat } from "../../util/utils";

const binData = new PogObject(
    "PrivateASF-Fabric",
    {
        prices: {},
        lastUpdated: 0
    },
    "data/lowestBin.json"
);
// Ty skytils api <3
const LOWEST_BIN_URL = `https://api.skytils.gg/api/auctions/lowestbins`

function fetchLowestBins() {
    const now = Date.now();

    if (now - binData.lastUpdated < 60000 && Object.keys(binData.prices).length > 0) {
        return;
    }

    new Thread(() => {
        try {
            const response = FileLib.getUrlContent(LOWEST_BIN_URL);
            const parsed = JSON.parse(response);

            binData.prices = parsed;
            binData.lastUpdated = Date.now();
            binData.save();

        } catch (e) {
            chat("&cFailed to fetch lowest bin prices.");
            console.error(e);
        }
    }).start();
}

function getAuctionIdentifier(item) {
    if (!item) return null;
    try {
        const nbtString = item.getNBT().toString();

        const customData = extractCustomData(nbtString);
        if (!customData) return null;

        const idMatch = customData.match(/\bid:"([^"]+)"/);
        if (!idMatch) return null;

        const id = idMatch[1];
        
        if (id === "UNIQUE_RUNE" || id === "RUNE") {
            const runeMatch = customData.match(/runes:\{([A-Z_]+):(\d+)\}/);

            if (runeMatch) {
                const runeName = runeMatch[1];
                const runeLevel = runeMatch[2];
                return `RUNE-${runeName}-${runeLevel}`;
            }
        }
        else if (id === "ENCHANTED_BOOK") {
            const enchantMatch = customData.match(/enchantments:\{([^}]+)\}/);
            if (enchantMatch) {
                const enchants = enchantMatch[1]
                    .split(",")
                    .map(e => {
                        const [name, level] = e.split(":");
                        return `${name.toUpperCase()}-${level}`;
                    })
                    .join("-");
                return `ENCHANTED_BOOK-${enchants}`;
            }
        }

        else if (id === "PET") {

            const petMatch = customData.match(/petInfo:'(\{.*?\})'/);

            if (petMatch) {
                try {
                    const petJson = JSON.parse(petMatch[1]);
                    return `PET-${petJson.type}-${petJson.tier}`;
                } catch (e) {
                    console.error("Failed to parse petInfo JSON:", e);
                    return id;
                }
            }
        }
        

        return id;


    } catch (e) {
        chat("&c[ASF Error] String parse failed. Check /ct console.");
        console.error(e);
        return null;
    }
}

function extractCustomData(nbtString) {
    const startKey = "minecraft:custom_data=>{";
    const startIndex = nbtString.indexOf(startKey);
    if (startIndex === -1) return null;

    let i = startIndex + startKey.length;
    let depth = 1;
    let result = "";

    while (i < nbtString.length && depth > 0) {
        const char = nbtString[i];

        if (char === "{") depth++;
        if (char === "}") depth--;

        if (depth > 0) result += char;
        i++;
    }

    return result;
}

const priceFetcher = register("step", () => {
    fetchLowestBins();
}).setDelay(60).unregister()

const lowestBinRegister = register("itemTooltip", (lore, item) => {
    if (!item) return;

    const identifier = getAuctionIdentifier(item);
    if (!identifier) return;

    const rawPrice = binData.prices[identifier];
    const price = Number(rawPrice);
    if (isNaN(price)) return;

    let oldPrice = null;


    for (let line of lore) {
        const text = ChatLib.removeFormatting(line.toString());
        const match = text.match(/^Lowest BIN:\s*([\d,]+)/);
        if (match) {
            oldPrice = Number(match[1].replace(/,/g, ""));
            break;
        }
    }


    if (oldPrice === price) return;


    let newLore = [];

    for (let line of lore) {
        const text = ChatLib.removeFormatting(line.toString()).trim();

        if (text.includes("Lowest BIN:")) continue;
        if (text.includes("minecraft:")) continue;
        if (/^\d+ component(\(s\))?$/i.test(text)) continue;

        newLore.push(line);
    }


    newLore.push(new TextComponent(`§6§lLowest BIN: §r§5${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "§d,§5")}`));

    item.setLore(newLore);
}).unregister()

if (c.lowestBinTT) {
    priceFetcher.register()
    lowestBinRegister.register()
}

c.registerListener("Show Lowestbin ToolTips", (curr) => {
    if (curr) {
        priceFetcher.register()
        lowestBinRegister.register()
    }
    else {
        priceFetcher.unregister()
        lowestBinRegister.unregister()
    }
})