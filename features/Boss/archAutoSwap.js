import { chat, isPlayerInBox, playSound, pressMovementKey, swapToItem, CloseScreenS2CPacket, ClickSlotC2SPacket, CloseHandledScreenC2SPacket, ScreenHandlerSlotUpdateS2CPacket } from "../../util/utils";
import c from "../../config"
import dungeonUtils from "../../util/dungeonUtils";
import { registerPacketChat } from "../../util/Events";
let timeToSwap = 0;

// const autoSwap = register("clicked", (mouseX, mouseY, button, isButtonDown) => {
//     if (button != 1 || isButtonDown) return;

//     const heldItemName = Player?.getHeldItem()?.getName()?.toLowerCase();
//     if (!heldItemName) return;

//     if (c.deathBowSwap && heldItemName.includes("death bow")) {
//         Client.scheduleTask(1, () => swapToItem(c.deathBowItem))
//     }
//     else if (c.lastBreathSwap && heldItemName.includes("breath") && (isPlayerInBox(33, 60, 165, 195, 31, 76) || isPlayerInBox(87, 114, 163, 172, 31, 76))) {
//         Client.scheduleTask(1, () => swapToItem("terminator"))
//     }
//     else if (c.sulphurBowSwap && heldItemName.includes("sulphur bow")) {

//         Client.scheduleTask(0, () => {
//             setTimeout(() => {
//                 swapToItem("death bow")
//                 //ChatLib.command("wd 2")
//             }, 1)
//         })
//         Client.scheduleTask(1 + timeToSwap, () => swapToItem(c.deathBowItem))
//     }
// }).unregister()

const autoSwap = register("clicked", (mouseX, mouseY, button, isButtonDown) => {
    if (button != 1 || isButtonDown || !dungeonUtils.inBoss) return;

    const heldItemName = Player?.getHeldItem()?.getName()?.toLowerCase();
    if (!heldItemName) return;

    if (c.fullBowCharge && Player.getPlayer().getItemUseTime() < 20) return;

    if (c.deathBowSwap && heldItemName.includes("death bow")) {
        Client.scheduleTask(1, () => swapToItem(c.deathBowItem))
    }
    else if (c.lastBreathSwap && heldItemName.includes("breath") && (isPlayerInBox(33, 60, 165, 195, 31, 76) || isPlayerInBox(87, 114, 163, 172, 31, 76))) {
        Client.scheduleTask(1, () => swapToItem("terminator"))
    }
    else if (c.sulphurBowSwap && heldItemName.includes("sulphur bow")) {
        pressMovementKey("forwardKey", false); // why is there a ChatC flag in grim for sprinting while using a command.....
        Client.scheduleTask(0, () => {
            setTimeout(() => {
                swapToItem("death bow")
                if (c.autoWDSlot && c.autoWDSwap) {
                    const slot = parseInt(c.autoWDSlot);
                    const wardrobePage = Math.floor((slot - 1) / 9) + 1;
                    ChatLib.command("wd " + wardrobePage)
                    autoWDListener.register()
                    tries = 1;
                    ticks = 0;
                    tickSafety.register()
                }
            }, 1)
        })
        Client.scheduleTask(1 + timeToSwap, () => {
            swapToItem(c.deathBowItem)
        })
    }
}).unregister()

let tries = 0;
let ticks = 0

const autoWDListener = register('packetReceived', (p, e) => {
    if (!c.autoWDSwap || !c.autoWDSlot || !dungeonUtils.inBoss) return autoWDListener.unregister();
    const slot = p.getSlot()
    const itemStack = p.getStack()
    const windowId = p.getSyncId()
    if (!windowId || !slot) return;
    if (!itemStack || itemStack.toString().includes("minecraft:air")) return;
    if (slot > 45) return;
    const ctItem = new Item(itemStack)
    const itemName = ctItem?.getName().removeFormatting().toLowerCase()
    if (tries < 0) return autoWDListener.unregister();
    if (itemName.includes("slot " + c.autoWDSlot + ":")) {
        Client.scheduleTask(0, () => {
            if (Player.getContainer() && Player.getContainer().getName().toString().removeFormatting().includes("Wardrobe")) Player.getContainer().click(slot, false, "LEFT")
        })
        Client.scheduleTask(2, () => {
            if (Player.getContainer() && Player.getContainer().getName().toString().removeFormatting().includes("Wardrobe")) {
                const inv = Player.getContainer()
                const item = inv.getStackInSlot(49);
                if (!item) return;

                const name = item.getName().removeFormatting();
                if (name == "Close") {
                    inv.drop(49, false);
                }
            }
        })
        autoWDListener.unregister();
        // if (itemName.includes("ready")) {
        //     Client.scheduleTask(0, () => {
        //         if (Player.getContainer() && Player.getContainer().getName().toString().removeFormatting().includes("Wardrobe")) Player.getContainer().click(slot, false, "LEFT")
        //     })
        //     Client.scheduleTask(2, () => {
        //         if (Player.getContainer() && Player.getContainer().getName().toString().removeFormatting().includes("Wardrobe")) {
        //             const inv = Player.getContainer()
        //             const item = inv.getStackInSlot(49);
        //             if (!item) return;

        //             const name = item.getName().removeFormatting();
        //             if (name == "Close") {
        //                 inv.drop(49, false);
        //             }
        //         }
        //     })
        //     autoWDListener.unregister();
        // }
        // else if (itemName.includes("equipped")) autoWDListener.unregister();
        // else {
        //     tries--
        // }
    }
}).setFilteredClass(ScreenHandlerSlotUpdateS2CPacket).unregister()

const tickSafety = register("tick", () => {
    ticks++
    if (ticks > 100) {
        autoWDListener.unregister();
        tickSafety.unregister();
    }
}).unregister()

register('packetSent', () => {
    autoWDListener.unregister()
}).setFilteredClass(CloseHandledScreenC2SPacket)

register('packetReceived', () => {
    autoWDListener.unregister()
}).setFilteredClass(CloseScreenS2CPacket)

register("worldLoad", () => {
    autoWDListener.unregister()
})




register("command", (num) => {
    // if (!num) {
    //     chat("&cUsage: /archswap <number>");
    //     return;
    // }

    // num = parseInt(num);
    // if (num < 0 || num > 20) {
    //     chat("&cPlease enter a number between 0 and 20.");
    //     return;
    // }
    // timeToSwap = num;
    // chat(`Time to swap set to: ${num}`);
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