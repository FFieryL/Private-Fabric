import { chat, isPlayerInBox, playSound, pressMovementKey, swapToItem } from "../../util/utils";
import c from "../../config"
import dungeonUtils from "../../util/dungeonUtils";
import { registerPacketChat } from "../../util/Events";

let timeToSwap = 2;

const autoSwap = register("clicked", (mouseX, mouseY, button, isButtonDown) => {
    if (button != 1 || isButtonDown) return;

    const heldItemName = Player?.getHeldItem()?.getName()?.toLowerCase();
    if (!heldItemName) return;

    if (c.deathBowSwap && heldItemName.includes("death bow")) {
        Client.scheduleTask(1, () => swapToItem(c.deathBowItem))
    }
    else if (c.lastBreathSwap && heldItemName.includes("breath") && (isPlayerInBox(33, 60, 165, 195, 31, 76) || isPlayerInBox(87, 114, 163, 172, 31, 76))) {
        Client.scheduleTask(1, () => swapToItem("terminator"))
    }
    else if (c.sulphurBowSwap && heldItemName.includes("sulphur bow")) {
        Client.scheduleTask(1, () => swapToItem("death bow"))
        Client.scheduleTask(timeToSwap, () => swapToItem(c.deathBowItem))
    }
}).unregister()

register("command", (num) => {
    if (!num) {
        chat("&cUsage: /archswap <number>");
        return;
    }

    num = parseInt(num);
    if (num < 2 || num > 20) {
        chat("&cPlease enter a number between 2 and 20.");
        return;
    }
    timeToSwap = num;
    chat(`Time to swap set to: ${num}`);
}).setName("archswap");

if (c.deathBowSwap || c.lastBreathSwap || c.sulphurBowSwap) {
    autoSwap.register()
}

c.registerListener("Archer Death Bow Swapper", (curr) => {
    if (curr) autoSwap.register()
    else if (!c.lastBreathSwap && !c.sulphurBowSwap) autoSwap.unregister()
})

c.registerListener("Archer Sulphur Bow Swapper???", (curr) => {
    if (curr) autoSwap.register()
    else if (!c.deathBowSwap && !c.lastBreathSwap) autoSwap.unregister()
})

c.registerListener("Archer LB Swapper at Pillars", (curr) => {
    if (curr) autoSwap.register()
    else if (!c.deathBowSwap && !c.sulphurBowSwap) autoSwap.unregister()
})



//Will move later idk

registerPacketChat((message) => {
    if (!dungeonUtils.inBoss) return;
    const match = message.match(/Your Explosive Shot hit (\d+) enem\w* for ([\d,\.]+) damage\./);
    if (!match) return;

    const enemiesHit = parseInt(match[1]); 
    const totalDamage = parseFloat(match[2].replace(/,/g, ''));
    const damagePerEnemy = totalDamage / enemiesHit;

    const damageInt = Math.round(damagePerEnemy)
    const formattedDamage = damageInt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // Output to chat
    setTimeout(() => {
        chat(`§aExplosive Shot did &c${formattedDamage} §aper enemy`);
        Client.showTitle("", "§c" + formattedDamage, 0, 40, 0)
        playSound("note.pling", 0.5, 1)
    }, 10);
})