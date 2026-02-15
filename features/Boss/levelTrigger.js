import c from "../../config"
import dungeonUtils from "../../util/dungeonUtils";
import { rightClick } from "../../util/utils";

let p3Levers = [
    [106, 124, 113, 5.7], [94, 124, 113, 5.7], [23, 132, 138, 5.7], 
    [27, 124, 127, 5.7], [2, 122, 55, 5.7], [14, 122, 55, 5.7], 
    [84, 121, 34, 5.7], [86, 128, 46, 5.7]
];

const deviceLevers = [
    [58, 133, 142, 5.7],
    [58, 136, 142, 5.7],
    [60, 135, 142, 5.7],
    [60, 134, 142, 5.7],
    [62, 133, 142, 5.7],
    [62, 136, 142, 5.7],
];

const leverCooldowns = new Map(); 
const CLICK_DELAY = 1000;

const leverTrigger = register("tick", () => {
    if(Client.isInGui()) return;
    const lookingAt = Player.lookingAt();
    if (!lookingAt) return;

    const blockStr = lookingAt.toString();
    if (!blockStr.includes("lever")) return;

    const x = lookingAt.getX();
    const y = lookingAt.getY();
    const z = lookingAt.getZ();

    const isP3Lever = p3Levers.some(([lx, ly, lz]) => x === lx && y === ly && z === lz);
    if (!isP3Lever) return;

    const key = `${x}, ${y}, ${z}`;
    const lastClick = leverCooldowns.get(key) || 0;

    if (Date.now() - lastClick < CLICK_DELAY) return;
    rightClick(true);
    leverCooldowns.set(key, Date.now());
}).unregister()

const chatTrig = register("chat", (name, event) => {
    name = name.removeFormatting();
    const enableBeforeP3 = (c.enableBeforeP3 && (dungeonUtils.currentPhase == 2 || dungeonUtils.currentPhase == 1))
    if (name === "Goldor" || enableBeforeP3) {
        leverTrigger.register()
        chatTrig.unregister()
    }
    else leverTrigger.unregister()
}).setCriteria("[BOSS] ${name}: ${*}").unregister()

const chatTrig2 = register("chat", () => {
    leverTrigger.unregister()
    chatTrig2.unregister()
}).setCriteria("The Core entrance is opening!").unregister()

const worldTrig = register("worldUnload", () => {
    chatTrig.register()
    chatTrig2.register()
}).unregister()

if (c.leverTriggerBot) {
    worldTrig.register()
    chatTrig.register()
    chatTrig2.register()
}

if (c.enableForDevice) {
    addDeviceLevers()
}
else {
    removeDeviceLevers()
}

function addDeviceLevers() {
    deviceLevers.forEach(lever => {
        if (!p3Levers.some(l => l[0] === lever[0] && l[1] === lever[1] && l[2] === lever[2])) {
            p3Levers.push(lever);
        }
    });
}

function removeDeviceLevers() {
    p3Levers = p3Levers.filter(
        lever => !deviceLevers.some(
            d => d[0] === lever[0] && d[1] === lever[1] && d[2] === lever[2]
        )
    );
}

c.registerListener("Enable Lever Trigger Bot for Device", (curr) => {
    if (curr) addDeviceLevers()
    else removeDeviceLevers()
})

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