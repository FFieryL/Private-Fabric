import c from "../../config"
import { data, drawText, OverlayEditor, registerOverlay } from "../../managers/guimanager"
import { registerPacketChat } from "../../util/Events"
import { CommonPingS2CPacket } from "../../util/utils"
let timeElapsed = 0
let timerDuration = 0
registerOverlay("QuizTimer", { text: () => "Quiz: &c11.00", align: "center", colors: true, setting: () => c.QuizTimer })

const tickListener = register('packetReceived', (packet, event) => {
    if (!(packet instanceof CommonPingS2CPacket)) return;
    if (packet.getParameter() == 0) return;
    timeElapsed++
    if(timeElapsed == timerDuration) tickListener.unregister()
}).setFilteredClass(CommonPingS2CPacket).unregister()

const quizTimer = register("renderOverlay", (cfx) => {
    if (OverlayEditor.isOpen()) return;
    const remaining = (timerDuration - timeElapsed) / 20;
    if (remaining <= 0) return quizTimer.unregister();
    const fraction = remaining / (timerDuration / 20);
    let color;
    if (fraction <= 0.5 && fraction >= 0.25) color = `&e`;
    else if (fraction <= 0.25) color = `&c`;
    else color = `&a`;
    const displaytext = "Quiz: " + color + remaining.toFixed(2);
    drawText(cfx, displaytext, data.QuizTimer, true, "QuizTimer")
}).unregister()

const QuizTimerStart = (duration) => {
    timeElapsed = 0
    timerDuration = duration;
    tickListener.register()
};

register("worldLoad", () => quizTimer.unregister())


const chatTrig = registerPacketChat((message) => {
    if (message == "[STATUE] Oruo the Omniscient: I am Oruo the Omniscient. I have lived many lives. I have learned all there is to know.") QuizTimerStart(220);
    else if (message.match(/\[STATUE\] Oruo the Omniscient: .+ answered Question #\d correctly!/)) QuizTimerStart(140);
    quizTimer.register()
}).unregister()

if (c.QuizTimer) {
    chatTrig.register()
}

c.registerListener("Quiz Timer", (curr) => {
    if (curr) chatTrig.register()
    else chatTrig.unregister()
})