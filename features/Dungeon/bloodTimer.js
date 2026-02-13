import c from "../../config"
import { data, drawText, registerOverlay } from "../../managers/guimanager"
import dungeonUtils from "../../util/dungeonUtils"
import { bloodStartMessages, chat, CommonPingS2CPacket, playSound } from "../../util/utils"

registerOverlay("BloodTimer", { text: () => "Kill Now", align: "center", colors: true, setting: () => c.bloodTimer})

let bloodStartTime = Date.now()
let bloodStartTicks = 0
let displayText = " "
let timeLeft
let starttime = undefined
let scheduled = false
const bloodTicks = 43

register("worldLoad", () => reset())

function reset() {
    bloodServerTicks.unregister()
    bloodOverlay.unregister()
    timeLeft = 0
    starttime = undefined
    scheduled = false
}

const chatTrig1 = register("chat", (message) => {
    if (!bloodStartMessages.includes(message.removeFormatting())) return
    bloodStartTime = Date.now()
    bloodStartTicks = 0
    bloodServerTicks.register()
}).setCriteria("${message}").unregister()

const bloodServerTicks = register('packetReceived', (packet) => {
    if (!(packet instanceof CommonPingS2CPacket) || packet.getParameter() == 0) return;
    bloodStartTicks++
    if (starttime == undefined) return;
    timeLeft -= 0.05
    if(timeLeft <= 0) {
        timeLeft = 0
        bloodServerTicks.unregister()
    }
}).setFilteredClass(CommonPingS2CPacket).unregister()

const chatTrig2 = register("chat", () => {
    const bloodMove = ((Math.floor((Date.now() - bloodStartTime) / 10) / 100) + 0.10).toFixed(2)
    let bloodMovePredictionTicks
    const bloodMoveTicks = (bloodStartTicks * 0.05 + 0.1).toFixed(2)
    const bloodMoveLag = (bloodMove - bloodMoveTicks)   
    

    if (bloodMoveTicks >= 31 && bloodMoveTicks <= 33.99) bloodMovePredictionTicks = (36 + (bloodMoveLag / 2) - 0.6).toFixed(2)
    else if (bloodMoveTicks >= 28 && bloodMoveTicks <= 30.99) bloodMovePredictionTicks = (33 + (bloodMoveLag / 2) - 0.6).toFixed(2)
    else if (bloodMoveTicks >= 25 && bloodMoveTicks <= 27.99) bloodMovePredictionTicks = (30 + (bloodMoveLag / 2) - 0.6).toFixed(2)
    else if (bloodMoveTicks >= 22 && bloodMoveTicks <= 24.99) bloodMovePredictionTicks = (27 + (bloodMoveLag / 2) - 0.6).toFixed(2)
    else if (bloodMoveTicks >= 1 && bloodMoveTicks <= 21.99) bloodMovePredictionTicks = (24 + (bloodMoveLag / 2) - 0.6).toFixed(2)
    if (bloodMovePredictionTicks < 20 || bloodMovePredictionTicks > 40) bloodMovePredictionTicks = "Invalid Prediction"
    else {
        if (c.btSendParty) ChatLib.command("pc Watcher Prediction: " + bloodMovePredictionTicks)
        else chat(`&cWatcher Prediction&b: &3${bloodMovePredictionTicks} Seconds`)
        displayText = `&3${bloodMovePredictionTicks}`
        if (c.btMageOnly && dungeonUtils.getPlayerClass(Player.getName())) return;
        const timeToKill = (bloodMovePredictionTicks - bloodMoveTicks) * 1000
        if (c.btCountDown) {
            timeLeft = (bloodTicks / 20) //(timeToKill - 150) / 1000
            bloodOverlay.register()
        }
        else {
            bloodOverlay.register()
            setTimeout(() => {
                bloodOverlay.unregister()
                displayText = `&cKill Mobs`
            }, 1000)
            setTimeout(() => {
                bloodOverlay.register()
            }, bloodTicks * 50)
            setTimeout(() => {
                bloodOverlay.unregister()
                bloodServerTicks.unregister()
            }, bloodTicks * 50 + 750)
        }
    }
}).setCriteria("[BOSS] The Watcher: Let's see how you can handle this.").unregister()


const bloodOverlay = register("renderOverlay", (ctx) => {
    if (c.btCountDown) {
        if (starttime == undefined) starttime = timeLeft
        if (timeLeft <= 0) {
            displayText = "Kill Now"
            playSound("random.orb", 0.7, 0)
            if (!scheduled) {
                scheduled = true
                Client.scheduleTask(30, () => {
                    bloodOverlay.unregister()
                })
            }
        }
        else if (timeLeft < (starttime / 4)) displayText = `&c${timeLeft.toFixed(2)}s`
        else if (timeLeft < (starttime / 2)) displayText = `&e${timeLeft.toFixed(2)}s`
        else displayText = `&3${timeLeft.toFixed(2)}s`;
    }

    drawText(ctx, displayText, data.BloodTimer, true, "BloodTimer")
}).unregister()

c.registerListener("Blood Timer", (curr) => {
    if (curr) {
        chatTrig1.register()
        chatTrig2.register()
    } else {
        chatTrig1.unregister()
        chatTrig2.unregister()
        reset()
    }
})

if (c.bloodTimer) {
    chatTrig1.register()
    chatTrig2.register()
}