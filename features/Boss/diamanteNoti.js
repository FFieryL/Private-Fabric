import { bloodStartMessages, playSound } from "../../util/utils"
import { registerPacketChat } from "../../util/Events";
import c from "../../config"
import dungeonUtils from "../../util/dungeonUtils";
const EntityGiantZombie = Java.type("net.minecraft.entity.mob.GiantEntity")

let alerted = false
let scheduled = false

const messageTrig = registerPacketChat((message) => {
    if (message == "[BOSS] Maxor: WELL! WELL! WELL! LOOK WHO'S HERE!") return diamanteChecker.unregister()

    else if (message == "[BOSS] Necron: All this, for nothing...") reloadState()
    
    else if (bloodStartMessages.includes(message)) {
        alerted = false
        scheduled = false
        diamanteChecker.register()
    }
}).unregister()

const worldTrig = register("worldLoad", () => {
    reloadState()
}).unregister()

function reloadState() {
    alerted = false
    scheduled = false
    diamanteChecker.unregister()
    alert.unregister()
}

const diamanteChecker = register("tick", () => {
    if (c.DNMageOnly && dungeonUtils.getPlayerClass(Player.getName()) != "Mage") return diamanteChecker.unregister();
    const giant = World.getAllEntitiesOfType(EntityGiantZombie).find(e => {

        for (let slot = 2; slot <= 5; slot++) {
            const item = e.getStackInSlot(slot)
            if (!item) continue
            const itemName = item.getName()?.toString()
            if (itemName && itemName.toLowerCase().includes("diamond")) return true
        }
        return false
    })

    if (!giant) {
        if (alerted) diamanteChecker.unregister()
        return;
    }

    if (!alerted) {
        alert.register()
        alerted = true
    }

}).unregister()

const alert = register("renderOverlay", () => {

    playSound("minecraft:entity.experience_orb.pickup", 0.5, 1)

    Client.showTitle(
        " ",
        "§cDiamante, WATCH OUT",
        0,
        30,
        0
    )

    if (!scheduled) {
        scheduled = true
        Client.scheduleTask(40, () => {
            alert.unregister()
        })
    }

}).unregister()

if (c.diamanteNoti) {
    messageTrig.register()
    worldTrig.register()
}

c.registerListener("Diamante Notifier", (curr) => {
    reloadState()
    if (curr) {
        messageTrig.register()
        worldTrig.register()
    }
    else {
        messageTrig.unregister()
        worldTrig.unregister()
    }
})