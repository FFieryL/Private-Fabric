import c from "../../config"
import dungeonUtils from "../../util/dungeonUtils";
import { registerPacketChat } from "../../util/Events";
import { rightClick } from "../../util/utils";

const p3Levers = [
    [106, 124, 113, 5.7], [94, 124, 113, 5.7], [23, 132, 138, 5.7], 
    [27, 124, 127, 5.7], [2, 122, 55, 5.7], [14, 122, 55, 5.7], 
    [84, 121, 34, 5.7], [86, 128, 46, 5.7]
];

const deviceLevers = [
    [58, 133, 142, 5.7],
    [58, 136, 142, 5.7],
    [60, 135, 142, 5.7],
    [60, 134, 142, 5.7],
    [60, 133, 142, 5.7],
    [62, 133, 142, 5.7],
    [62, 136, 142, 5.7],
];

const leverCooldowns = new Map(); 
const CLICK_DELAY = 1000;

const leverTrigger = register("step", () => {
    if(Client.isInGui()) return;
    const lookingAt = Player.lookingAt();
    if (!lookingAt) return;

    const blockStr = lookingAt.toString();
    if (!blockStr.includes("lever")) return;

    const x = lookingAt.getX();
    const y = lookingAt.getY();
    const z = lookingAt.getZ();

    const isDeviceLever = deviceLevers.some(([lx, ly, lz]) => x === lx && y === ly && z === lz);
    const isP3Lever = p3Levers.some(([lx, ly, lz]) => x === lx && y === ly && z === lz);

    if (isDeviceLever) {
        if (!c.enableForDevice) return;
    }

    else if (isP3Lever) {
        if (dungeonUtils.currentPhase != 3) return;
    }

    else return;

    const key = `${x}, ${y}, ${z}`;
    const lastClick = leverCooldowns.get(key) || 0;

    if (Date.now() - lastClick < CLICK_DELAY) return;
    rightClick(true, true);
    leverCooldowns.set(key, Date.now());
}).setFps(50).unregister()

const chatTrig = dungeonUtils.onBossMessage((name) => {
    const enableBeforeP3 = (c.enableBeforeP3 && (dungeonUtils.getPhase() == 2 || dungeonUtils.getPhase() == 1))
    if (name === "Goldor" || enableBeforeP3) {
        leverTrigger.register()
        chatTrig.unregister()
    }
    else leverTrigger.unregister()
}).unregister()

const chatTrig2 = registerPacketChat((msg) => {
    if (msg == "The Core entrance is opening!") {
        leverTrigger.unregister()
        chatTrig2.unregister()
    }
}).unregister()

const worldTrig = register("worldUnload", () => {
    chatTrig.register()
    chatTrig2.register()
}).unregister()

if (c.leverTriggerBot) {
    worldTrig.register()
    chatTrig.register() 
    chatTrig2.register()
}

c.registerListener("Lever Trigger Bot", (curr) => {
    if (curr) {
        worldTrig.register()
        if(dungeonUtils.currentPhase == 3 || (c.enableBeforeP3 && (dungeonUtils.currentPhase == 2 || dungeonUtils.currentPhase == 1))) {
            chatTrig.unregister()
            leverTrigger.register()
            chatTrig2.register()
            return;
        }
        chatTrig.register()
        chatTrig2.register()
    }
    else {
        leverTrigger.unregister()
        chatTrig.unregister()
        chatTrig2.unregister()
        worldTrig.unregister()
    }
})