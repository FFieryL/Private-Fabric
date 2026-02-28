import dungeonUtils from "../../util/dungeonUtils";
import c from "../../config"
import StarMob from "../../util/starMobUtils";
import { ArmorStand, EntityBat, EntityPlayer, EntityWither, ClientPlayer, getTablist, chat } from "../../util/utils";
import RenderUtils from "../../util/renderUtils"
import { onScoreboardLine, onTabLineUpdated, registerPacketChat } from "../../util/Events";

const starMobRegex = /✯ (.+).+❤$|^(Shadow Assassin)$/
let starMobs = new Set()
let trackedStands = new Set()
let shadowAssassins = []
let secretBats = []
let pests = []
let claimed = []

let validStarMobs = false
let validBats = false
let validSAs = false
let validPests = false

const smoothers = new Map();

/**
 * Gets or creates a smoother for a specific entity.
 * @param {Entity} entity 
 * @returns {SmoothPos}
 */
function getSmoother(entity) {
    const id = entity.getUUID().toString();
    if (!smoothers.has(id)) {
        smoothers.set(id, new RenderUtils.SmoothPos(0.15));
    }
    return smoothers.get(id);
}

function validEntity(entity) {
    if (!entity) return false
    else if ((entity instanceof ArmorStand) || (entity instanceof EntityWither) || (entity instanceof ClientPlayer)) return false;
    else return true;
}

function inGarden() {
    const lines = Scoreboard.getLines()
    if (!lines) return false

    return lines.some(l =>
        ChatLib.removeFormatting(l.getName()).includes("The Garden")
    )
}

const tickScanner = register("tick", () => {
    if (!(dungeonUtils.inDungeon) || dungeonUtils.inBoss) {
        trackedStands.clear()
        starMobs.clear()
        shadowAssassins = []
        secretBats = []
        return;
    }
    trackedStands.clear()
    starMobs.clear()
    shadowAssassins = []
    secretBats = []
    let SAsFound = []

    if (c.starMobESP) {
        const allPossibleMobs = World.getAllEntities().filter(e => {
            const mcEnt = e.toMC();
            return validEntity(mcEnt);
        });

        World.getAllEntitiesOfType(ArmorStand).forEach(stand => {

            if (trackedStands.has(stand)) return;
            const mcStand = stand.toMC();
            if (!mcStand.isAlive()) return;

            const name = stand.getName();
            if (!starMobRegex.test(name)) return;


            const box = mcStand.getBoundingBox().offset(0.0, -1.0, 0.0).expand(0.3, 0.5, 0.3);


            for (let mob of allPossibleMobs) {

                if (mob.distanceTo(stand) > 8) continue;

                const ent = mob.toMC();


                if (ent.getBoundingBox().expand(0.3, 0.5, 0.3).intersects(box)) {
                    let match = name.match(starMobRegex);

                    if (match) {

                        let starMob = new StarMob(mob, stand);
                        let [_, mobName, sa] = match;

                        let height = 2;
                        if (!sa) {
                            if (mobName.includes("Fels")) height = 3;
                            if (mobName.includes("Withermancer")) height = 2.5;
                        } else {
                            height = 1.8;
                        }

                        starMob.height = height;


                        trackedStands.add(stand);
                        starMobs.add(starMob);

                        break;
                    }
                }
            }
        });

        if (trackedStands.size) validStarMobs = true
        else validStarMobs = false




        World.getAllEntitiesOfType(EntityPlayer).forEach(entity => {
            if (entity.getName().includes("Shadow Assassin")) {
                SAsFound.push(entity)
            }
        })

        shadowAssassins = SAsFound;
        if (shadowAssassins.length) validSAs = true
        else validSAs = false
    }



    if (c.batESP) {
        let batsFound = []
        let hp = [100.0, 200.0, 220.0, 400.0, 800.0]
        World.getAllEntitiesOfType(EntityBat).forEach(bat => {
            if (hp.includes(bat.getMaxHP())) batsFound.push(bat)
        })

        secretBats = batsFound
        if (secretBats.length) validBats = true
        else validBats = false
    }

    if (validStarMobs || validSAs || validBats || validPests) mobRenderer.register()
    else mobRenderer.unregister()
}).unregister()

//   Plot - 3   Plot - 6 ൠ x1 
const pestsInScoreboardPattern = / ⏣ The Garden ൠ x(\d+)/;
const noPests = / ⏣ Plot - (\d+)/
const hasPests = /   Plot - (\d+) ൠ x(\d+)/
let gardenRegistered = false
onScoreboardLine((line, text) => {
    if (text.removeFormatting().match(hasPests) && c.pestESP && !gardenRegistered) {
        gardenTickChecker.register()
        gardenRegistered = true
    }
    else if (gardenRegistered && text.removeFormatting().match(noPests)){
        gardenTickChecker.unregister()
        gardenRegistered = false
        pests = []
        validPests = false
    }
})

const gardenTickChecker = register("tick", () => {
    if (!c.pestESP || !inGarden()) return;
    pests = []
    // Pests
    if (c.pestESP) {
        let pestsFound = []
        let armorStands = World.getAllEntitiesOfType(ArmorStand)
        for (let i = 0; i < armorStands.length; ++i) {
            let armorStand = armorStands[i]
            let helmet = armorStand.getStackInSlot(5)
            if (!helmet) continue
            let helmetName = ChatLib.removeFormatting(helmet.getName());
            if (helmetName.includes("Head")) pestsFound.push(armorStand);
        }

        pests = pestsFound

        if (pests.length) {
            validPests = true
        } else {
            validPests = false
        }
    }

    if (validPests) {
        mobRenderer.register()
    } else {
        mobRenderer.unregister()
    }

}).unregister();

const inMineshaft = onTabLineUpdated((text) => {
    if (text == ("Area: Mineshaft")) {
        corpseESP.register()
        inMineshaft.unregister()
    }
    else if (text.includes("Dungeon:") || text.includes("Area:")) inMineshaft.unregister()
})


const corpseESP = register("renderWorld", () => {
    const entities = World.getAllEntitiesOfType(ArmorStand).filter(entity => entity?.getName() == "Armor Stand" && !entity.isInvisible())
    for (let i = 0; i < entities.length; i++) {
        let helmetName = entities[i].getStackInSlot(5)?.getName()?.removeFormatting()
        if (claimed.some(e => entities[i].distanceTo(e) < 7) || !helmetName)
            continue;
        let text, rgb
        switch (helmetName) {
            case "Lapis Armor Helmet":
                text = "Lapis"
                rgb = [0, 0, 1, 0.6]
                break
            case "Mineral Helmet":
                text = "Tungsten"
                rgb = [1, 1, 1, 0.6]
                break
            case "Yog Helmet":
                text = "Umber"
                rgb = [181 / 255, 98 / 255, 34 / 255, 0.6]
                break
            case "Vanguard Helmet":
                text = "Vanguard"
                rgb = [242 / 255, 36 / 255, 184 / 255, 0.6]
                break
            default:
                continue
        }

        drawCoolWaypoint(Math.floor(entities[i].getRenderX()), Math.floor(entities[i].getRenderY()), Math.floor(entities[i].getRenderZ()), rgb, {name: text, showDist: true})
    }
}).unregister()


registerPacketChat((message) => {
    if ((/\s(.+) CORPSE LOOT!\s/).test(message)) claimed.push(Player.asPlayerMP().getPos())
})
function drawCoolWaypoint(x, y, z, color, {name = "", showDist = true, phase = true}) {
    const box = RenderUtils.getBox(x + 0.5, y, z + 0.5, 1, 1)
    RenderUtils.drawOutline(box, color, phase, 2)
    RenderUtils.drawFilled(box, RenderUtils.reduceAlpha(color, 0.38), phase)

    if (name || showDist) {
        const [px, py, pz] = [Player.getRenderX(), Player.getRenderY(), Player.getRenderZ()]
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2 + (z - pz) ** 2 )

        const label = name ? `§a${name} §b(${Math.round(dist)}m)` : `§b(${Math.round(dist)}m)`

        RenderUtils.drawText(label, x + 0.5, y + 1.5, z + 0.5, Math.max(1.0, dist * 0.05), false)
    }
}


const mobRenderer = register("renderWorld", () => {
    const phase = c.starMobESPThruBlocks
    const w = parseFloat(c.starHighlightSize);
    const highlighttype = c.starHighlightType == 1
    if (validStarMobs) {
        const normalColor = c.starMobESPColor
        const felColor = c.starMobESPColorFel

        for (let mob of starMobs) {
            if (!mob) continue;
            const pos = getSmoother(mob.entity).update(
                mob.entity.getRenderX(),
                mob.entity.getRenderY(),
                mob.entity.getRenderZ()
            );

            let color = normalColor;
            if (mob.mobType === "fel") color = felColor;

            let newBox = RenderUtils.getBox(pos.x, pos.y, pos.z, w, mob.height)

            RenderUtils.drawOutline(newBox, color, phase, 2)
            if (highlighttype) RenderUtils.drawFilled(newBox, RenderUtils.reduceAlpha(color, 0.3), phase)
        }
    }

    if (validSAs) {
        for (let i = 0; i < shadowAssassins.length; i++) {
            let sa = shadowAssassins[i]
            const pos = getSmoother(sa).update(sa.getRenderX(), sa.getRenderY(), sa.getRenderZ());
            const h = 1.8

            let newBox = RenderUtils.getBox(pos.x, pos.y, pos.z, w, h)

            RenderUtils.drawOutline(newBox, c.starMobESPColorSA, phase, 2)
            if (highlighttype) RenderUtils.drawFilled(newBox, RenderUtils.reduceAlpha(c.starMobESPColorSA, 0.3), phase)
        }
    }

    if (validBats) {
        let w = 0.6
        let h = 0.9
        const batPhase = c.batESPThruBlocks
        const batHighlightType = c.batHighlightType
        const batColor = c.batESPColor
        for (let i = 0; i < secretBats.length; ++i) {
            let bat = secretBats[i]
            const pos = getSmoother(bat).update(bat.getRenderX(), bat.getRenderY(), bat.getRenderZ());
            let newBox = RenderUtils.getBox(pos.x, pos.y, pos.z, w, h)
            RenderUtils.drawOutline(newBox, batColor, batPhase, 2)
            if (batHighlightType) RenderUtils.drawFilled(newBox, RenderUtils.reduceAlpha(batColor, 0.3), batPhase)
        }
    }

    if (validPests) {
        let w = 0.8
        let h = 0.8
        let outlineColor = c.pestESPColor
        let fillColor = c.pestESPColor
        let tracerColor = c.pestESPColor
        const phase = c.pestESPThruBlocks
        for (let i = 0; i < pests.length; ++i) {
            let pest = pests[i]
            const pos = getSmoother(pest).update(pest.getRenderX(), pest.getRenderY(), pest.getRenderZ());

            let drawY = pos.y + 1.2;
            let newBox = RenderUtils.getBox(pos.x, drawY, pos.z, 0.8, 0.8)

            if (c.pestESPHighlightType == 1) RenderUtils.drawFilled(newBox, fillColor, phase)
            RenderUtils.drawOutline(newBox, outlineColor, phase, 2)

            if (!c.pestESPTracer) continue;
            let entityPos = [pos.x, drawY, pos.z]
            RenderUtils.drawTracer(RenderUtils.calculateCameraPos(), entityPos, tracerColor, true, 5)
        }
    }
}).unregister()

register("worldUnload", () => {
    starMobs.clear()
    trackedStands.clear()
    shadowAssassins = []
    secretBats = []
    pests = []
    validStarMobs = false
    validBats = false
    validSAs = false
    validPests = false
    gardenTickChecker.unregister()
    gardenRegistered = false
    smoothers.clear();
    corpseESP.unregister()
    claimed.length = 0
    if (c.corpseEsp) inMineshaft.register()
})

if (c.starMobESP) tickScanner.register()

if (c.batESP) tickScanner.register()

c.registerListener("Star mob Highlight", (prev, curr) => {
    if (curr) {
        tickScanner.register()
    } else {
        if (!c.batESP) {
            tickScanner.unregister()
            mobRenderer.unregister()
            smoothers.clear();
        }
        starMobs.clear()
        trackedStands.clear()
        shadowAssassins = []
        validSAs = false
        validStarMobs = false
    }
})

c.registerListener("Bat Highlight", (prev, curr) => {
    if (curr) {
        tickScanner.register()
    } else {
        if (!c.starMobESP) {
            tickScanner.unregister()
            mobRenderer.unregister()
            smoothers.clear();
        }
        secretBats = []
        validBats = false
    }
})

