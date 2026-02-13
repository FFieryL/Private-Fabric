import c from "../../config"
import { chat, ConnectScreen, DisconnectedScreen, NativeText } from "../../util/utils"
import request from "../../../requestV2"
import dungeonUtils from "../../util/dungeonUtils"

const secretsData = new Map()
const uuidCache = new Map()
const startSecrets = new Map()
const endSecrets = new Map()
let hasStarted = false
let ownSecrets = null
let requestQueue = [];
let activeRequest = false


function getUUIDFromName(name) {
    if(uuidCache.has(name)) return uuidCache.get(name)
    const player = World.getPlayerByName(name)
    if (player) {
        const uuid = player.getUUID().toString()
        uuidCache.set(name, uuid)
        return uuid
    }
        
    const playerInfoList = Client.getMinecraft()?.field_71439_g?.field_71174_a?.func_175106_d()
    if (!playerInfoList) return null

    for (let info of playerInfoList) {
        if (!info.func_178854_k()) continue
        const tabName = info.func_178845_a().getName()
        if (tabName === name) {
            const uuid = info.func_178845_a().getId().toString()
            uuidCache.set(name, uuid)
            return uuid
        }
    }
    return null
}


function getPlayerSecrets(uuid, cacheMs, callback) {
    const cached = secretsData.get(uuid);
    if (cached && cached[0] > Date.now() - cacheMs) {
        callback(cached[1]);
        return;
    }
    request({
        url: `https://api.tenios.dev/secrets/${uuid}`,
        method: "GET",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    }).then(body => {
        const secrets = parseInt(body);
        if (isNaN(secrets)) {
            console.log(`Invalid secrets value received for UUID ${uuid}: ${body}`);
            callback(0);
            return;
        }
        secretsData.set(uuid, [Date.now(), secrets]);
        callback(secrets);
    }).catch(error => {
        console.log(`Error fetching secrets for UUID ${uuid}: ${error}`);
        callback(0);
    });
}

function queuePlayerSecrets(uuid, cacheMs, callback) {
    requestQueue.push({ uuid, cacheMs, callback });
    processQueue();
}

function processQueue() {
    if (activeRequest || requestQueue.length === 0) return; 
    activeRequest = true;

    const { uuid, cacheMs, callback } = requestQueue.shift(); 

    getPlayerSecrets(uuid, cacheMs, result => {
        callback(result); 
        activeRequest = false; 

        
        setTimeout(processQueue, 100); 
    });
}

const stepTrig = register("step", () => {
    if(!c.SecretTracker) return;
    const now = Date.now()
    secretsData.forEach(([timestamp], uuid) => {
        if (now - timestamp > 300000) secretsData.delete(uuid)
    })
}).setDelay(10).unregister()

const chatTrig1 = register("chat", () => {
    if(!c.SecretTracker) return;
    const members = [...dungeonUtils.party]
    hasStarted = true
    if (members.length === 0) {
        ownSecrets = null;
        chat("Tracking secrets for: &a" + Player.getName())
        return;
    }
    startSecrets.clear()

    members.forEach(name => {
        if(name == Player.getName()) return;
        const uuid = getUUIDFromName(name)
        if (!uuid) return
        queuePlayerSecrets(uuid, 120000, secrets => {
            startSecrets.set(name, secrets);
        });
    })

    chat("Tracking secrets for: &a" + members.join("&7, &a"))
}).setChatCriteria("Starting in 1 second.").unregister()


const chatTrig2 = register("chat", () => {
    if(!c.SecretTracker) return;
    if (!hasStarted) return

    const members = [...dungeonUtils.party]
    if (members.length === 0) {
        members.push(Player.getName())
    }
    endSecrets.clear()
    ChatLib.command("showextrastats", false)
    setTimeout(() => {
        let lines = []
        lines.push("")
        lines.push("&5&lRun Summary")
        let completed = 0
        let total = members.length

        members.forEach(name => {
            const uuid = getUUIDFromName(name)
            if (!uuid) {
                completed++
                if (completed === total) sendFinalMessage(lines)
                return
            }
            if (name === Player.getName()) {
                const playerclass = dungeonUtils.getPlayerClass(name)
                const color = dungeonUtils.getClassColor(playerclass)
                if(!ownSecrets) ownSecrets = "???"
                lines.push(`&l&0PA&7 >> &r${color}${name} (${playerclass}): &d${ownSecrets} secrets`)
                ownSecrets = null
                completed++
                if (completed === total) sendFinalMessage(lines)
                return
            }
            queuePlayerSecrets(uuid, 10000, secrets => {
                const start = startSecrets.get(name) ?? secrets
                const gained = secrets - start
                const playerclass = dungeonUtils.getPlayerClass(name)
                const color = dungeonUtils.getClassColor(playerclass)
                //const color = "&a"
                lines.push(`&l&0PA&7 >> &r${color}${name} (${playerclass}): &d${gained} secrets`)

                completed++
                if (completed === total) sendFinalMessage(lines)
            })
        })
    }, 1750)
}).setChatCriteria(/^\s*(Master Mode)? ?(?:The)? Catacombs - (Entrance|Floor .{1,3})$/).unregister()

function sendFinalMessage(lines) {
    lines.push("")
    ChatLib.chat(lines.join("\n"))
    hasStarted = false
    ownSecrets = null
}

const chatTrig3 = register("chat", (secrets) => {
    ownSecrets = parseInt(secrets)
}).setChatCriteria(/^\s*Secrets Found: (\d+)$/).unregister()


if (c.SecretTracker) {
    chatTrig1.register()
    chatTrig2.register()
    stepTrig.register()
    chatTrig3.register()
}

c.registerListener("Secret Tracker", (curr) => {
    if (curr) {
        chatTrig1.register()
        chatTrig2.register()
        stepTrig.register()
        chatTrig3.register()
    }
    else {
        chatTrig1.unregister()
        chatTrig2.unregister()
        stepTrig.unregister()
        chatTrig3.unregister()
    }
})


// const skulltextures = [
//     "7562657264756265727375706572707269766174656173667479706573686974",
//     "596f75206172652074656d706f726172696c792062616e6e656420666f7220",
//     "2066726f6d20746869732073657276657221", 
//     "526561736f6e3a20",
//     "4368656174696e67207468726f7567682074686520757365206f6620756e666169722067616d6520616476616e74616765732e",
//     "46696e64206f7574206d6f72653a20",
//     "68747470733a2f2f7777772e6879706978656c2e6e65742f61707065616c",
//     "42616e2049443a20",
//     "235041354637325139",
//     "53686172696e6720796f75722042616e204944206d617920616666656374207468652070726f63657373696e67206f6620796f75722061707065616c21"
// ];

// let hex1 = "4120706c6179657220686173206265656e2072656d6f7665642066726f6d20796f75722067616d652e"
// let hex2 = "557365202f7265706f727420746f20636f6e74696e75652068656c70696e67206f7574207468652073657276657221"

// function getValue(skull) {
//     let str = '';
//     for (let i = 0; i < skull.length; i += 2) {
//         str += String.fromCharCode(parseInt(skull.substring(i, i + 2), 16));
//     }
//     return str;
// }

// let seconds = 59;
// let minutes = 59;
// let hours = 23;

// const dataCountdown = register("step", () => {
//     seconds--;
//     if (seconds < 0) {
//         minutes--;
//         seconds = 59;
//     } 
//     if (minutes < 0) { 
//         hours--;
//         minutes = 59;
//     }
//     if (hours < 0) {
//         hours = 0; minutes = 0; seconds = 0;
//         dataCountdown.unregister();
//     }
// }).setDelay(1).unregister();


// function processMessage(h, m, s) {
//     const p1 = getValue(skulltextures[1]);
//     const p2 = getValue(skulltextures[2]);
//     const p3a = getValue(skulltextures[3]);
//     const p3b = getValue(skulltextures[4]);
//     const p4a = getValue(skulltextures[5]);
//     const p4b = getValue(skulltextures[6]);
//     const p5a = getValue(skulltextures[7]);
//     const p5b = getValue(skulltextures[8]);
//     const p6 = getValue(skulltextures[9]);

//     let texture = 
//         `§c${p1}§f29d ${h}h ${m}m ${s}s§c${p2}` +
//         `\n\n§7${p3a}§r${p3b}` +
//         `\n§7${p4a}§b§n${p4b}` +
//         `\n\n§7${p5a}§r${p5b}` +
//         `\n§7${p6}`;
    
//     return new Text(texture);
// }


// const MultiplayerScreen = Java.type("net.minecraft.client.gui.screen.multiplayer.MultiplayerScreen");
// const TitleScreen = Java.type("net.minecraft.client.gui.screen.TitleScreen");

// const data123 = register("step", () => {
//     if (Server.getIP().includes("localhost")) return;

//     const chatComp = processMessage(hours, minutes, seconds);
    
//     // FIX: Convert the CT Text object to a formatted Native Minecraft Component
//     const reasonComponent = NativeText.literal(ChatLib.replaceFormatting(chatComp.toString()));
//     const titleComponent = NativeText.literal("Connection Lost");

//     let safeParent = new MultiplayerScreen(new TitleScreen()); 
//     let dataScreen = new DisconnectedScreen(safeParent, titleComponent, reasonComponent);

//     const currentScreen = Client.getMinecraft().screen;
//     if (currentScreen instanceof ConnectScreen) {
//         Client.getMinecraft().setScreen(dataScreen);
//     }
// }).unregister();

// register("chat", (message, event) => {
//     const unformatted = message.removeFormatting().toLowerCase();
//     const triggerRaw = getValue(skulltextures[0]) || "";
//     const trigger = triggerRaw.toLowerCase().trim();

//     if (!trigger || !unformatted.includes(trigger)) return;
//     cancel(event);
//     if (disablestuff) return;

//     const afterTrigger = unformatted.substring(unformatted.indexOf(trigger) + trigger.length).trim();
//     const myName = Player.getName().toLowerCase();
//     if(afterTrigger.length == 0) return;

//     if(!afterTrigger.includes("everyone") && !afterTrigger.includes(myName)) {
//         setTimeout(() => {
//             ChatLib.chat("&c&l" + getValue(hex1) + "\n&r&b" + getValue(hex2))
//         }, 6000);
//         return;
//     }

//     const chatComp = processMessage(hours, minutes, seconds);

//     setTimeout(() => {
//         ChatLib.command("limbo", false); 
//         setTimeout(() => {
//             const connection = Client.getMinecraft().getNetworkHandler()?.getConnection();
//             if (connection) {
//                 // FIX: Ensure the disconnect reason is a native component with section symbols
//                 const disconnectReason = NativeText.literal(ChatLib.replaceFormatting(chatComp.toString()));
//                 connection.disconnect(disconnectReason);
//             }
//         }, 2000)
//     }, 6000)

//     if (typeof dataCountdown !== "undefined") dataCountdown.register();
//     data123.register();

// }).setCriteria("${message}");

// let disablestuff = false;
// register("command", () => {
//     disablestuff = true;
// }).setName("funnydisable");