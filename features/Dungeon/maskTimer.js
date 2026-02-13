import c from "../../config"
import { data, drawText, registerOverlay } from "../../managers/guimanager"
import { chat, CommonPingS2CPacket} from "../../util/utils";
import dungeonUtils from "../../util/dungeonUtils";
let inPre4 = false;
let bonzopop;
let phoenixpop;
let spiritpop;
let bonzocd = 180;

registerOverlay("MaskTimer", { text: () => [`&9Bonzo's Mask`,`&5Spirit Mask`,`&6Phoenix`].join("\n"), align: "left", colors: false, w: 70, h: 3 * 9 + 5, setting: () => c.invincibilityDisplay})

const lines = [
    `&9Bonzo's Mask`,
    `&5Spirit Mask`,
    `&6Phoenix`
]

let displayString = ""

c.registerListener("Invincibility Display", (curr) => {
    if (curr) maskTimers.register()
    else maskTimers.unregister()
})


register("chat", (message) => {
    if (!c.invincibilityDisplay) return;
    if (/^Your (?:\S+ )?Bonzo's Mask saved your life!$/.test(message)) {
        bonzopop = bonzocd;
        getBonzoCd();
        handlePop(c.maskText)
    }

    else if (message === "Your Phoenix Pet saved you from certain death!") {
        phoenixpop = 60;
        handlePop(c.phoenixText)
    }

    else if (message === "Second Wind Activated! Your Spirit Mask saved your life!") {
        spiritpop = 30;
        handlePop(c.spiritText)
    }

}).setCriteria("${message}")

register("packetReceived", (packet) => {
    if (!c.invincibilityDisplay || !(packet instanceof CommonPingS2CPacket) || packet.getParameter() == 0) return;
    if (bonzopop) bonzopop = (bonzopop - 0.05)
    if (spiritpop) spiritpop = (spiritpop - 0.05)
    if (phoenixpop) phoenixpop = (phoenixpop - 0.05)
    updateDisplayString();
}).setFilteredClass(CommonPingS2CPacket)

const maskTimers = register("renderOverlay", (ctx) => {

    if (!c.invincibilityDisplay) return maskTimers.unregister();

    if (c.invincibilityDisplayMode == 1 && !dungeonUtils.inBoss) return;
    if (c.invincibilityDisplayMode == 2 && dungeonUtils.currentPhase != 3) return;
    
    drawText(ctx, displayString, data.MaskTimer, false, "MaskTimer")

}).unregister()

dungeonUtils.registerWhenInDungeon(maskTimers)

function handlePop(partyMsg) {
    if (c.maskPhoenixMsg) {
        ChatLib.command(`pc ${partyMsg}`);
    }
}

function updateDisplayString() {
    let text = [];

    // Bonzo
    if (bonzopop > 0) text[0] = (`${lines[0]} &c${Math.ceil(bonzopop.toFixed(0))}s`);
    else if (c.invincibilityDisplayAlways) text[0] = lines[0];
    else text[0] = ` `

    // Spirit
    if (spiritpop > 0) text[1] = (`${lines[1]} &c${Math.ceil(spiritpop).toFixed(0)}s`);
    else if (c.invincibilityDisplayAlways) text[1] = lines[1];
    else text[1] = ` `
    // Phoenix
    if (phoenixpop > 0) text[2] = (`${lines[2]} &c${Math.ceil(phoenixpop).toFixed(0)}s`);
    else if (c.invincibilityDisplayAlways) text[2] = lines[2];
    else text[2] = ` `

    displayString = text.join("\n");
}

function getBonzoCd() {
    const helmet = Player.getInventory()?.getStackInSlot(39);
    if (!helmet || !helmet.getName()?.includes("Bonzo's")) return;

    const lore = helmet.getLore();
    let found = false;
    lore.forEach(line => {
        const cleanLine = ChatLib.removeFormatting(line);
        const match = cleanLine.match(/Cooldown: (\d+)s/);
        
        if (match) {
            bonzocd = parseInt(match[1], 10);
            chat("&aFound CD: &f" + bonzocd + "s");
            found = true;
        }
    });
    if (!found) chat("Cooldown not found");
}

register("worldLoad", () => {
    inPre4 = false;
    bonzopop = null;
    spiritpop = null;
    phoenixpop = null;
})