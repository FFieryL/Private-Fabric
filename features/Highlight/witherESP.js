import c from "../../config"
import dungeonUtils from "../../util/dungeonUtils"
import { bossnames, EntityWither } from "../../util/utils"
import RenderUtils from "../../util/renderUtils"

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

    const witherBox = RenderUtils.getBox(x, y, z, w, h)

    const phase = c.witherThruBlocks

    if (c.espWitherType == 1) RenderUtils.drawFilled(witherBox, c.witherESPColorFill, phase)
    RenderUtils.drawOutline(witherBox, c.witherESPColorBox, phase, 2)

    if(c.witherTracer && dungeonUtils.currentPhase == 3 && dungeonUtils.currentStage == 5) {
        let entityPos = [x,y + wither.getHeight() / 2,z]
        RenderUtils.drawTracer(RenderUtils.calculateCameraPos(), entityPos, c.witherESPColorTracer, phase, 5)
    }
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
