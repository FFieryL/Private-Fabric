// 1. Imports
import { data, drawText, OverlayEditor, registerOverlay } from "../../managers/guimanager";
import { chat, CloseScreenS2CPacket, InventoryS2CPacket, OpenScreenS2CPacket, ScreenHandlerSlotUpdateS2CPacket } from "../../util/utils";
import c from "../../config";
import { SkyBlockUtils } from "../../util/skyblockUtils";

// 2. Constants and Variables
const ITEM_BASE_SIZE = 16;
let ITEM_RENDER_SIZE = ITEM_BASE_SIZE * 1;
let ITEM_BOX_BORDER_COLOR, bgCol, bordCol;
const ITEM_BOX_THICKNESS = 1;
const pad = 2.5;
let scale = 1;
let slot, bgW, bgH;
let equipmentWindowID = -1;
let savedEquipment = { necklace: null, cloak: null, belt: null, gloves: null };

// 3. Helper Functions
function rgbaToInt(r, g, b, a = 255) {
    return ((a & 0xFF) << 24 | (r & 0xFF) << 16 | (g & 0xFF) << 8 | (b & 0xFF)) >>> 0;
}

function recalcSizes() {
    scale = data.InvGUI.scale || 1;
    ITEM_RENDER_SIZE = ITEM_BASE_SIZE * scale;
    slot = 16 * scale;
    bgW = (slot * 2) + (pad * 3);
    bgH = (4 * slot) + (pad * 2);
}

function updateColors() {
    const cfg = c;
    if (!cfg) return;
    const getInt = (colorSource, fallbackArray) => {
        if (colorSource && typeof colorSource.getRed === 'function') {
            return rgbaToInt(colorSource.getRed(), colorSource.getGreen(), colorSource.getBlue(), colorSource.getAlpha());
        }
        return rgbaToInt(...fallbackArray);
    };
    ITEM_BOX_BORDER_COLOR = getInt(cfg.itemBorder, [255, 255, 255, 255]);
    bgCol = getInt(cfg.invBgColor, [0, 0, 0, 150]);
    bordCol = getInt(cfg.invBorderColor, [255, 255, 255, 255]);
}

function drawtheitem(ctx, item, drawX, drawY, itemScale, renderSize) {
    if (!item || !ctx) return;

    const thick = ITEM_BOX_THICKNESS;
    const color = ITEM_BOX_BORDER_COLOR;

    // Draw borders using the context (ctx)
    ctx.fill(drawX, drawY, drawX + renderSize, drawY + thick, color);
    ctx.fill(drawX, drawY + renderSize - thick, drawX + renderSize, drawY + renderSize, color);
    ctx.fill(drawX, drawY, drawX + thick, drawY + renderSize, color);
    ctx.fill(drawX + renderSize - thick, drawY, drawX + renderSize, drawY + renderSize, color);

    ctx.drawItem(item.toMC(), drawX, drawY)
}


const PAINV = register("renderOverlay", (ctx) => {
    const inv = Player.getInventory();
    if (!inv || !ctx) return;

    if (scale !== data.InvGUI.scale) recalcSizes();

    const x = data.InvGUI.x;
    const y = data.InvGUI.y;
    const items = inv.getItems();
    if (!items || items.length < 40) return;

    const inSB = SkyBlockUtils.inSkyBlock();
    const currentBgW = inSB ? bgW : (slot + (pad * 2));
    const thick = 1;

    // --- Background and Borders ---
    ctx.fill(x, y, x + currentBgW, y + bgH, bgCol);
    ctx.fill(x, y, x + currentBgW, y + thick, bordCol);
    ctx.fill(x, y + bgH - thick, x + currentBgW, y + bgH, bordCol);
    ctx.fill(x, y, x + thick, y + bgH, bordCol);
    ctx.fill(x + currentBgW - thick, y, x + currentBgW, y + bgH, bordCol);

    // --- Armor Rendering ---
    const armorX = x + pad;
    const armor = [items[39], items[38], items[37], items[36]];

    armor.forEach((item, i) => {
        const sy = y + pad + (i * slot);
        if (item) drawtheitem(ctx, item, armorX, sy, scale, ITEM_RENDER_SIZE);
    });

    // --- Equipment Rendering (SB Only) ---
    if (!inSB) return;

    const equipX = x + slot + (pad * 2);
    const equipItems = [savedEquipment.necklace, savedEquipment.cloak, savedEquipment.belt, savedEquipment.gloves];

    equipItems.forEach((item, i) => {
        const sy = y + pad + (i * slot);
        // CRITICAL: Check registry name, not getName()
        if (item && item.type !== "minecraft:stained_glass_pane") {
            drawtheitem(ctx, item, equipX, sy, scale, ITEM_RENDER_SIZE);
        }
    });
}).unregister();

const EQstuff1 = register("packetReceived", () => {
    if (equipmentWindowID == -1) return;
    equipmentWindowID = -1;
    EQstuff3.unregister();
    EQstuff4.unregister();
}).setFilteredClass(CloseScreenS2CPacket).unregister();

const EQstuff2 = register("packetReceived", (packet) => {
    let titleText = packet.getName();
    if (!titleText) return;
    const title = titleText.getString().removeFormatting();
    if (title != "Your Equipment and Stats") return equipmentWindowID = -1;
    equipmentWindowID = packet.syncId;
    EQstuff3.register();
    EQstuff4.register();
}).setFilteredClass(OpenScreenS2CPacket).unregister();

const EQstuff3 = register("packetReceived", (packet) => {
    if (equipmentWindowID === -1 || packet.syncId !== equipmentWindowID) return;

    const itemStacks = packet.contents();
    if (!itemStacks || itemStacks.length < 38) return;

    const getSafeItem = (mcStack) => { return (mcStack && !mcStack.method_7960()) ? new Item(mcStack) : null; };
    savedEquipment.necklace = getSafeItem(itemStacks.get(10));
    savedEquipment.cloak = getSafeItem(itemStacks.get(19));
    savedEquipment.belt = getSafeItem(itemStacks.get(28));
    savedEquipment.gloves = getSafeItem(itemStacks.get(37));

}).setFilteredClass(InventoryS2CPacket).unregister()

const EQstuff4 = register("packetReceived", (packet) => {
    if (equipmentWindowID === -1 || packet.syncId !== equipmentWindowID) return;

    const slot = packet.slot;
    const itemStack = packet.stack;
    const item = (itemStack && !itemStack.method_7960()) ? new Item(itemStack) : null;
    if (item && item.type !== "minecraft:stained_glass_pane")
        switch (slot) {
            case 10:
                savedEquipment.necklace = item;
                break;
            case 19:
                savedEquipment.cloak = item;
                break;
            case 28:
                savedEquipment.belt = item;
                break;
            case 37:
                savedEquipment.gloves = item;
                break;
            default:
                break;
        }
}).setFilteredClass(ScreenHandlerSlotUpdateS2CPacket).unregister()

// 5. Registration Logic (at the bottom)
registerOverlay("InvGUI", { text: () => "", align: "left", colors: false, w: 35, h: 16 * 4 + 2.5 * 2, setting: () => c.invGUI });

if (c.invGUI) {
    recalcSizes();
    updateColors();
    PAINV.register();
    EQstuff1.register();
    EQstuff2.register();
}

c.registerListener("Armor and EQ gui", (curr) => {
    if (curr) {
        recalcSizes();
        updateColors();
        PAINV.register();
        EQstuff1.register();
        EQstuff2.register();
    } else {
        PAINV.unregister();
        EQstuff1.unregister();
        EQstuff2.unregister();
        // unregister others...
    }
});