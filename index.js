import c from "./config"
import { activategui } from "./managers/guimanager";
import "./managers/updateManager"
import { triggerPacketChat } from "./util/Events";
import { ensureConnected } from "./features/Random/PAIRC";
import { playSound } from "./util/utils";

const File = Java.type("java.io.File")
const modulesDir = new File("./config/ChatTriggers/modules")
const Prefix = "&l&0PrivateASF&7 >> "
const MODULE_NAME = "PrivateASF-Fabric"

const IGNORED_FEATURES = ["bonzoDP"];

const FEATURE_FOLDERS = [
    "Boss",
    "Dungeon",
    "Highlight",
    "Pets",
    "Random",
    "Party"
];



let ClassifiedASF = null

try {
    ClassifiedASF = require("../ClassifiedASF").default
} catch (e) {
    ChatLib.chat("&c[PrivateASF] ClassifiedASF not found.")
}

const moduleFolder = new File(`./config/ChatTriggers/modules/${MODULE_NAME}`);

Client.scheduleTask(0, () => {
    if (!modulesDir.exists()) return;

    // Find our specific module folder
    if (!moduleFolder.exists()) return;

    let loadedCount = 0;

    FEATURE_FOLDERS.forEach(folderName => {
        const folder = new File(moduleFolder, `features/${folderName}`);
        if (!folder.exists() || !folder.isDirectory()) return;

        folder.listFiles().forEach(file => {
            const fileName = file.getName();

            if (fileName.endsWith(".js")) {
                // Check if ignored
                if (IGNORED_FEATURES.includes(fileName) || IGNORED_FEATURES.includes(fileName.replace(".js", ""))) {
                    return;
                }

                try {
                    // require path is relative to the module root
                    const cleanName = fileName.replace(".js", "");
                    const modulePath = `./features/${folderName}/${cleanName}`;

                    const M = require(modulePath).default;

                    if (typeof M === "function") {
                        new M();
                    }
                    loadedCount++;
                } catch (e) {
                    console.error(`Error in ${folderName}/${fileName}:`);
                    console.error(e.stack);
                    ChatLib.chat(`&cError loading &f${folderName}/${fileName}`);
                    ChatLib.chat(`&7Reason: &c${e.message}`);
                }
            }
        });
    });

    ChatLib.chat(`${Prefix}&aModule Loaded! (&f${loadedCount}&a features)`);
    if (ClassifiedASF) ClassifiedASF()
    if (World.isLoaded()) ensureConnected()
});


register("command", () => {
    c.guiEditor = false
    c.openGUI()
}).setName("pa").setAliases("privateasf", "pas", "pasf")

register("command", () => {
    ChatLib.command("warp dungeons")
}).setName("dh")

register("command", () => {
    ChatLib.command("warp hub")
}).setName("h")

register("command", (...args) => {
    const fullMessage = args.join(" ")
    triggerPacketChat(fullMessage)
    ChatLib.simulateChat(fullMessage)
}).setName("simulatechat")

register("command", () => {
    setTimeout(() => {
        activategui()
    }, 25);
}).setName("pagui")

register("command", (soundName, volume, pitch) => {
    volume = parseFloat(volume) || 1;
    pitch = parseFloat(pitch) || 1;

    playSound(soundName, volume, pitch);
}).setName("testsound")



// register("packetSent", (packet) => {
//     // Check if the packet is a PlayerInteractBlockC2SPacket
//     // You can inspect the packet here
//     let blockPos = packet.entityId // Get the block position
//     ChatLib.chat(`Player interacted with entityId ${blockPos}`);
// }).setFilteredClass(net.minecraft.network.packet.c2s.play.PlayerInteractEntityC2SPacket)

// register("packetSent", (packet) => {
//     // Check if the packet is a PlayerInteractBlockC2SPacket
//     // You can inspect the packet here
//     let blockPos = packet.getAction() // Get the block position
//     ChatLib.chat(`Player interacted ${blockPos}`);
// }).setFilteredClass(net.minecraft.network.packet.c2s.play.PlayerActionC2SPacket)

// register("packetSent", (packet) => {
//     // Check if the packet is a PlayerInteractBlockC2SPacket
//     // You can inspect the packet here
//     let blockPos = packet.hand // Get the block position
//     ChatLib.chat(`Player interacted with ${blockPos}`);
// }).setFilteredClass(net.minecraft.network.packet.c2s.play.HandSwingC2SPacket)

// register("packetSent", (packet) => {
//     // Check if the packet is a PlayerInteractBlockC2SPacket
//     // You can inspect the packet here
//     let blockPos = packet.getHand() // Get the block position
//     ChatLib.chat(`Player interacted with ${blockPos} 11 1`);
// }).setFilteredClass(net.minecraft.network.packet.c2s.play.PlayerInteractItemC2SPacket)

