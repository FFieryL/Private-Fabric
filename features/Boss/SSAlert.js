import { data, drawText, registerOverlay } from "../../managers/guimanager";
import { registerPacketChat } from "../../util/Events"
import { CommonPingS2CPacket, playSound } from "../../util/utils";
import c from "../../config"
registerOverlay("SSAlert", { text: () => `&nSS BROKE!`, align: "center", colors: true, setting: () => c.SSAlert || c.SSAlertRestart})

let ticks = 0;
let allowBreak = false
let hasBroken = false

const obsidians = [[111,123,92],[111,123,93],[111,123,94],[111,123,95],[111,122,92],[111,122,93],[111,122,94],[111,122,95],[111,121,92],[111,121,93],[111,121,94],[111,121,95],[111,120,92],[111,120,93],[111,120,94],[111,120,95]];
const buttons = [[110,123,92],[110,123,93],[110,123,94],[110,123,95],[110,122,92],[110,122,93],[110,122,94],[110,122,95],[110,121,92],[110,121,93],[110,121,94],[110,121,95],[110,120,92],[110,120,93],[110,120,94],[110,120,95]];

let title = `&l&nSS BROKE!`
let stuffdone = 0

registerPacketChat((message) => {
    if (message == "[BOSS] Goldor: Who dares trespass into my domain?") {
        if (!c.SSAlert && !c.SSAlertSendChat && !c.SSAlertRestartChat && !c.SSAlertRestart) return
        stuffdone = 0
        allowBreak = false
        hasBroken = false
        deviceDone.register()
        tickIncrementNew.register()
        return;
    }

})

const deviceDone = registerPacketChat((message) => {
    const match = message.match(/(.+) (activated|completed) a (terminal|device|lever)! \((\d)\/(\d)\)/)
    if (!match) return;

    const object = match[3]
    const completed = match[4]
    
    switch (object) {
        case "terminal":
            stuffdone++
            break;
        case "lever":
            stuffdone++
            break;
        case "device":
            if ((stuffdone+1) == completed) {
                tickIncrementNew.unregister()
                deviceDone.unregister()
            }
            break;
    
        default:
            break;
    }
}).unregister()

const tickIncrementNew = register("packetReceived", (packet, event) => {
    if (!(packet instanceof CommonPingS2CPacket) || packet.getParameter() == 0) return;
    ticks--
    for (let i = 0; i < obsidians.length; i++) {
        let [x, y, z] = obsidians[i];
        let blockName = World.getBlockAt(x, y, z).type.getName().removeFormatting();
        if (blockName !== "Obsidian") {
            ticks = 12;
            allowBreak = true;
            if (hasBroken) {
                hasBroken = false
                if (c.SSAlertRestartChat) ChatLib.command("pc SS Started Again!")
                if (!c.SSAlertRestart) return
                SSAlert.register()
                title = `&a&l&nSS Started!`
                setTimeout(() => {
                    if (title = `&a&l&nSS Restarted!`) SSAlert.unregister()
                    title = `&c&l&nSS BROKE!`
                }, 2000);
            }
            return;
        }
    }
    if (ticks > 0 || !allowBreak) return
    for (let i = 0; i < buttons.length; i++) {
        let [x, y, z] = buttons[i];
        let blockID = World.getBlockAt(x, y, z).type.getID();
        
        if (blockID !== 0) {
            return
        }
    }
    allowBreak = false
    hasBroken = true
    if (c.SSAlertSendChat) ChatLib.command("pc ssr SS Broke! SS Broke! SS Broke! ssr")
    if (!c.SSAlert) return
    if (c.SSAlertSound) playSound("random.anvil_land", 0.6, 0);
    SSAlert.register()
    setTimeout(() => {
        if (title = `${data.SSAlert.color}&l&nSS BROKE!`) SSAlert.unregister()
    }, 2000);
}).setFilteredClass(CommonPingS2CPacket).unregister()

const SSAlert = register("renderOverlay", (ctx) => { 
    drawText(ctx, title, data.SSAlert, true, "SSAlert")
}).unregister()
