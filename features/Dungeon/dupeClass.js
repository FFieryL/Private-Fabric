import c from "../../config";
import { data, drawText, OverlayEditor, registerOverlay } from "../../managers/guimanager";
import dungeonUtils from "../../util/dungeonUtils";
import { registerPacketChat } from "../../util/Events";
import { chat, getScoreboard, playSound, removeUnicode } from "../../util/utils";
registerOverlay("DupeClass", { text: () => "DUPE ARCHER DETECTED", align: "center", colors: true, setting: () => c.dupeClass})

let displayText = "DUPE CLASS DETECTED"

const chatTrig = registerPacketChat((message) => {
    if (message == "[NPC] Mort: Here, I found this map when I first entered the dungeon.") {
        chatTrig.unregister()
        overlay.unregister();
        return;
    }
    else if (!message.match(/^Starting in \d second(s)?\./)) return;
    if (!c.dupeClass) return;
    let classes = new Set();
    const sb = getScoreboard(false);
    if (!sb) return;
    for (let i = 0; i < sb.length; ++i) {
        let line = removeUnicode(sb[i]);
        let match = line.match(/\[\S\] \w+ .+/);
        if (match) {
            let c = match[0].substring(1, 2);
            if (!classes.has(c)) classes.add(c)
            else {
                if (c == "M" && c.ignoreDoubleMage) continue;
                const dupeClass = dungeonUtils.translateClass(c)
                chat(`&cDuplicate ${dupeClass} Detected`);
                if (c) displayText = `DUPE ${dupeClass.toUpperCase()} DETECTED`
                playSound("note.pling", 0.7, 1);
                overlay.register();
                return;
            }
        }
    }
    overlay.unregister();
}).unregister()

const overlay = register("renderOverlay", (cfx) => {
    if (OverlayEditor.isOpen()) return;
    drawText(cfx, displayText, data.DupeClass, true, "DupeClass")
}).unregister();

const worldTrig = register("worldLoad", () => {
    chatTrig.register()
    overlay.unregister();
}).unregister()

if (c.dupeClass) {
    chatTrig.register()
    worldTrig.register()
}

c.registerListener("Dupe Class Notifier", (curr) => {
    if (curr) {
        chatTrig.register()
        worldTrig.register()
    } else {
        chatTrig.unregister()
        worldTrig.unregister()
        overlay.unregister()
    }
})
