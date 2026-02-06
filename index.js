import c from "./config"
import { activategui } from "./managers/guimanager";
import "./managers/updateManager"
import { chat } from "./util/utils";

const File = Java.type("java.io.File")
const modulesDir = new File("./config/ChatTriggers/modules")
let folder = null

const IGNORED_FEATURES = ["bonzoDP", "starMobs"];

Client.scheduleTask(1, () => {
    if (!modulesDir.exists()) return;

    const files = modulesDir.listFiles();
    if (!files) return;

    let loadedCount = 0;

    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!f.isDirectory()) continue;

        const metaFile = new File(f, "metadata.json");
        if (!metaFile.exists()) continue;

        try {
            const content = FileLib.read(metaFile);
            if (!content) continue;

            const json = JSON.parse(content);
            if (json.name === "§5PrivateASF-Fabric") {
                let moduleFolderName = f.getName();
                folder = new File(`./config/ChatTriggers/modules/${moduleFolderName}/features`);

                if (!folder.exists()) continue;

                folder.listFiles().forEach(subFile => {
                    const fileName = subFile.getName();

                    if (fileName.endsWith(".js")) {
                        if (IGNORED_FEATURES.includes(fileName) || IGNORED_FEATURES.includes(fileName.replace(".js", ""))) {
                            return;
                        }

                        try {
                            const cleanName = fileName.replace(".js", "");
                            const modulePath = `./features/${cleanName}`;

                            const M = require(modulePath).default;

                            //chat("loaded " + fileName)

                            if (typeof M === "function") {
                                new M();
                            }

                            loadedCount++; // ✅ count loaded modules
                        } catch (e) {
                            // This gives you the full error path and line numbers in the console
                            console.error(`Error in ${fileName}:`);
                            console.error(e.stack);

                            // This shows a shortened version in Minecraft chat
                            ChatLib.chat(`&cError loading &f${fileName}`);
                            ChatLib.chat(`&7Line: &e${e.lineNumber || "check console"}`);
                            ChatLib.chat(`&7Reason: &c${e.message}`);
                        }
                    }
                });

                break;
            }
        } catch (e) { }
    }

    // ✅ runs AFTER everything finishes
    chat(`&aModule Loaded!`);
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
    ChatLib.simulateChat(fullMessage)
}).setName("simulatechat")

register("command", () => {
    setTimeout(() => {
        activategui()
    }, 25);
}).setName("pagui")
