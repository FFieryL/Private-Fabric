import dungeonUtils from "../../util/dungeonUtils";
import c from "../../config";
import RenderUtils from "../../util/renderUtils";


const PlayerInteractBlockC2SPacket = Java.type("net.minecraft.network.packet.c2s.play.PlayerInteractBlockC2SPacket");
const MCBlockPos = Java.type("net.minecraft.util.math.BlockPos");

const highlights = new Map();
const validBlocks = [
    "minecraft:chest",
    "minecraft:lever",
    "minecraft:player_head",
    "minecraft:trapped_chest",
];

const validSkullIDs = [
    "e0f3e929-869e-3dca-9504-54c666ee6f23", // Wither Essence
    "fed95410-aba1-39df-9b95-1d4f361eb66e"  // Redstone Key
]

const HIGHLIGHT_DURATION_MS = 5000;

const highlightBlock = (block, locked = false) => {
    const blockStr = block.toString();
    const now = Date.now();

    // Re-add or refresh highlight
    highlights.set(blockStr, {
        block: block,
        locked: locked,
        expiry: now + HIGHLIGHT_DURATION_MS
    });

    renderTrigger.register();
};


const isValidSkull = (x, y, z) => {

    const mcPos = new MCBlockPos(x, y, z);
    const world = World.getWorld();
    

    const tileEntity = world.getBlockEntity(mcPos); 
    if (!tileEntity) return false;
    if (!tileEntity.getOwner()) return false;
    const isValid = validSkullIDs.some(validPart => tileEntity.getOwner().getGameProfile().id().toString().includes(validPart))
    return isValid
};

register("worldUnload", () => highlights.clear());

register("packetSent", (packet) => {
    if (!c.secretHighlight || !dungeonUtils.inDungeon) return;
    const hitResult = packet.getBlockHitResult();
    const pos = hitResult.getBlockPos();
    
    const x = pos.getX();
    const y = pos.getY();
    const z = pos.getZ();
    
    const block = World.getBlockAt(x, y, z);
    const blockName = block.type.getRegistryName();
    if (!validBlocks.includes(blockName)) return;
    if (blockName === "minecraft:player_head" && !isValidSkull(x, y, z)) return;
    highlightBlock(block);
}).setFilteredClass(PlayerInteractBlockC2SPacket);



const renderBlockHighlight = (block, locked) => {
    const mcPos = new MCBlockPos(block.getX(), block.getY(), block.getZ());
    const world = World.getWorld();

    const blockState = world.getBlockState(mcPos);
    if (!blockState) return;

    let shape = null;

    try {
        shape = blockState.getCollisionShape(world, mcPos);
    } catch (e) {}

    if (!shape || shape.isEmpty()) {
        shape = blockState.getOutlineShape(world, mcPos);
    }

    if (!shape || shape.isEmpty()) return;

    const outlineColor = locked ? c.secretLockedColor : c.secretOpenedColor;
    const fillColor = locked ? c.secretLockedColorFill : c.secretOpenedColorFill;

    const boxes = [];

    try {
        shape.forEachBox((minX, minY, minZ, maxX, maxY, maxZ) => {
            boxes.push(new AxisAlignedBB(minX, minY, minZ, maxX, maxY, maxZ));
        });
    } catch (e) {
        const box = shape.getBoundingBox();
        if (box) boxes.push(box);
    }

    boxes.forEach(box => {
        const worldBox = box.offset(mcPos.getX(), mcPos.getY(), mcPos.getZ());
        RenderUtils.drawOutline(worldBox, outlineColor, true, 1);
        RenderUtils.drawFilled(worldBox, fillColor, true);
    });
};





const renderTrigger = register("renderWorld", () => {
    const now = Date.now();

    for (const [key, value] of highlights.entries()) {

        if (value.expiry <= now) {
            highlights.delete(key);
            continue;
        }

        renderBlockHighlight(value.block, value.locked);
    }

    if (!highlights.size) renderTrigger.unregister();
}).unregister();


register("chat", (event) => {
    // Get the block the player is currently looking at
    const lookingAt = Player.lookingAt();
    
    // Safety check: ensure it's actually a chest
    if (!lookingAt || !lookingAt.getType() || !lookingAt.getType().getRegistryName().includes("chest")) return;

    // Force an immediate update to the locked state
    highlightBlock(lookingAt, true);
    
    // Optional: Debug to verify it's working
    // ChatLib.chat("&c[Debug] Chest set to locked color.");
}).setCriteria(/^That chest is locked!$/);
