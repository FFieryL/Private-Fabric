import c from "../../config"
import { data, drawText, OverlayEditor, registerOverlay } from "../../managers/guimanager";
import { chat, getTablist } from "../../util/utils";

const summonRegex = /§r§aYou summoned your §r§([0-9a-fk-or])((?:[^§]|§r§[0-9a-fk-or] ✦)+)§r§a!/;
const despawnmatch = /§r§aYou despawned your §r§([0-9a-fk-or])((?:[^§]|§r§[0-9a-fk-or] ✦)+)§r§a!/;
const autopetRegex = /§r§cAutopet §eequipped your §7\[Lvl (\d+)\] §(.)(.+?)§e! §a§lVIEW RULE/;
const levelUpRegex = /§r§aYour §r§([0-9a-fk-or])([^§]+) §r§aleveled up to level §r§9(\d+)§r§a!/;
const tabpet = /§r §r§7\[Lvl (\d+)\](?: §r§8\[.*?\])? §r§(.)(.+?)§r/
let currentPet = null
registerOverlay("CurrentPetGui", { text: () => "No Pet / Unknown", align: "left", colors: false, setting: () => c.CurrentPetGui})


const overlayTrig = register("renderOverlay", (cfx) => {
    if(OverlayEditor.isOpen()) return;
    displayText = (currentPet && currentPet.name) ? (currentPet.level != null ? `&7[Lvl ${currentPet.level}] ${currentPet.name}` : currentPet.name) : "No Pet / Unknown";
    drawText(cfx, displayText, data.CurrentPetGui, false, "CurrentPetGui")
}).unregister()

const chatTrig = register("chat", (event) => {
    const message = event.message.getFormattedText();
    
    let match;
    match = message.match(summonRegex)
    if (match) {
        const rarity = match[1];
        const pet = match[2];
        currentPet = {
            name: `&${rarity}${pet}`,
            level: null,
        };
        if(c.CancelPetChats) {
            chat(`&7Summoned &${rarity}${pet}`)
            cancel(event)
        }
        return;
    }

    match = message.match(autopetRegex)
    if (match) {
        const level = match[1];
        const rarity = match[2];
        const pet = match[3]
        currentPet = {
            name: `&${rarity}${pet}`,
            level: level,
        };
        if(c.CancelPetChats) {
            chat(`&5AutoPet &7[Lvl ${level}] &${rarity}${pet}`)
            cancel(event)
        }
        return;
    }

    match = message.match(levelUpRegex)
    if (match) {
        const rarity = match[1];
        const pet = match[2];
        const level = parseInt(match[3])
        if (currentPet?.name == `&${rarity}${pet}`) currentPet.level = level;
        if(c.CancelPetChats) {
            chat(`&${rarity}${pet} &5leveled up! &d${level - 1}&5->&d${level}`)
            cancel(event)
        }
        return;
    }

    match = message.match(despawnmatch)
    if (match) {
        const rarity = match[1];
        const pet = match[2];
        currentPet = {
            name: null,
            level: null,
        };
        if(c.CancelPetChats) {
            chat(`&7Despawned &${rarity}${pet}`)
            cancel(event)
        }
    }

}).unregister()


const worldLoadTrig = register("worldLoad", () => {
    if (Server.getIP() == "localhost" || !Server.getIP().includes("hypixel")) return;

    const checker = register("step", () => {
        if (!World.isLoaded()) return;

        const names = getTablist(true)
        if (!names || names.length == 0) return;

        const petIndex = names.findIndex(line => line.includes("Pet:"))
        if (petIndex == -1 || petIndex + 1 >= names.length) return checker.unregister();

        const match = names[petIndex + 1].match(tabpet)
        if (!match) return checker.unregister();

        const [, level, rarity, pet] = match;

        currentPet = {
            name: `&${rarity}${pet}`,
            level: level,
        };

        checker.unregister();
    }).setDelay(1)
})

if (c.CurrentPetGui || c.CancelPetChats) {
    chatTrig.register();
    if(c.CurrentPetGui) {
        worldLoadTrig.register()
        overlayTrig.register()
        chatTrig.register()
    }
}

c.registerListener("Current pet display", (curr) => {
    if (curr) {
        worldLoadTrig.register()
        overlayTrig.register()
        chatTrig.register()
    } else {
        worldLoadTrig.unregister()
        overlayTrig.unregister()

        if (!c.CancelPetChats) {
            chatTrig.unregister()
        }
    }
})

c.registerListener("Custom pet messages in chat", (curr) => {
    if (curr || c.CurrentPetGui) chatTrig.register();
    else chatTrig.unregister();
})