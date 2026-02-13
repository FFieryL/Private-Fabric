import * as ConfigModule from "../config";
export const ChatMessageC2SPacket = Java.type("net.minecraft.network.packet.c2s.play.ChatMessageC2SPacket")
export const OpenScreenS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.OpenScreenS2CPacket") // S2DPacketOpenWindow
export const ScreenHandlerSlotUpdateS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.ScreenHandlerSlotUpdateS2CPacket"); // S2FPacketSetSlot
export const CloseScreenS2CPacket = Java.type('net.minecraft.network.packet.s2c.play.CloseScreenS2CPacket'); // S2EPacketCloseWindow
export const InventoryS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.InventoryS2CPacket")
export const CommonPingS2CPacket = Java.type('net.minecraft.network.packet.s2c.common.CommonPingS2CPacket')
export const NativeText = Java.type("net.minecraft.text.Text"); // Required for native components
export const TitleS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.TitleS2CPacket");
export const SubtitleS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.SubtitleS2CPacket")
export const WorldTimeUpdateS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.WorldTimeUpdateS2CPacket"); // S03packet
export const PlayerPositionLookS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.PlayerPositionLookS2CPacket"); // s08packet
export const bossnames = ["Maxor", "Storm", "Goldor", "Necron", "Wither King"]
export const EntityWither = Java.type("net.minecraft.entity.boss.WitherEntity")
export const DisconnectedScreen = Java.type("net.minecraft.client.gui.screen.DisconnectedScreen"); // GuiDisconnected
export const ConnectScreen = Java.type("net.minecraft.client.gui.screen.ConnectScreen"); // GuiConnecting
export const Vec3 = Java.type("net.minecraft.util.math.Vec3d")
export const Box = Java.type("net.minecraft.util.math.Box");
export const ArmorStand = Java.type("net.minecraft.entity.decoration.ArmorStandEntity")
export const EntityBat = Java.type("net.minecraft.entity.passive.BatEntity")
export const EntityPlayer = Java.type("net.minecraft.entity.player.PlayerEntity")
export const ClientPlayer = Java.type("net.minecraft.client.network.ClientPlayerEntity")
//export const Prefix = "&l&0PrivateASF&7 >>"
//prefixOptions[c.customPrefix]
const prefixOptions = ["PrivateASF", "Private", "PA", "PASF"];
//export const Prefix = "&l&0" + prefixOptions[c.customPrefix] + "&7 >>"
export const bloodStartMessages = ["[BOSS] The Watcher: Things feel a little more roomy now, eh?", "[BOSS] The Watcher: Oh.. hello?", "[BOSS] The Watcher: I'm starting to get tired of seeing you around here...", "[BOSS] The Watcher: You've managed to scratch and claw your way here, eh?", "[BOSS] The Watcher: So you made it this far... interesting.", "[BOSS] The Watcher: Ah, we meet again...", "[BOSS] The Watcher: Ah, you've finally arrived."]

export function getPrefix() {
    const c = ConfigModule.default;
    const index = (c && typeof c.customPrefix === 'number') ? c.customPrefix : 0;
    const name = prefixOptions[index] || "PrivateASF";
    return `&l&0${name}&7 >>`;
}

export function isPlayerInBox(x1, x2, y1, y2, z1, z2) {
    const x = Player.getX();
    const y = Player.getY();
    const z = Player.getZ();

    return (x >= Math.min(x1, x2) && x <= Math.max(x1, x2) &&
        y >= Math.min(y1, y2) && y <= Math.max(y1, y2) &&
        z >= Math.min(z1, z2) && z <= Math.max(z1, z2));
};

export function chat(msg) {
    ChatLib.chat(`${getPrefix()} &r${msg}`)
}

export function getColorCodes(colorName) {
    const colorMap = {
        black: "&0",
        dark_blue: "&1",
        dark_green: "&2",
        dark_aqua: "&3",
        dark_red: "&4",
        dark_purple: "&5",
        gold: "&6",
        gray: "&7",
        dark_gray: "&8",
        blue: "&9",
        green: "&a",
        aqua: "&b",
        red: "&c",
        light_purple: "&d",
        yellow: "&e",
        white: "&f"
    };

    let key = colorName.toLowerCase().replace(/\s+/g, "_");

    const aliases = {
        purple: "dark_purple",
        magenta: "light_purple",
        pink: "light_purple",
        lime: "green",
        teal: "aqua",
        orange: "gold",
        grey: "gray"
    };

    if (aliases[key]) key = aliases[key];

    return colorMap[key] || null;
}

const soundMap = {
    "random.orb": "entity.experience_orb.pickup",
    "note.pling": "block.note_block.pling",
    "random.explode": "entity.generic.explode"
}

/**
 * Plays a sound compatible with 1.21.10
 * @param {String} soundName 
 * @param {Number} volume 
 * @param {Number} pitch 
 */
export function playSound(soundName, volume = 0.7, pitch = 1) {
    try {
        // Redirect old names to new names if they exist in our map
        const source = soundMap[soundName] || soundName;

        // Validation to ensure we don't pass NaN to the Sound constructor
        const v = parseFloat(volume) || 1;
        const p = parseFloat(pitch) || 1;

        new Sound({
            source: source,
            volume: v,
            pitch: p
        }).play();

    } catch (e) {
        
        console.error(`[PrivateASF] Failed to play sound "${soundName}": ${e}`);
    }
}

export const getTablist = (formatted = true) => {
    if (!World.isLoaded() || !TabList) return null;

    const rawNames = TabList.getNames();
    if (!rawNames || rawNames.length === 0) return null;

    return rawNames.map(name => {
        const strName = name.toString();
        return formatted ? strName : ChatLib.removeFormatting(strName);
    });
}

export const getMatchFromLines = (regex, list, type) => {
    for (let i = 0; i < list.length; i++) {
        let match = list[i].match(regex)
        if (!match) continue
        return type == "int" ? parseInt(match[1]) : type == "float" ? parseFloat(match[1]) : match[1]
    }
    return null
}

export const removeUnicode = (string) => typeof (string) !== "string" ? "" : string.replace(/[^\u0000-\u007F]/g, "")

export const getScoreboard = (formatted = false) => {
    if (!World.getWorld()) return null
    let sb = Scoreboard.getLines().map(a => a.getName())
    if (formatted) return Scoreboard.getLines()
    return sb.map(a => ChatLib.removeFormatting(a))
}

export function rightClick(shouldSwing = false) {
    const mc = Client.getMinecraft()
    const hit = mc.crosshairTarget

    if (hit && hit.getType().toString() === "BLOCK") mc.interactionManager.interactBlock(mc.player, Hand.field_5808, hit)
    else mc.interactionManager.interactItem(mc.player, Hand.field_5808)

    if (shouldSwing) mc.player.swingHand(Hand.field_5808)
}

export function leftClick() {
    const mc = Client.getMinecraft()
    const hit = mc.crosshairTarget

    if (!hit) return

    const type = hit.getType().toString()

    if (type === "ENTITY") {
        mc.interactionManager.attackEntity(mc.player, hit.getEntity())
    } 
    else if (type === "BLOCK") {
        mc.interactionManager.attackBlock(hit.getBlockPos(), hit.getSide())
    }

    mc.player.swingHand(Hand.field_5808)
}

const numeralValues = {
    "I": 1,
    "V": 5,
    "X": 10,
    "L": 50,
    "C": 100,
    "D": 500,
    "M": 1000
}

/**
 * Decodes a roman numeral into it's respective number. Eg VII -> 7, LII -> 52 etc.
 * Returns null if the numeral is invalid.
 * Supported symbols: I, V, X, L, C, D, M
 * @param {String} numeral 
 * @returns {Number | null}
 */
export const decodeNumeral = (numeral) => {
    if (!numeral.match(/^[IVXLCDM]+$/)) return null
    let sum = 0
    for (let i = 0; i < numeral.length; i++) {
        let curr = numeralValues[numeral[i]]
        let next = i < numeral.length - 1 ? numeralValues[numeral[i + 1]] : 0

        if (curr < next) {
            sum += next - curr
            i++
            continue
        }
        sum += curr
    }
    return sum
}

export function pressMovementKey(key, state, exec) {
    if (['backKey', 'rightKey', 'leftKey', 'sprintKey', 'forwardKey', 'attackKey', 'sneakKey', 'useKey', 'jumpKey'].includes(key)) {
        if (!Client.getMinecraft().options[key]) return chat("wrong key")
        Client.getMinecraft().options[key].setPressed(state)
        if (exec) exec()
    } else chat("wrong key")
}