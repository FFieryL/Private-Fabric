import { chat, isPlayerInBox, playSound, pressMovementKey, swapToItem } from "../../util/utils";
import c from "../../config"
import dungeonUtils from "../../util/dungeonUtils";
import { registerPacketChat } from "../../util/Events";


const autoSwap = register("clicked", (mouseX, mouseY, button, isButtonDown) => {
    if (button != 1 || isButtonDown || !dungeonUtils.inBoss) return;

    const heldItemName = Player?.getHeldItem()?.getName()?.toLowerCase();
    if (!heldItemName) return;

    if (heldItemName.toLowerCase().includes("death bow")) {
        Client.scheduleTask(1, () => swapToItem(c.deathBowItem))
    }
    else if (heldItemName.toLowerCase().includes("breath") && c.lastBreathSwap && (isPlayerInBox(33, 60, 165, 195, 31, 76) || isPlayerInBox(87, 114, 163, 172, 31, 76))) {
        Client.scheduleTask(1, () => swapToItem("terminator"))
    }
}).unregister()

if (c.deathBowSwap || c.lastBreathSwap) {
    autoSwap.register()
}

c.registerListener("Archer Death Bow Swapper", (curr) => {
    if (curr) autoSwap.register()
    else if (c.lastBreathSwap) autoSwap.unregister()
})

c.registerListener("Archer LB Swapper at Pillars", (curr) => {
    if (curr) autoSwap.register()
    else if (!c.deathBowSwap) autoSwap.unregister()
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