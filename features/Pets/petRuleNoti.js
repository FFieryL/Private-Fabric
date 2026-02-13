import c from "../../config"
import { data, drawText, OverlayEditor, registerOverlay } from "../../managers/guimanager";
import { playSound } from "../../util/utils";


let currentPet = null;
let overlayEndTime = 0;
registerOverlay("PetRuleNoti", {
    text: () => {
        let pet = c.customPetRuleColor ? data.PetRuleNoti.color + "Phoenix" : "&6Phoenix" ; // preview pet if none active
        let text = pet;
        if (!c.PetRuleNotiShort) text += " &aequipped";
        return text;
    },
    align: "center",
    setting: () => c.PetRuleNoti
})

const chatTrig = register("chat", (event) => {
    if(!c.PetRuleNoti) return;
    const message = event.message.getFormattedText();

    const match = message.match(/§r§cAutopet §eequipped your §7\[Lvl (\d+)\] (?:§8\[.*?§8\] )?§(.)(.+?)§e! §a§lVIEW RULE/);
    if (!match) return;
    
    const colorCodes = match[2]; // e.g. "&d"
    const petName = match[3].replace(/\s*✦/g, ""); // "Black Cat"
    currentPet = petName;
    if (!c.customPetRuleColor) currentPet = "&" + colorCodes + petName;
    overlay.register();
    overlayEndTime = Date.now() + 1000;
    if(c.PetRuleSound) playSound("random.orb", 0.7, 1)
}).unregister()

const overlay = register("renderOverlay", (cfx) => {
    if (OverlayEditor.isOpen()) return;
    if (currentPet && Date.now() < overlayEndTime) {
        let displaytext = currentPet;
        if (!c.PetRuleNotiShort) displaytext += " &aequipped"
        drawText(cfx, displaytext, data.PetRuleNoti, true, "PetRuleNoti")
    } 
    else if (currentPet && Date.now() >= overlayEndTime) {
        currentPet = null;
        overlay.unregister();
    }
}).unregister();

if (c.PetRuleNoti) {
    chatTrig.register();
}

c.registerListener("Pet Rule Notifier", (curr) => {
    if (curr) chatTrig.register();
    else chatTrig.unregister();
})