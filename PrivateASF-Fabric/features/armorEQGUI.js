// import { data, drawText, OverlayEditor, registerOverlay } from "../managers/guimanager";
// import { CloseScreenS2CPacket, InventoryS2CPacket, OpenScreenS2CPacket, ScreenHandlerSlotUpdateS2CPacket } from "../util/utils";
// import c from "../config";
// import { SkyBlockUtils } from "../util/skyblockUtils";
// // registerOverlay("InvGUI", { text: () => "adsadasd", align: "center", colors: false, h: 16 * 4 + 2.5 * 2 })
// registerOverlay("TestGUI", { text: () => "asdasdadssad", align: "center", colors: true})

// register("renderOverlay", (cfx) => {

//     drawText(cfx, tick, data.TestGUI, true, "TestGUI")
// })
// let tick = 0
// register("tick", () => {
//     tick++
// })
// const ITEM_BASE_SIZE = 16;
// let ITEM_RENDER_SIZE = ITEM_BASE_SIZE * 1;

// let ITEM_BOX_BORDER_COLOR, bgCol, bordCol;

// updateColors()

// const ITEM_BOX_THICKNESS = 1;
// const pad = 2.5;

// function rgbaToInt(r, g, b, a = 255) { return (a << 24) | (r << 16) | (g << 8) | b; }


// let scale = 1;
// let slot, bgW, bgH;
// let equipmentWindowID = -1;

// function recalcSizes() {
//     scale = data.InvGUI.scale || 1;
//     ITEM_RENDER_SIZE = ITEM_BASE_SIZE * scale;
//     slot = 16 * scale;
//     bgW = (slot * 2) + (pad * 3);
//     bgH = (4 * slot) + (pad * 2);
// }

// function updateColors() {
//     const cfg = c;
//     if (!cfg) return; // Safety check

//     // Provide default [R, G, B, A] arrays as fallbacks
//     const defaultBorder = [255, 255, 255, 255];
//     const defaultBg = [0, 0, 0, 150];

//     ITEM_BOX_BORDER_COLOR = rgbaToInt(...(cfg.itemBorder || defaultBorder));
//     bgCol = rgbaToInt(...(cfg.invBgColor || defaultBg));
//     bordCol = rgbaToInt(...(cfg.invBorderColor || defaultBorder));
// }

// Client.scheduleTask(0, () => {
//     c.registerListener("invBgColor", () => {
//         updateColors();
//     });

//     c.registerListener("itemBorder", () => {
//         updateColors();
//     })

//     c.registerListener("invBorderColor", () => {
//         updateColors();
//     });

//     recalcSizes();

//     if (c.invGUI) {
//         PAINV.register()
//         EQstuff1.register()
//         EQstuff2.register()
//     }
//     c.registerListener("invGUI", (curr) => {
//         if (curr) {
//             PAINV.register()
//             EQstuff1.register()
//             EQstuff2.register()
//         } else {
//             PAINV.unregister()
//             EQstuff1.unregister()
//             EQstuff2.unregister()
//             EQstuff3.unregister()
//             EQstuff4.unregister()
//         }
//     })
// })

// function drawtheitem(item, drawX, drawY, itemScale, renderSize) {
//     if (!item) return;

//     Renderer.drawRect(ITEM_BOX_BORDER_COLOR, drawX, drawY, renderSize, ITEM_BOX_THICKNESS);
//     Renderer.drawRect(ITEM_BOX_BORDER_COLOR, drawX, drawY + renderSize - ITEM_BOX_THICKNESS, renderSize, ITEM_BOX_THICKNESS);
//     Renderer.drawRect(ITEM_BOX_BORDER_COLOR, drawX, drawY, ITEM_BOX_THICKNESS, renderSize);
//     Renderer.drawRect(ITEM_BOX_BORDER_COLOR, drawX + renderSize - ITEM_BOX_THICKNESS, drawY, ITEM_BOX_THICKNESS, renderSize);

//     item.draw(drawX, drawY, itemScale);
// }

// const PAINV = register("renderOverlay", () => {
//     const inv = Player.getInventory();
//     if (!inv) return;

//     if (scale !== data.InvGUI.scale) recalcSizes();

//     const x = data.InvGUI.x;
//     const y = data.InvGUI.y;
//     const items = inv.getItems();
//     if (!items || items.length < 40) return;

//     const inSB = SkyBlockUtils.inSkyBlock();
//     // If not in SB, width is only 1 slot + padding. If in SB, it's the full bgW.
//     const currentBgW = inSB ? bgW : (slot + (pad * 2));
//     const thick = 1;

//     // --- Background and Outer Border (Using dynamic width) ---
//     Renderer.drawRect(bgCol, x, y, currentBgW, bgH);
//     Renderer.drawRect(bordCol, x, y, currentBgW, thick);
//     Renderer.drawRect(bordCol, x, y + bgH - thick, currentBgW, thick);
//     Renderer.drawRect(bordCol, x, y, thick, bgH);
//     Renderer.drawRect(bordCol, x + currentBgW - thick, y, thick, bgH);

//     // --- Render Armor (Column 1 - Always) ---
//     const armorX = x + pad;
    
//     const armor = [items[39], items[38], items[37], items[36]];
//     armor.forEach((item, i) => {
//         const sy = y + pad + (i * slot);
//         if (item) drawtheitem(item, armorX, sy, scale, ITEM_RENDER_SIZE);
//     });

//     // --- Render Equipment (Column 2 - SkyBlock only) ---
//     if (!inSB) return;

//     const equipX = x + slot + (pad * 2);
//     const equipItems = [savedEquipment.necklace, savedEquipment.cloak, savedEquipment.belt, savedEquipment.gloves];
//     equipItems.forEach((item, i) => {
//         const sy = y + pad + (i * slot);
//         if (item && item.getRegistryName() != "minecraft:stained_glass_pane") {
//             drawtheitem(item, equipX, sy, scale, ITEM_RENDER_SIZE);
//         }
//     });
// }).unregister()


// let savedEquipment = {
//     necklace: null,
//     cloak: null,
//     belt: null,
//     gloves: null
// };

// const EQstuff1 = register("packetReceived", () => {
//     if (equipmentWindowID == -1) return;
//     equipmentWindowID = -1
//     EQstuff3.unregister()
//     EQstuff4.unregister()
// }).setFilteredClass(CloseScreenS2CPacket).unregister()

// const EQstuff2 = register("packetReceived", (packet) => {
//     let title = packet.getName()
//     if (title) title = title.removeFormatting();

//     if (title != "Your Equipment and Stats") return equipmentWindowID = -1;
//     equipmentWindowID = packet.getSyncId()
//     EQstuff3.register()
//     EQstuff4.register()
// }).setFilteredClass(OpenScreenS2CPacket).unregister()

// const EQstuff3 = register("packetReceived", (packet) => {
//     if (equipmentWindowID === -1 || packet.syncId() !== equipmentWindowID) return;

//     const itemStacks = packet.contents();
//     if (!itemStacks || itemStacks.length < 38) return;

//     const getSafeItem = (mcStack) => { return (mcStack && !mcStack.method_7960()) ? new Item(mcStack) : null; };
//     savedEquipment.necklace = getSafeItem(itemStacks.get(10));
//     savedEquipment.cloak = getSafeItem(itemStacks.get(19));
//     savedEquipment.belt = getSafeItem(itemStacks.get(28));
//     savedEquipment.gloves = getSafeItem(itemStacks.get(37));

// }).setFilteredClass(InventoryS2CPacket).unregister()

// const EQstuff4 = register("packetReceived", (packet) => {
//     if (equipmentWindowID === -1 || packet.syncId() !== equipmentWindowID) return;

//     const slot = packet.slot();
//     const itemStack = packet.itemStack();
//     const item = (itemStack && !itemStack.method_7960()) ? new Item(itemStack) : null;

//     switch (slot) {
//         case 10:
//             savedEquipment.necklace = item;
//             break;
//         case 19:
//             savedEquipment.cloak = item;
//             break;
//         case 28:
//             savedEquipment.belt = item;
//             break;
//         case 37:
//             savedEquipment.gloves = item;
//             break;
//         default:
//             break;
//     }
// }).setFilteredClass(ScreenHandlerSlotUpdateS2CPacket).unregister()

