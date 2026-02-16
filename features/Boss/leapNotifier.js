import c from "../../config"
import { data, drawText, OverlayEditor, registerOverlay } from "../../managers/guimanager";
import dungeonUtils from "../../util/dungeonUtils";
import { registerPacketChat } from "../../util/Events";
registerOverlay("LeapNoti", { text: () => "0/4 Leaped", align: "center", colors: true, setting: () => c.leapNoti})

let playersLeapt = [];
const sectionRegions = [
    [90, 111, 106, 145, 50, 123],
    [17, 108, 106, 145, 121, 144],
    [-2, 20, 106, 145, 51, 142],
    [-1, 191, 26, 145, 29, 58],
    [3, 128, 5, 48, 0, 140]
    //x1 x2 y1 y2 z1 z2
]

const eeSpots = {
    ee2: {x: 58, y: 109, z: 131, r: 1},
    highee2: {x: 60, y: 132, z: 138, r: 3},
    ee3: {x: 2, y: 109, z: 104, r: 4},
    core: {x: 54.5, y: 115, z: 50.5, r: 1},
    relic: {x: 54.5, y: 5, z: 76.5, r: 3}
}

const SPOTS_CONFIG = [
    { spot: eeSpots.ee2, value: 2 },
    { spot: eeSpots.highee2, value: 2 },
    { spot: eeSpots.ee3, value: 3 },
    { spot: eeSpots.core, value: 4 },
    { spot: eeSpots.relic, value: 5}
];

function inBox(player, region) {
    let [x, y, z] = [player.getRenderX(), player.getRenderY(), player.getRenderZ()];
    if (x >= region[0] && x <= region[1] && y >= region[2] && y <= region[3] && z >= region[4] && z <= region[5]) return true;
    return false;
}

function getSection(player) {
    if (!player) return 0;

    for (let i = 0; i < 5; ++i) {
        if (inBox(player, sectionRegions[i])) return i + 1;
    }
    return 0;
}
function leapListener(section) {
    for (let p of dungeonUtils.party) {
        if (p == Player.getName()) continue;
        let player = World.getPlayerByName(p);
        if (!player) continue;
        if (getSection(player) == section) {
            if (!playersLeapt.includes(p)) playersLeapt.push(p);
        }
    }
}

function eeSpot() {
    const match = SPOTS_CONFIG.find(s => inRange(s.spot) && (!s.condition || s.condition()));
    return match?.value || 0;
}

function inRange(spot) {
    let [x, y, z] = [Player.getX(), Player.getY(), Player.getZ()];
    let [distX, distY, distZ] = [Math.abs(spot.x - x), Math.abs(spot.y - y), Math.abs(spot.z - z)]
    if (distX < spot.r && distY < 2 && distZ < spot.r) return true;
    return false;
}

const chatTrig = dungeonUtils.onBossMessage((name) => {
    if (name === "Storm" || name === "Goldor") locationListener.register()
    if (name === "Wither King") {
        locationListener.unregister();
        display.unregister();
    }
}).unregister()


const worldTrig = register("worldLoad", () => {
    locationListener.unregister();
    display.unregister();
}).unregister()

const locationListener = register("tick", () => {
    if (eeSpot() > 0) {
        leapListener(eeSpot());
        display.register();
    } else {
        playersLeapt = [];
        display.unregister();
    }
}).unregister();

const display = register("renderOverlay", (cfx) => {
    if (OverlayEditor.isOpen()) return;
    let displayText
    if (eeSpot() == 3) displayText = `${playersLeapt.length > 2 ? data.LeapNoti.color : "&4"}${playersLeapt.length}${data.LeapNoti.color}/3 Leaped`
    else if (eeSpot() > 0) displayText = `${playersLeapt.length > 3 ? data.LeapNoti.color : "&4"}${playersLeapt.length}${data.LeapNoti.color}/4 Leaped`
    if (!displayText) return;
    drawText(cfx, displayText, data.LeapNoti, true, "LeapNoti")
}).unregister();

if (c.leapNoti) {
    chatTrig.register()
    worldTrig.register()
    locationListener.unregister()
    display.unregister()
}

c.registerListener("Leap Notifier", (curr) => {
    if (curr) {
        chatTrig.register()
        worldTrig.register()
        locationListener.unregister()
        display.unregister()
    }
    else {
        chatTrig.unregister()
        worldTrig.unregister()
        locationListener.unregister()
        display.unregister()
    }
})