import c from "../../config"
import { data, drawText, registerOverlay } from "../../managers/guimanager"
import dungeonUtils from "../../util/dungeonUtils"
import { registerPacketChat } from "../../util/Events"
import { CommonPingS2CPacket, SubtitleS2CPacket, TitleS2CPacket } from "../../util/utils"
let thingydone = null
let thingycompleted = null
let thingytotal = null
let InP3 = false
let completedat = 0
let playername = null
registerOverlay("TermNoti", { text: () => stuff(), align: "center", colors: true, setting: () => c.TermNoti })

function stuff() {
    if(c.detailedMode) {
        if(c.fullName) return "Fiery - &bTerminal &r&f(&d&l1&f/&d&l7&r&f)"
        else return "Fiery - &bTerm &r&f(&d&l1&f/&d&l7&r&f)"
    }
    else {
        if(c.fullName) return "&bTerminal &r&f(&d&l1&f/&d&l7&r&f)"
        else return "&bTerm &r&f(&d&l1&f/&d&l7&r&f)"
    }
}

function resetstuff() {
    thingycompleted = 0
    thingytotal = 7
    thingydone = null
    completedat = 0
    gatenotblown = false
    lastcompleted = 0
    playername = null
}

function registerTriggers(bool) {
    const triggers = [termoverlaystuff, inp3, gatestuff, gatestuff1, corestuff]
    triggers.forEach(trig => {
        if (bool) {
            trig.register();
        } else {
            trig.unregister();
        }
    });
}

register("worldLoad", () => {
    registerTriggers(false)
    resetstuff()
    InP3 = false
})

const chatTrig = registerPacketChat((message) => {
    if (message == "[BOSS] Storm: I should have known that I stood no chance.") {
        registerTriggers(true)
        resetstuff()
        InP3 = true
    }
}).unregister()

const corestuff = registerPacketChat((message) => {
    if (message != "The Core entrance is opening!") return;
    thingydone = "&5Core Open!"
    thingytotal = null
    thingycompleted = null
    playername = null
    setTimeout(() => {
        InP3 = false
        completedat = 0
        registerTriggers(false)
    }, 2000);
}).unregister()


const gatestuff = registerPacketChat((message) => {
    if (message != "The gate has been destroyed!") return;
    if(!c.GateNoti && !gatenotblown) return;
    if(!c.KeepTitles) tickListener.register()
    completedat = 40
    thingydone = "&aGate Destroyed"
    thingytotal = null
    thingycompleted = null
    playername = null
}).unregister()


const gatestuff1 = registerPacketChat((message) => {
    if (message != "The gate will open in 5 seconds!") return;
    if(!c.KeepTitles) tickListener.register()
    completedat = 40
    thingydone = "&cGate: 5s"
    gatenotblown = true
    thingytotal = null
    thingycompleted = null
    playername = null
}).unregister()

let lastcompleted = 0

const inp3 = registerPacketChat((message) => {
    const match = message.match(/(.+) (activated|completed) a (terminal|device|lever)! \((\d)\/(\d)\)/)
    if (!match) return;
    const [_, name, action, object, completed, total, event] = match
    if(!c.KeepTitles) tickListener.register()
    completedat = 40
    thingycompleted = completed
    thingytotal = total
    playername = name
    switch (object) {
        case "terminal":
            thingydone = c.fullName ? "&bTerminal" : "&bTerm"
            lastcompleted = completed
            break;
        case "lever":
            thingydone = "&bLever"
            lastcompleted = completed
            break;
        case "device":
            const playerclass = dungeonUtils.getPlayerClass(name)
            if(lastcompleted == completed) {
                if(!c.instaNoti) {
                    completedat = 0
                    thingydone = null
                    thingycompleted = null
                    thingytotal = null
                    playername = null
                    return;
                }
                if(playerclass == "Berserk") {
                    thingydone = "&5I4 Done"
                    thingycompleted = null
                    thingytotal = null
                    break;
                }
                else /*if (playerclass == "Archer")*/ {
                    thingydone = "&5Lights Done"
                    thingycompleted = null
                    thingytotal = null
                    break;
                }
            }
            thingydone = c.fullName ? "&5Device" : "&5Dev"
            lastcompleted = completed
            break;
        default:
            break;
    }
}).unregister()

const tickListener = register('packetReceived', (packet, event) => {
    if (!(packet instanceof CommonPingS2CPacket)) return;
    if (packet.getParameter() === 0) return;
    completedat--;
    if(completedat > 0) return;
    thingydone = null
    thingycompleted = null
    thingytotal = null
    playername = null
    tickListener.unregister()
}).setFilteredClass(CommonPingS2CPacket).unregister()

const termoverlaystuff = register("renderOverlay", (cfx) => {
    if(!thingydone) return
    let displaytext
    if(thingycompleted && thingytotal) {
        displaytext = thingydone + " &r&f(&d&l" + thingycompleted + "&f/&d&l" + thingytotal + "&r&f)";
        if(c.detailedMode) displaytext = `${playername} - ${displaytext}`
    }
    else{
        displaytext = thingydone
    }
    drawText(cfx, displaytext, data.TermNoti, true, "TermNoti")
}).unregister();

const blockedPhrases = [
    "activated a terminal!",
    "completed a device!",
    "activated a lever!",
    "destroyed",
    "gate will open in 5 seconds!",
    "core entrance is opening!"
];

// function getTextFromPacket(packet) {
//     const packetString = packet.toString();
//     const match = packetString.match(/text='([^']+)'/) || packetString.match(/literal\{([^}]+)\}/);
//     return match ? match[1] : null;
// }

const subtitleRegex = /^(\w+) (activated|completed) a (terminal|device|lever)! \((\d+)\/(\d+)\)$/
const cancelTitlesTrig = register("packetReceived", (packet, event) => {
    if (!(packet instanceof SubtitleS2CPacket)) return;
    if(!InP3 || !c.TermNoti) return;
    const match = packet.text().getString().replace(/§[0-9a-fk-or]/g, '').match(subtitleRegex);
    if (!match) return;
    cancel(event)
}).setFilteredClass(SubtitleS2CPacket).unregister()

if (c.CancelTitles && c.TermNoti) {
    cancelTitlesTrig.register();
}

if (c.TermNoti) {
    chatTrig.register()
    if(dungeonUtils.currentPhase == 3) {
        registerTriggers(true)
        resetstuff()
        InP3 = true
    }
}

c.registerListener("Disable standard term titles", (curr) => {
    if (curr && c.TermNoti) cancelTitlesTrig.register();
    else cancelTitlesTrig.unregister();
})

c.registerListener("Terminal Notifier", (curr) => {
    if (curr) {
        chatTrig.register()
        if(dungeonUtils.currentPhase == 3) {
            registerTriggers(true)
            resetstuff()
            InP3 = true
        }
    }
    else {
        chatTrig.unregister()
        registerTriggers(false)
        InP3 = false
        resetstuff()
    }
})