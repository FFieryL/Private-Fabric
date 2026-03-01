import c from "../../config"
import { registerPacketChat } from "../../util/Events";
import { chat, ClickSlotC2SPacket, CloseHandledScreenC2SPacket, CloseScreenS2CPacket, OpenScreenS2CPacket, playSound, ScreenHandlerSlotUpdateS2CPacket } from "../../util/utils";
import { getAuctionIdentifier, binData } from "./lowestBin";
const SignEditorOpenS2CPacket = Java.type("net.minecraft.network.packet.s2c.play.SignEditorOpenS2CPacket")
export const signGui = new Gui()
const UpdateSignC2SPacket = Java.type("net.minecraft.network.packet.c2s.play.UpdateSignC2SPacket")
const GLFW = Java.type("org.lwjgl.glfw.GLFW");



let currentItemPrice = null
let currentSignPos = null
let currentSignFront = true
let currentPriceInput = ""
let inSign = false
let isUndercutMode = false

const KEY_ENTER_MAIN = GLFW.GLFW_KEY_ENTER;
const KEY_ENTER_NUMPAD = GLFW.GLFW_KEY_KP_ENTER;
const KEY_ESCAPE = GLFW.GLFW_KEY_ESCAPE;

const resetVal = () => {
    slotHandler.unregister()
    signListener.unregister()
    signKeyHandler.unregister()
    clickListener.unregister()
    renderButtons.unregister()
    signMouseHandler.unregister()
    enterKey.unregister()
    autoList.unregister()
    currentSignPos = null;
    currentSignFront = true
    inSign = false
    autoPostState = 0
}

const registerAHGui = (bool) => {
    if (bool) {
        AHgui1.register()
        AHgui2.register()
        AHgui3.register()
        AHgui4.register()
        AHgui5.register()
        AHgui6.register()
    }
    else {
        AHgui1.unregister()
        AHgui2.unregister()
        AHgui3.unregister()
        AHgui4.unregister()
        AHgui5.unregister()
        AHgui6.unregister()
    }
}

const getScale = () => 3 / Renderer.screen.getScale();


// Open and Close handlers

const AHgui1 = register("packetReceived", (packet, event) => {
    if (!(packet instanceof OpenScreenS2CPacket)) return;
    const name = packet.getName().getString()
    if (name == "Create BIN Auction") {
        slotHandler.register()
        clickListener.register()
        enterKey.register()
        return;
    }
    if (name == "Confirm BIN Auction") {
        enterKey.register()
        return;
    }
    resetVal()
}).setFilteredClass(OpenScreenS2CPacket).unregister()

const AHgui2 = register("packetSent", resetVal).setFilteredClass(CloseHandledScreenC2SPacket).unregister();
const AHgui3 = register("packetReceived", resetVal).setFilteredClass(CloseScreenS2CPacket).unregister();
const AHgui4 = register("worldUnload", resetVal).unregister();

const AHgui5 = register("guiClosed", (gui) => {
    if (gui.getTitle().getString() == "§r") {
        signListener.unregister()
        renderButtons.unregister()
        signMouseHandler.unregister()
        currentSignPos = null;
        currentSignFront = true
        inSign = false
    }
}).unregister()

const AHgui6 = registerPacketChat((message) => {
    if (message == "Couldn't read this number!" || "This menu has been throttled! Please slow down...") resetVal()
    else if (message == "Your starting bid must be at least 10 coins!" || message == "Your starting bid cannot be higher than 50,000,000,000!") {
        autoPostState = 0
        autoList.unregister()
    }
}).unregister()


const slotHandler = register("packetReceived", (packet, event) => {
    if (packet.getSlot() != 13) return
    const itemStack = packet.getStack()
    if (!itemStack) return;
    if (itemStack.toString().includes("minecraft:stone_button")) return currentItemPrice = null;
    const price = binData.prices[getAuctionIdentifier(new Item(itemStack))];
    currentItemPrice = isNaN(Number(price)) ? null : Number(price);
}).setFilteredClass(ScreenHandlerSlotUpdateS2CPacket).unregister()


const clickListener = register("packetSent", (packet, event) => {
    if (!(packet instanceof ClickSlotC2SPacket)) return;
    if (Player.getContainer()?.getName().toString().removeFormatting() == "Create BIN Auction" && packet.slot() == 31) {
        currentSignPos = null
        currentSignFront = true
        signListener.register()
    }
}).setFilteredClass(ClickSlotC2SPacket).unregister()

const signListener = register("packetReceived", (packet, event) => {
    if (!(packet instanceof SignEditorOpenS2CPacket)) return;

    inSign = true
    currentSignPos = packet.getPos()
    currentSignFront = packet.isFront() != null ? packet.isFront() : true;

    if (!currentSignPos) return;

    cancel(event) // cancel once we get our guis setup
    signGui.open()

    signKeyHandler.register()
    signMouseHandler.register()
    renderButtons.register()
}).setFilteredClass(SignEditorOpenS2CPacket).unregister()


const renderButtons = register("renderOverlay", (ctx) => {
    if (!signGui.isOpen()) return;
    ctx.fill(0, 0, Renderer.screen.getWidth(), Renderer.screen.getHeight(), 0xAA2E2E2E | 0);
    if (currentItemPrice == null) isUndercutMode = false;

    const scalefactor = getScale()

    const centerX = Renderer.screen.getWidth() / 2;
    const centerY = Renderer.screen.getHeight() / 2;
    const mouseX = Client.getMouseX() / Renderer.screen.getScale();
    const mouseY = Client.getMouseY() / Renderer.screen.getScale();

    const BUTTON_W = 110 * scalefactor, BUTTON_H = 18 * scalefactor, GAP = 5 * scalefactor;
    const BOX_W = 140 * scalefactor, BOX_H = 22 * scalefactor;

    const buttonX = centerX - (BUTTON_W * 2 + GAP) / 2, buttonY = centerY + 10 * scalefactor;

    const boxX = centerX - BOX_W / 2, boxY = centerY - 30 * scalefactor;

    drawContextButton(ctx, buttonX, buttonY, BUTTON_W, BUTTON_H, isUndercutMode ? "§cUndercut Mode" : "§aExact Mode", mouseX, mouseY, scalefactor);

    drawContextButton(ctx, buttonX + BUTTON_W + GAP, buttonY, BUTTON_W, BUTTON_H, "§c-1 Undercut", mouseX, mouseY, scalefactor);

    drawContextButton(ctx, centerX - BUTTON_W / 2, buttonY + BUTTON_H + GAP, BUTTON_W, BUTTON_H, "§aDone", mouseX, mouseY, scalefactor);



    if (currentItemPrice != null) renderScaledText(ctx, `§eCurrent BIN: §6${currentItemPrice}`, centerX, boxY - (25 * scalefactor), scalefactor);


    let price = getCalculatedPrice()

    if (price != null) {
        const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        renderScaledText(ctx, `§bCurrent: §6${formatted}`, centerX, boxY - (15 * scalefactor), scalefactor);
    }

    // background
    ctx.fill(boxX, boxY, boxX + BOX_W, boxY + BOX_H, 0xB41E1E1E | 0);
    const thick = 1 * scalefactor;
    // Border
    ctx.fill(boxX, boxY, boxX + BOX_W, boxY + thick, 0xFFFFFFFF | 0);
    ctx.fill(boxX, boxY + BOX_H - thick, boxX + BOX_W, boxY + BOX_H, 0xFFFFFFFF | 0);
    ctx.fill(boxX, boxY, boxX + thick, boxY + BOX_H, 0xFFFFFFFF | 0);
    ctx.fill(boxX + BOX_W - thick, boxY, boxX + BOX_W, boxY + BOX_H, 0xFFFFFFFF | 0);

    // numbers
    const displayText = currentPriceInput.length > 0 ? currentPriceInput : "§7Enter undercut amount";
    new Text(displayText, (boxX + 6 * scalefactor) / scalefactor, (boxY + 7 * scalefactor) / scalefactor).setScale(scalefactor).setShadow(true).draw(ctx);
}).unregister()

function renderScaledText(ctx, str, x, y, s) {
    const w = Renderer.getStringWidth(str);
    new Text(str, (x - (w * s) / 2) / s, y / s).setScale(s).setShadow(true).draw(ctx);
}

function drawContextButton(ctx, x, y, w, h, text, mx, my) {
    const isHovered = mx >= x && mx <= x + w && my >= y && my <= y + h;

    const bgColor = (isHovered ? 0xFF646464 : 0xB41E1E1E) | 0;
    const borderColor = (isHovered ? 0xFFFFFFFF : 0x64969696) | 0;

    ctx.fill(x, y, x + w, y + h, bgColor);
    const scalefactor = getScale()
    const thick = 1 * scalefactor;
    ctx.fill(x, y, x + w, y + thick, borderColor);        
    ctx.fill(x, y + h - thick, x + w, y + h, borderColor); 
    ctx.fill(x, y, x + thick, y + h, borderColor);         
    ctx.fill(x + w - thick, y, x + w, y + h, borderColor);
    const tw = Renderer.getStringWidth(ChatLib.removeFormatting(text)) - 1;
    new Text(text, (x + w / 2 - (tw * scalefactor) / 2) / scalefactor, (y + h / 2 - 4.5 * scalefactor) / scalefactor).setScale(scalefactor).setShadow(true).draw(ctx);
}

const enterKey = register("guiKey", (char, keyCode, gui, event) => {
    if (keyCode !== KEY_ENTER_MAIN && keyCode !== KEY_ENTER_NUMPAD) return;
    cancel(event)
    const title = gui.getTitle()?.getString()
    if (!title || !Player.getContainer()) return;
    if (title == "Create BIN Auction") Player.getContainer().click(29, false, "MIDDLE")
    else if (title == "Confirm BIN Auction") Player.getContainer().click(11, false, "MIDDLE")
}).unregister()

const signKeyHandler = register("guiKey", (char, keyCode, gui, event) => {
    if (!signGui.isOpen()) return;

    if (keyCode === 259) { // Backspace
        currentPriceInput = currentPriceInput.slice(0, -1);
        cancel(event);
    } else if (keyCode === KEY_ENTER_NUMPAD || keyCode === KEY_ENTER_MAIN || keyCode === KEY_ESCAPE) { // Enter or escape key
        signGui.close();
        sendSignPacket();
    } else if (char && currentPriceInput.length < 11) {
        const c = char.toLowerCase();
        if (/[0-9.]/.test(c) || (/[kmb]/.test(c) && !/[kmb]/.test(currentPriceInput) && currentPriceInput.length > 0)) {
            currentPriceInput += c;
        }
        cancel(event);
    }
}).unregister()

const signMouseHandler = register("guiMouseClick", (x, y, btn, isDown, gui, event) => {
    if (!signGui.isOpen()) return;
    if (btn !== 0 || !isDown) return;
    const scalefactor = getScale();

    const centerX = Renderer.screen.getWidth() / 2;
    const centerY = Renderer.screen.getHeight() / 2;
    const BUTTON_W = 110 * scalefactor, BUTTON_H = 18 * scalefactor, GAP = 5 * scalefactor;
    const startX = centerX - (BUTTON_W * 2 + GAP) / 2;
    const buttonY = centerY + (10 * scalefactor);

    if (x >= startX && x <= startX + BUTTON_W && y >= buttonY && y <= buttonY + BUTTON_H) {
        playSound("random.click", 0.4, 1);
        if (currentItemPrice != null) isUndercutMode = !isUndercutMode;
        else chat("§cNo item price available.");
    }

    else if (x >= startX + BUTTON_W + GAP && x <= startX + BUTTON_W * 2 + GAP && y >= buttonY && y <= buttonY + BUTTON_H) {
        playSound("random.click", 0.4, 1);
        if (!currentItemPrice) return chat("No item in AH");
        isUndercutMode = true;
        currentPriceInput = "1";
        signGui.close();
        sendSignPacket();
        if (!c.autoList) return;
        autoPostState = 1
        autoList.register()
    }

    else if (x >= centerX - BUTTON_W / 2 && x <= centerX + BUTTON_W / 2 && y >= buttonY + BUTTON_H + GAP && y <= buttonY + BUTTON_H * 2 + GAP) {
        playSound("random.click", 0.4, 1);
        signGui.close();
        sendSignPacket();
    }
}).unregister()

let autoPostState = 0
const autoList = register("packetReceived", (packet, event) => {
    if (!(packet instanceof OpenScreenS2CPacket)) return;
    const name = packet.getName().getString();

    if (name == "Create BIN Auction") {
        if (autoPostState === 1) {
            Client.scheduleTask(3, () => {
                if (!Player.getContainer() || autoPostState == 0 || Player.getContainer()?.getStackInSlot(29)?.getType()?.getRegistryName() != "minecraft:green_terracotta") return autoList.unregister();
                autoPostState = 2;
                Player.getContainer()?.click(29, false, "MIDDLE");
            });
        }
        return;
    }

    if (name == "Confirm BIN Auction") {
        if (autoPostState === 2) {
            Client.scheduleTask(3, () => {
                if (!Player.getContainer() || autoPostState == 0 || Player.getContainer()?.getStackInSlot(11)?.getType()?.getRegistryName() != "minecraft:green_terracotta") return autoList.unregister();
                autoPostState = 0;
                Player.getContainer()?.click(11, false, "MIDDLE");
                autoList.unregister()
                resetVal()
            });
        }
        return;
    }
    
    
    autoPostState = 0;
    resetVal();
}).setFilteredClass(OpenScreenS2CPacket).unregister()

function getCalculatedPrice() {
    if (!currentPriceInput) return null;
    let inputStr = currentPriceInput.toLowerCase();
    const mults = { k: 1e3, m: 1e6, b: 1e9 };
    let multiplier = 1;

    Object.keys(mults).forEach(key => {
        if (inputStr.endsWith(key)) {
            multiplier = mults[key];
            inputStr = inputStr.slice(0, -1);
        }
    });

    let num = parseFloat(inputStr) * multiplier;
    if (isNaN(num)) return null;
    return isUndercutMode ? Math.max(0, (currentItemPrice || 0) - num) : num;
}

const sendSignPacket = () => {
    if (!inSign) return;
    let price = getCalculatedPrice()
    if (price == null) price = 0
    price = Math.max(0, price)
    const packet = new UpdateSignC2SPacket(currentSignPos, currentSignFront, price.toString(), "^^^^^^^^^^^^^^^", "Your auction", "starting bid")
    Client.scheduleTask(0, () => {
        Client.sendPacket(packet)
        currentSignPos = null;
        currentSignFront = true
        inSign = false
    })
}

if (c.customAHGui) {
    resetVal()
    registerAHGui(true)
}

c.registerListener("Custom AH Price GUI", (curr) => {
    resetVal()
    registerAHGui(curr)
})
