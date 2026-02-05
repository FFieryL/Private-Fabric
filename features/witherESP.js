import c from "../config"
import dungeonUtils from "../util/dungeonUtils"
import { bossnames, chat, EntityWither } from "../util/utils"
import { Immediate } from "../../barrl/Barrl"

const worldTrig = register("worldUnload", () => {
    renderTrig.unregister()
}).unregister()

const chatTrig = register("chat", (name, event) => {
    name = name.removeFormatting();
    if (name === "Wither King") {
        renderTrig.unregister()
        return;
    }
    if (bossnames.some(boss => boss.includes(name))) renderTrig.register()
}).setCriteria("[BOSS] ${name}: ${*}").unregister()


const renderTrig = register("renderWorld", () => {
    const wither = World.getAllEntitiesOfType(EntityWither).find(entity => !entity.isInvisible() && entity.getHP() != 300)
    if (!wither) return
    let [x, y, z] = [wither.getRenderX(), wither.getRenderY(), wither.getRenderZ()]
    const h = 3.4
    const w = 1
    const boxcolors = c.witherESPColorBox
    const fillcolors = c.witherESPColorFill
    const phase = c.witherThruBlocks
    if (c.espWitherType == 1) Immediate.renderFilledBox(x - (w / 2), y, z - (w / 2), w, h, fillcolors, phase, true)
    else Immediate.renderBox(x - (w / 2), y, z - (w / 2), w, h, boxcolors, phase, true)

    //Immediate.renderTracer(x, y + wither.getHeight() / 2, z, boxcolors, phase, true, 2)
    //if (c.espWitherType == 1) RenderUtils.INSTANCE.drawFilledAABB(newBox, colorFill, phase)
    //RenderUtils.INSTANCE.drawOutlinedAABB(newBox, colorBox, 2, phase, true)
    //if(c.witherTracer && dungeonUtils.currentPhase == 3 && dungeonUtils.currentStage == 5) Tracer(x, y + wither.getHeight() / 2, z, c.witherESPColorBox[0], c.witherESPColorBox[1], c.witherESPColorBox[2], 2)
}).unregister()

if (c.espWither) {
    if((dungeonUtils.currentPhase > 0 && dungeonUtils.currentPhase < 5)) renderTrig.register()
    chatTrig.register()
}

c.registerListener("Wither Highlight", (curr) => {
    if (curr) {
        if((dungeonUtils.currentPhase > 0 && dungeonUtils.currentPhase < 5)) renderTrig.register()
        chatTrig.register()
        worldTrig.register()
    }
    else {
        renderTrig.unregister()
        chatTrig.unregister()
        worldTrig.unregister()
    }
})
