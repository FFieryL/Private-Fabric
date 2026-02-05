import c from "./config"
import { activategui, OverlayEditor } from "./managers/guimanager";
import "./managers/updateManager"

const File = Java.type("java.io.File")
const modulesDir = new File("./config/ChatTriggers/modules")
let folder = null

const IGNORED_FEATURES = ["armorEQGUI", "bonzoDP", "starMobs"];

Client.scheduleTask(1, () => {
    if (!modulesDir.exists()) return;

    const files = modulesDir.listFiles();
    if (!files) return;

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
                            
                            ChatLib.chat("&aLoaded &7" + fileName);

                            if (typeof M === "function") {
                                new M();
                            }
                        } catch (e) {
                            ChatLib.chat(`&cError loading module ${fileName} &7(${e})`);
                        }
                    }
                });
                break;
            }
        } catch (e) {
            // Silently fail for metadata reading
        }
    }
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
        OverlayEditor.open()
        activategui()
    }, 25);
}).setName("pagui")