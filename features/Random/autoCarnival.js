import { chat, rightClick } from "../../util/utils";


const EntityZombie = Java.type('net.minecraft.entity.mob.ZombieEntity')

let lampcoords = [
    [-96, 76, 61],
    [-99, 77, 62],
    [-102, 75, 62],
    [-106, 77, 61],
    [-109, 75, 60],
    [-112, 76, 58],
    [-115, 77, 55],
    [-117, 76, 52],
    [-118, 76, 49],
    [-119, 75, 45],
    [-119, 77, 42],
    [-118, 76, 39]
];
let rotationInProgress = false

function getEyePos() {
    const eyeHeight = Player.isSneaking() ? 1.27 : 1.62;
    return {
        x: Player.getX(),
        y: Player.getY() + eyeHeight,
        z: Player.getZ()
    };
}

export function calcYawPitch(target, plrPos) {
    if (!plrPos) plrPos = getEyePos();
    let d = {
        x: target.x - plrPos.x,
        y: target.y - plrPos.y,
        z: target.z - plrPos.z
    };
    let yaw = 0;
    let pitch = 0;
    if (d.x != 0) {
        if (d.x < 0) { yaw = 1.5 * Math.PI; } else { yaw = 0.5 * Math.PI; }
        yaw = yaw - Math.atan(d.z / d.x);
    } else if (d.z < 0) { yaw = Math.PI; }
    d.xz = Math.sqrt(Math.pow(d.x, 2) + Math.pow(d.z, 2));
    pitch = -Math.atan(d.y / d.xz);
    yaw = -yaw * 180 / Math.PI;
    pitch = pitch * 180 / Math.PI;
    if (pitch < -90 || pitch > 90 || isNaN(yaw) || isNaN(pitch)) return;

    return [yaw, pitch]

}

function rotate(yaw, pitch) {
    if (Number.isNaN(yaw) || Number.isNaN(pitch)) return

    Player.getPlayer().setYaw(yaw)
    Player.getPlayer().setPitch(pitch)
}

function rotateSmoothly(targetYaw, targetPitch, time = 120, onFinish = null) {
    if (rotationInProgress) return
    rotationInProgress = true

    // normalize target yaw
    while (targetYaw > 180) targetYaw -= 360
    while (targetYaw < -180) targetYaw += 360

    const startYaw = Player.getYaw()
    const startPitch = Player.getPitch()
    const startTime = Date.now()

    // shortest path yaw
    let deltaYaw = targetYaw - startYaw
    while (deltaYaw > 180) deltaYaw -= 360
    while (deltaYaw < -180) deltaYaw += 360

    const deltaPitch = targetPitch - startPitch

    const trigger = register("step", () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / time, 1)

        const eased = bezier(progress, 0, 0.6, 0.2, 1)

        const newYaw = startYaw + deltaYaw * eased
        const newPitch = startPitch + deltaPitch * eased

        rotate(newYaw, newPitch)

        if (progress >= 1) {
            trigger.unregister()
            rotationInProgress = false
            if (onFinish) onFinish()
        }
    })
}

function bezier(t, p0, p1, p2, p3) {
    return (1 - t) ** 3 * p0 +
        3 * (1 - t) ** 2 * t * p1 +
        3 * (1 - t) * t ** 2 * p2 +
        t ** 3 * p3
}




function getTarget() {
    const Zombies = World.getAllEntitiesOfType(EntityZombie);
    if (!Zombies) return;

    let itemLists = {
        Diamond: [],
        Golden: [],
        Iron: [],
        Leather: []
    };

    Zombies.forEach(Zombie => {
        let currentZombie = Zombie
        let chestplate = currentZombie.getStackInSlot(4)
        if (!chestplate) return;
        let chestplatename = chestplate.getName().removeFormatting();
        let forcedY = Zombie.getY() >= 72 ? 72 : 71;
        let motionX = Zombie.getMotionX()
        let motionZ = Zombie.getMotionZ()

        let speed = Math.sqrt(motionX * motionX + motionZ * motionZ)

        let targetcoord

        if (speed < 0.03) {
            // zombie is juking / standing still
            targetcoord = {
                x: Zombie.getX(),
                y: forcedY + Zombie.getEyeHeight() + 0.52,
                z: Zombie.getZ()
            }
        } else {
            // normal prediction
            targetcoord = {
                x: Zombie.getX() + motionX * (8 + offsetNum),
                y: forcedY + Zombie.getEyeHeight() + 0.52,
                z: Zombie.getZ() + motionZ * (8 + offsetNum)
            }
        }
        if (Player.asPlayerMP().distanceTo(Zombie.getX(), Zombie.getY(), Zombie.getZ()) > 40) return;
        for (let key in itemLists) {
            if (chestplatename.includes(key)) {
                itemLists[key].push(targetcoord);
                break;
            }
        }
    });

    let lamplist = [];

    lampcoords.forEach(coord => {
        let lit = World.getBlockAt(...coord)?.getState().toString().includes("lit=true");
        if (!lit) return;
        lamplist.push({ x: coord[0] + 0.5, y: coord[1] + 0.6, z: coord[2] + 0.5 });
    });

    let targetlist = [
        ...itemLists.Diamond,
        ...lamplist,
        ...itemLists.Golden,
        ...itemLists.Iron,
        ...itemLists.Leather
    ];

    return targetlist;
}

let startcarn = false
let lastClick = 0
let rotateDelay = 0
let offsetNum = 0

register("tick", () => {
    if (!startcarn) return;
    if (Date.now() - lastClick < 150) return;
    const playerHolding = Player.getHeldItem()
    if (!playerHolding?.getName()?.removeFormatting()?.includes("Dart")) return;
    const Target = getTarget()
    if (!Target) return;
    const currentTarget = Target.shift()
    if (!currentTarget) return;
    let [yaw, pitch] = calcYawPitch(currentTarget)
    if (rotateDelay == 0) {
        rotate(yaw, pitch)
        Client.scheduleTask(0, () => rightClick(false, false))
    }
    else {
        rotateSmoothly(yaw, pitch, rotateDelay, () => {
            rightClick(false, false)
            lastClick = Date.now()
        })
    }

})


register("command", (...args) => {
    if (!args[0]) {
        startcarn = !startcarn
        chat("Auto Carnival: " + startcarn)
        return
    }
    let num = parseInt(args[0])
    if (isNaN(num)) {
        ChatLib.chat("&cPlease enter a valid number between 0 - 200!")
        return
    }

    // Clamp between 0 and 200
    if (num < 0 || num > 200) {
        ChatLib.chat("&Rotate Delay must be between 0 and 200!")
        return
    }

    rotateDelay = num

    if (args.length >= 2) {
        let offsetNum = parseInt(args[1])

        if (isNaN(offsetNum)) {
            ChatLib.chat("&cOffset must be a valid number!")
            return
        }
        if (offsetNum < 0 || offsetNum > 7) {
            ChatLib.chat("&cOffset must be between 0 and 7!")
            return
        }
        offset = offsetNum
        ChatLib.chat(`&aSet rotate to ${num}ms with offset ${offsetNum}`)
    } else {
        ChatLib.chat(`&aSet rotate to ${num}ms`)
    }
}).setName("startautocarnival")