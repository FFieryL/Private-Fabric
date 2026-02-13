import dungeonUtils from "../../util/dungeonUtils";
import c from "../../config"
import StarMob from "../../util/starMobUtils";
import { ArmorStand, EntityBat, EntityPlayer, EntityWither, ClientPlayer, getTablist} from "../../util/utils";
import RenderUtils from "../../util/renderUtils"
import { onScoreboardLine } from "../../util/Events";

const starMobRegex = /✯ (.+).+❤$|^(Shadow Assassin)$/
let starMobs = new Set()
let trackedStands = new Set()
let shadowAssassins = []
let secretBats = []
let pests = []

let validStarMobs = false
let validBats = false
let validSAs = false
let validPests = false

function validEntity(entity) {
    if (!entity) return false
    else if ((entity instanceof ArmorStand) || (entity instanceof EntityWither) || (entity instanceof ClientPlayer)) return false;
    else return true;
}

function inGarden() {
    const names = getTablist(false)
    if (!names) return false;
    const area = names.find(tab => tab.includes("Area"));
    if (!area || !area.includes("Garden")) return false;
    return true;
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
        // const allEntities = World.getAllEntities().map(e => ({ ct: e, mc: e.toMC() }));
        // const stands = allEntities.filter(e => e.ct.getName().includes("✯"));

        // stands.forEach(stand => {
        //     const mcArmor = stand.mc;
        //     if (!mcArmor.isAlive()) return;

        //     // Pre-match regex so we don't do it inside the next loop
        //     const name = stand.ct.getName();
        //     const match = name.match(starMobRegex);
        //     if (!match) return;

        //     const boundingBox = mcArmor.getBoundingBox()
        //         .offset(0.0, -1.0, 0.0)
        //         .expand(0.5, 0.5, 0.5);

        //     // Only look for nearby entities to check intersection
        //     const possibleMobs = allEntities.filter(e =>
        //         validEntity(e.mc) &&
        //         e.ct.distanceTo(stand.ct) < 7
        //     );

        //     for (let mob of possibleMobs) {
        //         if (mob.mc.getBoundingBox().intersects(boundingBox)) {
        //             let starMob = new StarMob(stand.ct);
        //             let [_, mobName, sa] = match;

        //             let height = 2;
        //             if (!sa) {
        //                 if (mobName.includes("Fels")) height = 3;
        //                 if (mobName.includes("Withermancer")) height = 2.5;
        //             } else {
        //                 height = 1.8;
        //             }

        //             starMob.height = height;
        //             trackedStands.add(stand.ct);
        //             starMobs.add(starMob);
        //             break; // Found the mob for this stand, stop looking for this specific stand
        //         }
        //     }
        // });
        // 1. Get the list of actual mobs ONCE per trigger execution
        // This avoids calling World.getAllEntities() hundreds of times inside the loop
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


            const box = mcStand.getBoundingBox().offset(0.0, -1.0, 0.0).expand(0.5, 0.75, 0.5);


            for (let mob of allPossibleMobs) {

                if (mob.distanceTo(stand) > 7) continue;

                const ent = mob.toMC();


                if (ent.getBoundingBox().expand(0.5, 0.75, 0.5).intersects(box)) {
                    let match = name.match(starMobRegex);

                    if (match) {

                        let starMob = new StarMob(stand);
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

        // World.getAllEntitiesOfType(ArmorStand).forEach(stand => {
        //     const mcStand = stand.toMC()
        //     if (!mcStand.isAlive()) return
        //     if (!starMobRegex.test(stand.getName())) return
        //     const box = mcStand.getBoundingBox().offset(0.0, -1.0, 0.0).expand(0.5, 0.75, 0.5)

        //     World.getAllEntities().forEach(entities => {
        //         const ent = entities.toMC()
        //         if (!validEntity(ent)) return
        //         if (ent.getBoundingBox().expand(0.5, 0.75, 0.5).intersects(box)) {
        //             let match = stand.getName().match(starMobRegex)
        //             if (match) {
        //                 let starMob = new StarMob(stand)
        //                 let [_, mobName, sa] = match

        //                 let height = 2
        //                 if (!sa) {
        //                     if (mobName.includes("Fels")) {
        //                         height = 3;
        //                     }
        //                     if (mobName.includes("Withermancer")) height = 2.5
        //                 }
        //                 else {
        //                     height = 1.8
        //                 }
        //                 starMob.height = height

        //                 trackedStands.add(stand)
        //                 starMobs.add(starMob)
        //             }
        //         }
        //     })
        // })


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

const pestsInScoreboardPattern = / ⏣ The Garden ൠ x(\d+)/;
let gardenRegistered = false
onScoreboardLine((line, text) => {
    if (text.removeFormatting().match(pestsInScoreboardPattern) && c.pestESP && !gardenRegistered) {
        gardenTickChecker.register()
        gardenRegistered = true
    }
})

const gardenTickChecker = register("tick", () => {

    if (!c.pestESP || !inGarden()) return;

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

const mobRenderer = register("renderWorld", () => {
    const phase = c.starMobESPThruBlocks
    const w = parseFloat(c.starHighlightSize);
    const highlighttype = c.starHighlightType == 1
    if (validStarMobs) {
        const normalColor = c.starMobESPColor
        const felColor = c.starMobESPColorFel

        for (let mob of starMobs) {
            if (!mob) continue;
            let x = mob.entity.getRenderX()
            let y = mob.entity.getRenderY() - mob.height
            let z = mob.entity.getRenderZ()
            let h = mob.height

            let color = normalColor;
            if (mob.mobType === "fel") color = felColor;

            let newBox = RenderUtils.getBox(x, y, z, w, h)

            RenderUtils.drawOutline(newBox, color, phase, 2)
            if (highlighttype) RenderUtils.drawFilled(newBox, color, phase)
        }
    }

    if (validSAs) {
        for (let i = 0; i < shadowAssassins.length; i++) {
            let sa = shadowAssassins[i]
            let [x, y, z] = [sa.getRenderX(), sa.getRenderY(), sa.getRenderZ()]
            let h = 1.8

            let newBox = RenderUtils.getBox(x, y, z, w, h)

            RenderUtils.drawOutline(newBox, c.starMobESPColorSA, phase, 2)
            if (highlighttype) RenderUtils.drawFilled(newBox, c.starMobESPColorSA, phase)
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
            let [x, y, z] = [bat.getRenderX(), bat.getRenderY(), bat.getRenderZ()]
            let newBox = RenderUtils.getBox(x, y, z, w, h)
            RenderUtils.drawOutline(newBox, batColor, batPhase, 2)
            if (batHighlightType) RenderUtils.drawFilled(newBox, batColor, batPhase)
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
            let [x, y, z] = [pest.getRenderX(), pest.getRenderY() + 1.2, pest.getRenderZ()]
            let newBox = RenderUtils.getBox(x, y, z, w, h)

            if (c.pestESPHighlightType == 1) RenderUtils.drawFilled(newBox, fillColor, phase)
            RenderUtils.drawOutline(newBox, outlineColor, phase, 2)
            if (!c.pestESPTracer) continue;
            let entityPos = [x, y + 0.6, z]
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
        }
        secretBats = []
        validBats = false
    }
})

