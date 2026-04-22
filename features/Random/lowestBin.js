import c from "../../config"
import PogObject from "../../../PogData";
import { chat } from "../../util/utils";

export const binData = new PogObject(
    "PrivateASF-Fabric",
    {
        prices: {},
        lastUpdated: 0
    },
    "data/lowestBin.json"
);

// Ty skytils api <3
const LOWEST_BIN_URL = `https://api.skytils.gg/api/auctions/lowestbins`

export function fetchLowestBins() {
    const now = Date.now();

    if (now - binData.lastUpdated < 60000) {
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

export function getAuctionIdentifier(item) {
    if (!item) return null;

    try {
        const nbtString = item.getNBT().toString();

        const customData = extractCustomData(nbtString);
        if (!customData) return null;
        
        const idMatch = customData.match(/\bid:"([^"]+)"/);
        if (!idMatch) return null;

        const id = idMatch[1];
        
        if (id == "ATTRIBUTE_SHARD") {
            const cleanName = item.getName().removeFormatting();
            let baseName = cleanName.replace(/ Shard$/i, "")

            baseName = baseName.toUpperCase().replace(/\s+/g, "_");
            return `SHARD_${baseName}`;
        }

        else if (id === "UNIQUE_RUNE" || id === "RUNE") {
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
        else if (id === "POTION") {

            const potionMatch = customData.match(/potion:"([^"]+)"/);
            const levelMatch = customData.match(/potion_level:(\d+)/);

            if (!potionMatch || !levelMatch) return id;

            const potionType = potionMatch[1].toUpperCase();
            const potionLevel = levelMatch[1];

            const isEnhanced = /enhanced:1b/.test(customData);
            const isExtended = /extended:1b/.test(customData);
            const isSplash = /splash:1b/.test(customData);

            let identifier = `POTION-${potionType}-${potionLevel}`;

            if (isEnhanced) identifier += "-ENHANCED";
            if (isExtended) identifier += "-EXTENDED";
            if (isSplash) identifier += "-SPLASH";

            return identifier;
        }

        return id;


    } catch (e) {
        chat("&cString parse failed. Check /ct console.");
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
}).setDelay(61).unregister()


const lowestBinRegister = register("itemTooltip", (lore, item) => {
    if (!item) return;

    const identifier = getAuctionIdentifier(item);
    if (!identifier) return;

    const rawPrice = binData.prices[identifier];
    const valuePer = Number(rawPrice);
    if (isNaN(valuePer)) return;

    const stackSize = item.getStackSize();
    const totalPrice = (valuePer * stackSize).toFixed(0);

    let alreadyCorrect = false;
    for (let line of lore) {
        const text = ChatLib.removeFormatting(line.toString());
        if (text.startsWith("Lowest BIN:")) {
            const existing = Number(text.replace(/[^0-9]/g, ""));
            if (existing === totalPrice) {
                alreadyCorrect = true;
            }
            break;
        }
    }

    if (alreadyCorrect) return;

    let newLore = lore.filter(line => {
        const text = ChatLib.removeFormatting(line.toString());
        return !text.startsWith("Lowest BIN:");
    });

    const format = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "§d,§5");

    let priceLine = `§6§lLowest BIN: §r§5${format(totalPrice)}`;

    if (stackSize > 1) {
        priceLine += ` §7(${valuePer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} each)`;
    }

    newLore.push(new TextComponent(priceLine));

    item.setLore(newLore);
}).unregister()

if (c.lowestBinTT) {
    priceFetcher.register()
    lowestBinRegister.register()
    fetchLowestBins()
}
if (c.customAHGui) {
    priceFetcher.register()
    fetchLowestBins()
}

c.registerListener("Show Lowestbin ToolTips", (curr) => {
    if (curr) {
        priceFetcher.register()
        lowestBinRegister.register()
        fetchLowestBins()
    }
    else {
        if (!c.customAHGui) priceFetcher.unregister()
        lowestBinRegister.unregister()
    }
})