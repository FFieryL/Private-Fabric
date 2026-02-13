import c from "../../config"
import { data, drawText, registerOverlay } from "../../managers/guimanager"
import dungeonUtils from "../../util/dungeonUtils"
import { chat, WorldTimeUpdateS2CPacket, PlayerPositionLookS2CPacket, CommonPingS2CPacket, bloodStartMessages, GameMessageS2CPacket } from "../../util/utils"
registerOverlay("StormTimer", { text: () => "0.00", align: "center", colors: true, setting: () => c.stormTimer })
registerOverlay("P3Timer", { text: () => "0.00", align: "center", colors: false, setting: () => c.goldorTimer })
registerOverlay("pyLBTimer", { text: () => "10.00", align: "center", colors: true, setting: () => c.pyLBTimer })
registerOverlay("StormDeathTime", { text: () => "36.20", align: "center", colors: true, setting: () => c.sendStormTime })
registerOverlay("DeathTickTimer", { text: () => "0.00", align: "center", colors: false, setting: () => c.deathTickTimer })

let deathTime = 0;
let goldorStarted = false
let stormEnded = false

const stormTickListener = register("packetReceived", (packet, event) => {
    if (!(packet instanceof CommonPingS2CPacket)) return;
    if (packet.getParameter() == 0) return;
    global.stormTicks++;
}).setFilteredClass(CommonPingS2CPacket).unregister()

register("packetReceived", (packet, event) => {
    if (!(packet instanceof CommonPingS2CPacket)) return;
    if (packet.getParameter() == 0) return;

    if (stormEnded) {
        if (--global.goldorTicks <= 0) stormEnded = false
    }
    if (!goldorStarted) return

    global.goldorTotal++

    if (c.goldorTimerType == 0) {
        if (global.goldorTicks > 60) {
            global.goldorTicks = 60 - (global.goldorTicks % 60)
        }
        if (--global.goldorTicks <= 0) {
            global.goldorTicks = 60
        }
    } else {
        global.goldorTicks++
    }
}).setFilteredClass(CommonPingS2CPacket)

const worldLoad = register("worldUnload", () => {
    resetStuffStorm()
    resetStuffGoldor()
    LBTimer.unregister()
}).unregister()

register("chat", () => {
    global.stormTicks = 0
    if (c.pyLBTimer || c.stormTimer) {
        stormTickListener.register()
        if (c.stormTimer) {
            overlay.register();
        }
    }
}).setCriteria("[BOSS] Storm: Pathetic Maxor, just like expected.")

register("chat", () => {
    resetStuffStorm()
    LBTimer.unregister()
    if (!c.goldorStartTimer) return;
    global.goldorTicks = 104
    stormEnded = true
    goldorStartOverlay.register()
}).setCriteria("[BOSS] Storm: I should have known that I stood no chance.")


// Storm Timer

function resetStuffStorm() {
    global.stormTicks = 0
    stormTickListener.unregister()
    overlay.unregister()
}

const overlay = register("renderOverlay", (cfx) => {
    const displayText = (global.stormTicks / 20).toFixed(2).toString()
    drawText(cfx, displayText, data.StormTimer, true, "StormTimer")
}).unregister()


// P3 timer

function resetStuffGoldor() {
    global.goldorTicks = 0
    global.goldorTotal = 0
    goldorStarted = false
    goldorOverlay.unregister()
}

register("chat", () => {
    stormEnded = false
    if (!c.goldorTimer) return;
    if (c.goldorTimerType == 0) global.goldorTicks = 60;
    else global.goldorTicks = 0
    global.goldorTotal = 0
    goldorStarted = true
    goldorOverlay.register();
    goldorStartOverlay.unregister()
}).setCriteria("[BOSS] Goldor: Who dares trespass into my domain?")

const chatTrig3 = register("chat", () => {
    resetStuffGoldor()
}).setCriteria("The Core entrance is opening!").unregister()

const goldorOverlay = register("renderOverlay", (cfx) => {
    const timeT = global.goldorTicks
    const timeS = (timeT / 20)
    let color
    if (c.goldorTimerType == 0) color = (timeT > 40 ? "&a" : timeT > 20 ? "&6" : "&c")
    else {
        const deathtick = timeT % 60
        color = (deathtick < 20 ? "&a" : deathtick < 40 ? "&6" : "&c")
    }
    global.goldorColor = color
    let displayText = color + timeS.toFixed(2).toString()
    if (c.goldorTimerTicks) displayText = color + timeT
    drawText(cfx, displayText, data.P3Timer, true, "P3Timer")
}).unregister()

const goldorStartOverlay = register("renderOverlay", (cfx) => {
    const timeT = global.goldorTicks
    if (timeT <= 0) goldorStartOverlay.unregister()
    const timeS = (timeT / 20)
    let color = (timeT > 52 ? "&a" : timeT > 26 ? "&6" : "&c")

    const displayText = color + timeS.toFixed(2).toString()
    drawText(cfx, displayText, data.P3Timer, true, "P3Timer")
}).unregister()





//Timer for perfect LB release

const chatTrig1 = register("chat", () => {
    LBTimer.register()
}).setCriteria(/\[BOSS\] Storm: (ENERGY HEED MY CALL!|THUNDER LET ME BE YOUR CATALYST!)/).unregister()


const LBTimer = register("renderOverlay", (cfx) => {

    const targetTicks = parseFloat(c.pyLBTimerSeconds) * 20

    if (global.stormTicks > 0) {
        let displayText = ""
        if (global.stormTicks >= targetTicks) {
            displayText = "RELEASE NOW"
            const heldItemName = Player?.getHeldItem()?.getName()?.toLowerCase();
            if (!heldItemName) return;
            if (!heldItemName.toLowerCase().includes("last breath")) {
                LBTimer.unregister()
            }
        }
        else {
            const remainingTicks = targetTicks - global.stormTicks
            const remainingSeconds = (remainingTicks / 20).toFixed(2)

            const color = remainingTicks < 40 ? "&c" : "&e";
            displayText = `${color}${remainingSeconds}`
        }

        drawText(cfx, displayText, data.pyLBTimer, true, "pyLBTimer");
    }
}).unregister()


register("chat", () => {
    if (!c.sendStormTime) return;
    deathTime = global.stormTicks
    chat(`&aStorm died at &e${(global.stormTicks / 20).toFixed(2)}s&r.`)
    stormDeathTime.register()
    setTimeout(() => {
        stormDeathTime.unregister()
    }, 2000);

}).setCriteria("⚠ Storm is enraged! ⚠")

const stormDeathTime = register("renderOverlay", (cfx) => {
    let displayText = (deathTime / 20).toFixed(2)
    drawText(cfx, displayText, data.StormDeathTime, true, "StormDeathTime")
}).unregister()




// Death Tick Timer
let deathTicks = -1;
let spawnPos = null

const serverTick = register("packetReceived", (packet) => {
    if (!(packet instanceof CommonPingS2CPacket)) return;
    if (packet.getParameter() == 0) return;
    --deathTicks;
    if (deathTicks <= 0) deathTicks = 40
}).setFilteredClass(CommonPingS2CPacket).unregister();

let S03;
let S08 = register("packetReceived", () => {
    S03 = register("packetReceived", (packet) => {
        const fields = packet.getClass().getDeclaredField('comp_3219')
        fields.setAccessible(true)
        const totalWorldTime = fields.getLong(packet)
        if (!totalWorldTime) return;

        deathTicks = 40 - (totalWorldTime % 40);
        serverTick.register();
        if (c.deathTickTimer && spawnPos != null) deathTickOverlay.register()
        return;
    }).setFilteredClass(WorldTimeUpdateS2CPacket);

    S08.unregister();
    return;
}).setFilteredClass(PlayerPositionLookS2CPacket);


const spawnPosition = register('packetReceived', (packet) => {
    try {
        const changeField = packet.getClass().getDeclaredField('comp_36633');
        changeField.setAccessible(true);

        const changeObject = changeField.get(packet);

        const xField = changeObject.getClass().getDeclaredField('comp_36629');
        const yField = changeObject.getClass().getDeclaredField('comp_36630');
        const zField = changeObject.getClass().getDeclaredField('comp_36631');

        xField.setAccessible(true);
        yField.setAccessible(true);
        zField.setAccessible(true);

        const px = xField.getDouble(changeObject);
        const py = yField.getDouble(changeObject);
        const pz = zField.getDouble(changeObject);
        if (py !== 75.5 && py !== 76.5) return;

        spawnPos = [px, py, pz];

        spawnPosition.unregister();

    } catch (e) {
        const match = packet.toString().match(/position=\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
        if (match) {
            const py = parseFloat(match[2]);
            if (py === 75.5 || py === 76.5) {
                spawnPos = [parseFloat(match[1]), py, parseFloat(match[3])];
                spawnPosition.unregister();
            }
        }
    }
}).setFilteredClass(PlayerPositionLookS2CPacket);

register("chat", (message) => {
    const newMSG = message.removeFormatting()
    const messageTrig = c.deathTickTimerBloodOpen;

    const isBloodStart = bloodStartMessages.includes(message);
    const isMort = newMSG.includes("[NPC] Mort: Here, I found this map when I first entered the dungeon.") ||
        newMSG.includes("[NPC] Mort: Good luck.");

    if ((messageTrig && isBloodStart) || (!messageTrig && isMort)) {
        spawnPos = null;
        serverTick.unregister();
        deathTickOverlay.unregister();
    }
    if (!newMSG.includes("Sending to server")) return;
    deathTicks = -1;
    spawnPos = null;
    spawnPosition.register()
}).setCriteria("${message}")

const deathTickOverlay = register("renderOverlay", (cfx) => {
    if (dungeonUtils.inBoss) deathTickOverlay.unregister()
    const timeT = deathTicks
    const timeS = (timeT / 20).toFixed(2)
    let color;
    if (timeT > 20) color = "&a"
    else if (timeT > 10) color = "&6"
    else color = "&c";
    const displayText = c.deathTickTimerType ? color + timeS.toString() : color + timeT.toString()
    drawText(cfx, displayText, data.DeathTickTimer, true, "DeathTickTimer")
}).unregister()

register("worldUnload", () => {
    deathTicks = -1;
    serverTick.register();
    deathTickOverlay.unregister()
    S08.register();
});

if (c.pyLBTimer) {
    resetStuffStorm()
    worldLoad.register()
    chatTrig1.register()
    LBTimer.unregister()
}


if (c.stormTimer) {
    resetStuffStorm()
    worldLoad.register()
}


c.registerListener("py Last Breath Timer", (curr) => {
    resetStuffStorm()
    if (curr) {
        chatTrig1.register()
        LBTimer.unregister()
    }
    else {
        chatTrig1.unregister()
        LBTimer.unregister()
        if (c.goldorTimer || c.stormTimer) return;
        worldLoad.unregister()
    }
})

c.registerListener("Storm Timer", (curr) => {
    resetStuffStorm()
    if (curr) {
        worldLoad.register()
    }
    else {
        if (c.goldorTimer || c.pyLBTimer) return;
        worldLoad.unregister()
    }
})


if (c.goldorTimer) {
    resetStuffGoldor()
    chatTrig3.register()
    worldLoad.register()
}

c.registerListener("Goldor Timer", (curr) => {
    resetStuffGoldor()
    if (curr) {
        chatTrig3.register()
        worldLoad.register()
    }
    else {
        chatTrig3.unregister()
        if (c.stormTimer || c.pyLBTimer) return;
        worldLoad.unregister()
    }
})
