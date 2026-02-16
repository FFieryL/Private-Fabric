import c from "../../config"
import dungeonUtils from "../../util/dungeonUtils"
import { bossnames, EntityWither } from "../../util/utils"
import RenderUtils from "../../util/renderUtils"

let cachedWither = null
const smoother = new RenderUtils.SmoothPos(0.15)


const witherFinder = register("tick", () => {
    cachedWither = World.getAllEntitiesOfType(EntityWither)
        .find(entity => !entity.isInvisible() && entity.getHP() != 300)

    if (!cachedWither) smoother.reset()
}).unregister()

const worldTrig = register("worldUnload", () => {
    renderTrig.unregister()
    cachedWither = null
    smoother.reset()
}).unregister()

const chatTrig = dungeonUtils.onBossMessage((name) => {
    if (name === "Wither King") {
        renderTrig.unregister()
        witherFinder.unregister()
        return
    }
    else if (bossnames.some(boss => boss.includes(name))) {
        renderTrig.register()
        witherFinder.register()
    }
}).unregister()

const renderTrig = register("renderWorld", () => {
    if (!cachedWither) return

    const pos = smoother.update(cachedWither.getRenderX(), cachedWither.getRenderY(), cachedWither.getRenderZ())

    const h = 3.4
    const w = 1

    const witherBox = RenderUtils.getBox(pos.x, pos.y, pos.z, w, h)
    const phase = c.witherThruBlocks

    if (c.espWitherType == 1) RenderUtils.drawFilled(witherBox, c.witherESPColorFill, phase)

    RenderUtils.drawOutline(witherBox, c.witherESPColorBox, phase, 2)

    if (c.witherTracer && dungeonUtils.currentPhase == 3 && dungeonUtils.currentStage == 5) {
        const entityPos = [pos.x, pos.y + cachedWither.getHeight() / 2, pos.z]
        RenderUtils.drawTracer(
            RenderUtils.calculateCameraPos(),
            entityPos,
            c.witherESPColorTracer,
            phase,
            5
        )
    }
}).unregister()

if (c.espWither) {
    if ((dungeonUtils.currentPhase > 0 && dungeonUtils.currentPhase < 5))
        renderTrig.register()
    chatTrig.register()
}

c.registerListener("Wither Highlight", (curr) => {
    if (curr) {
        if ((dungeonUtils.currentPhase > 0 && dungeonUtils.currentPhase < 5))
            renderTrig.register()
        chatTrig.register()
        worldTrig.register()
    }
    else {
        renderTrig.unregister()
        chatTrig.unregister()
        worldTrig.unregister()
        smoothPos = null
        cachedWither = null
    }
})
