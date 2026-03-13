import c from "../../config"
import { data, drawText, registerOverlay } from "../../managers/guimanager";
import { playSound } from "../../util/utils";

const WorldBorderInitializeS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.WorldBorderInitializeS2CPacket")
registerOverlay("SAAlert", { text: () => "Shadow Assassin!", align: "center", colors: true, setting: () => c.shadowAlert})
const SAALert = register("packetReceived", (packet) => {
    if (!(packet instanceof WorldBorderInitializeS2CPacket) || packet.getWarningTime() !== 10000) return
    renderAlert.register()
    Client.scheduleTask(30, () => renderAlert.unregister())
    playSound("entity.blaze.hurt", 0.7, 1)
    playSound("entity.blaze.hurt", 0.7, 1)
    playSound("entity.blaze.hurt", 0.7, 1)
}).setFilteredClass(WorldBorderInitializeS2CPacket.class).unregister()

const renderAlert = register("renderOverlay", (ctx) => {
    drawText(ctx, "Shadow Assassin!", data.SAAlert, true, "SAAlert")
}).unregister()


c.registerListener("Shadow Assassin Alert", (curr) => {
    if (curr) SAALert.register()
    else SAALert.unregister()
})

if (c.shadowAlert) SAALert.register()