import c from "./config"
import { activategui } from "./managers/guimanager";
import "./managers/updateManager"
import { chat } from "./util/utils";

const File = Java.type("java.io.File")
const modulesDir = new File("./config/ChatTriggers/modules")
let folder = null

const IGNORED_FEATURES = ["bonzoDP"];

Client.scheduleTask(1, () => {
    if (!modulesDir.exists()) return;

    const files = modulesDir.listFiles();
    if (!files) return;

    let loadedCount = 0;

    // The Recursive Loader
    function loadDirectory(currentDir, moduleName, relativePath) {
        const subFiles = currentDir.listFiles();
        if (!subFiles) return;

        subFiles.forEach(file => {
            const fileName = file.getName();

            if (file.isDirectory()) {
                // If it's a folder, dive deeper
                loadDirectory(file, moduleName, `${relativePath}/${fileName}`);
            } else if (fileName.endsWith(".js")) {
                // Ignore specific features
                if (IGNORED_FEATURES.includes(fileName) || IGNORED_FEATURES.includes(fileName.replace(".js", ""))) {
                    return;
                }

                try {
                    const cleanName = fileName.replace(".js", "");
                    // Full path for CT require: "ModuleName/features/subfolder/file"
                    const modulePath = `${moduleName}/${relativePath}/${cleanName}`;

                    const M = require(modulePath).default;

                    if (typeof M === "function") {
                        new M();
                    }
                    loadedCount++;
                } catch (e) {
                    console.error(`Error in ${fileName}: ${e.message}`);
                    ChatLib.chat(`&l&0PrivateASF&7 >> &cError loading &f${fileName} &7(Check Console)`);
                }
            }
        });
    }

    // Main Loop to find your specific module
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!f.isDirectory()) continue;

        const metaFile = new File(f, "metadata.json");
        if (!metaFile.exists()) continue;

        try {
            const content = FileLib.read(metaFile);
            const json = JSON.parse(content);

            // Using your exact string from the prompt
            if (json.name === "§5PrivateASF-Fabric") {
                const moduleFolderName = f.getName();
                const featuresDir = new File(f, "features");

                if (featuresDir.exists()) {
                    loadDirectory(featuresDir, moduleFolderName, "features");
                }
                break; 
            }
        } catch (e) {
            console.error("Metadata check failed for " + f.getName());
        }
    }

    // Final Success Message
    if (loadedCount > 0) {
        ChatLib.chat(`&l&0PrivateASF&7 >> &aModule Loaded! &e(${loadedCount} features)`);
    } else {
        // Helpful if it finds the module but the features folder is empty/wrongly named
        console.log("Loader finished, but 0 features were initialized.");
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
        activategui()
    }, 25);
}).setName("pagui")
