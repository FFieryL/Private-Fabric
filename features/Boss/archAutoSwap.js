import { chat, isPlayerInBox, playSound } from "../../util/utils";
import c from "../../config"


let swapping = false;

const autoSwap = register("clicked", (mouseX, mouseY, button, isButtonDown) => {
    if (button != 1 || isButtonDown) return;

    const heldItemName = Player?.getHeldItem()?.getName()?.toLowerCase();
    if (!heldItemName) return;

    if (heldItemName.toLowerCase().includes("death")) {
        Client.scheduleTask(1, () => Swapper(c.autoSwapItem))
    }
    else if (heldItemName.toLowerCase().includes("breath") && c.lastBreathSwap && (isPlayerInBox(33, 60, 165, 195, 31, 76) || isPlayerInBox(87, 114, 163, 172, 31, 76))) {
        Client.scheduleTask(1, () => Swapper("terminator"))
    }
}).unregister()

function Swapper(item) {
    if (!item) return chat("no item set")
    let idx = Player?.getInventory()?.getItems()?.slice(0, 9).findIndex(i => i?.getName()?.toLowerCase()?.includes(item.toLowerCase()))

    if (swapping) return;
    
    if (idx < 0) return;
    if (idx > -1 && idx < 8) {
        swapping = true;
        Player.setHeldItemIndex(idx);
        swapping = false;
    }

}

if (c.autoSwap) {
    autoSwap.register()
}

c.registerListener("Archer Death Bow Swapper", (curr) => {
    if (curr) autoSwap.register()
    else autoSwap.unregister()
})



//Will move later idk

import dungeonUtils from "../../util/dungeonUtils";
import { registerPacketChat } from "../../util/Events";

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