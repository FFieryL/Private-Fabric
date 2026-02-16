import { data, drawText, OverlayEditor, registerOverlay } from "../../managers/guimanager";
import dungeonUtils from "../../util/dungeonUtils";
import c from "../../config"
import { playSound } from "../../util/utils";
import { registerPacketChat } from "../../util/Events";

let playerName = "";
let currentProgress = "";
let bestProgress = 0;
let prevStage = 0;
const playersInMelody = [];
registerOverlay("MelodyTitle", { text: () => "&cFiery (Berserk) &dhas Melody! 1/4", align: "center", colors: false, setting: () => c.MelodyTitle})

const stepTrig = register("step", () => {
    const currentStage = dungeonUtils.getStage();
    if (currentStage !== prevStage) {
        resetMelody();
        prevStage = currentStage;
    }
}).setFps(1).unregister()

const chatTrig = registerPacketChat((message) => {
    if (!dungeonUtils.inStage([1, 2, 3, 4])) return;

    const melodyMatch = message.match(/^Party >[\s\[\w+\]]* (\w+): .*(\d\/\d|\d\d%)$/);

    if (melodyMatch) {
        const player = melodyMatch[1];

        if (!playersInMelody.includes(player) && player !== Player.getName()) playersInMelody.push(player);
        
        if (player === Player.getName()) return;

        let progress = melodyMatch[2];
        if (progress.includes("%")) {
            const percentage = parseInt(progress);
            if (!isNaN(percentage) && percentage >= 25) progress = Math.floor(percentage / 25) + "/4";
        }

        if (progress > bestProgress || bestProgress === 0) {
            playerName = player;
            bestProgress = progress;
            currentProgress = progress;
            playSound("random.orb", 0.7, 1);
            
        }
        return;
    }

    if (!currentProgress) {
        const firstMelody = message.match(/^Party >[\s\[\w+\]]* (\w+): .*melody/i)
        if(!firstMelody) return;
        const player = firstMelody[1];
        if (player === Player.getName()) return;
        playerName = player;
        currentProgress = "0/4";
        bestProgress = 0;
        if (!playersInMelody.includes(player)) playersInMelody.push(player);
        playSound("random.orb", 1, 0.8);
        return;
    }

    const terminalMatch = message.match(/^(\w+) activated a terminal! \(\d+\/\d+\)$/);
    if (!terminalMatch) return;
    const completedPlayer = terminalMatch[1];

    const index = playersInMelody.indexOf(completedPlayer);
    if (index > -1) playersInMelody.splice(index, 1);
    if (completedPlayer === playerName) resetMelody();
}).unregister()



const overlayTrig = register("renderOverlay", (cfx) => {
    if (OverlayEditor.isOpen()) return;
    if (!currentProgress || !dungeonUtils.inStage([1, 2, 3, 4])) return;
    const playerClass = dungeonUtils.getPlayerClass(playerName)
    const displayText = dungeonUtils.getClassColor(playerClass) + `${playerName} (${playerClass[0]}) &dhas Melody! ${currentProgress}`;
    drawText(cfx, displayText, data.MelodyTitle, true, "MelodyTitle")
}).unregister()

register("worldLoad", () => {
    resetMelody();
    prevStage = 0;
});

function resetMelody() {
    currentProgress = "";
    bestProgress = 0;
    playerName = "";
    playersInMelody.length = 0;
}

if (c.MelodyTitle) {
    resetMelody()
    stepTrig.register()
    chatTrig.register()
    overlayTrig.register()
}

c.registerListener("Melody Title", (curr) => {
    if (curr) {
        resetMelody()
        stepTrig.register()
        chatTrig.register()
        overlayTrig.register()
    }
    else {
        resetMelody()
        stepTrig.unregister()
        chatTrig.unregister()
        overlayTrig.unregister()
    }
})