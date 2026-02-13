import c from "../../config"
import partyUtils from "../../util/partyUtils";
import { getTablist, playSound } from "../../util/utils";

let notified = false;
let timerstarted = 0;
let counter = 0
let inAlarm = false
let lastPartySize = 0;
let tries = 0

const alarm = register("renderOverlay", () => {
    playSound("random.orb", c.partyNotiVolume / 10, 0);
    inAlarm = true
    if (Date.now() - timerstarted > (c.partyNotiTime * 1000)) {
        inAlarm = false
        alarm.unregister()
    }
}).unregister()

const stepTrig = register("step", () => {
    if (!World.isLoaded()) return;
    if (!Server.getIP()?.includes("hypixel")) return stepTrig.unregister()
    if(counter > 5) {
        stepTrig.unregister()
        return;
    }

    const names = getTablist(false)
    if (!names) return;
    const area = names.find(tab => tab.includes("Area") || tab.includes("Cata"));
    if(!area || !area.includes("Dungeon Hub")) return counter++;
    counter = 0

    const partyline = names.find(line => line.includes("Party: "));
    if(!partyline) return;

    if(partyline.match(/Party: No party/)) {
        notified = false;
        lastPartySize = 0;
        alarm.unregister()
        return;
    }

    const match = partyline.match(/Party: \((\d+)\/5\)/)
    if(!match) return;

    const partySize = parseInt(match[1])
    if (partySize < 5) {
        notified = false;
        alarm.unregister()
    }
    if(partySize == 5 && lastPartySize < 5 && (!c.partyLeaderOnly || (partyUtils.leader == Player.getName())) && !notified) {
        notified = true;
        alarm.register()
        timerstarted = Date.now()
    }

    lastPartySize = partySize
}).setDelay(3).unregister()

const chatTrig = register("chat", () => {
    if(inAlarm) return timerstarted = Date.now();
    alarm.register()
    timerstarted = Date.now()
}).setCriteria("Party Finder > Your group has been removed from the party finder!").unregister()

const chatTrig1 = register("chat", () => {
    if (inAlarm) return timerstarted = Date.now();
    alarm.register()
    timerstarted = Date.now()
}).setCriteria("The party was disbanded because all invites expired and the party was empty.").unregister()


const worldLoadTrig = register("worldLoad", () => {
    stepTrig.register()
    inAlarm = false
    counter = 0
    tries = 0
    alarm.unregister()
}).unregister()


if (c.partyFullNoti) {
    inAlarm = false
    counter = 0
    tries = 0
    worldLoadTrig.register()
}

if(c.partyDequeuedAlarm) {
    chatTrig.register()
    chatTrig1.register()
}

c.registerListener("Party Dequeued Alarm", (curr) => {
    if (curr) {
        chatTrig.register()
        chatTrig1.register()
    }
    else {
        chatTrig1.unregister()
        chatTrig.unregister()
        alarm.unregister()
    }
})

c.registerListener("Party Full Alarm", (curr) => {
    if (curr) {
        inAlarm = false
        counter = 0
        tries = 0
        worldLoadTrig.register()
    }
    else {
        stepTrig.unregister();
        worldLoadTrig.unregister()
        alarm.unregister()
    }
})
