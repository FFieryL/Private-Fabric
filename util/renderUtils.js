const Box = Java.type("net.minecraft.util.math.Box");
const BoxData = Java.type("com.odtheking.odin.utils.render.BoxData");
const LineData = Java.type("com.odtheking.odin.utils.render.LineData");
const Vec3d = Java.type("net.minecraft.util.math.Vec3d");
const RenderBatchManager = Java.type("com.odtheking.odin.utils.render.RenderBatchManager");
const ItemStateRenderer = Java.type("com.odtheking.odin.utils.render.ItemStateRenderer");

class OdinRenderer {
    constructor() {

    }


    /**
     * Uses Java Reflection to access private fields within the RenderConsumer.
     * @param {string} fieldName - The name of the field to access.
     * @returns {*} The Java collection or field requested.
     * @private
     */
    _getInternalFieldFrom(consumer, fieldName) {
        try {
            const field = consumer.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(consumer);
        } catch (e) {
            return consumer[fieldName] || consumer[fieldName + "$odin"];
        }
    }

    /**
     * Translates Vigilance color format into a normalized float array.
     * @param {Object|number} vigColor - A java.awt.Color object or an ARGB integer.
     * @returns {number[]} A float array [r, g, b, a] where values are 0.0 - 1.0.
     */
    vigtorgba(vigColor) {
        if (!vigColor) return [1, 1, 1, 1];

        if (vigColor.getRed) {
            return [
                vigColor.getRed() / 255,
                vigColor.getGreen() / 255,
                vigColor.getBlue() / 255,
                vigColor.getAlpha() / 255
            ];
        }

        // Handle raw Integer
        const r = (vigColor >> 16 & 0xFF) / 255;
        const g = (vigColor >> 8 & 0xFF) / 255;
        const b = (vigColor & 0xFF) / 255;
        const a = (vigColor >> 24 & 0xFF) / 255 || 1.0;

        return [r, g, b, a];
    }

    /**
     * Internal helper to ensure we have a float array
     */
    _getColor(color) {
        return Array.isArray(color) ? color : this.vigtorgba(color);
    }


    /**
     * Queues a wireframe box outline for rendering.
     * @param {Box} box - The net.minecraft.util.math.Box to render.
     * @param {number[]|number} color - The color (normalized array or hex).
     * @param {boolean} phase - If true, the outline renders through walls.
     * @param {number} [thickness=2] - The line thickness.
     */
    drawOutline(box, color, phase, thickness = 2) {
        const consumer = RenderBatchManager.INSTANCE.getRenderConsumer();
        if (!consumer) return;

        const wireField = this._getInternalFieldFrom(consumer, "wireBoxes");
        if (!wireField) return;

        const c = this._getColor(color);
        const data = new BoxData(box, c[0], c[1], c[2], c[3], thickness);
        wireField.get(phase ? 1 : 0).add(data);
    }


    /**
     * Queues a solid filled box for rendering.
     * @param {Box} box - The net.minecraft.util.math.Box to render.
     * @param {number[]|number} color - The color (normalized array or hex).
     * @param {boolean} phase - If true, the box renders through walls.
     */
    drawFilled(box, color, phase) {
        const consumer = RenderBatchManager.INSTANCE.getRenderConsumer();
        if (!consumer) return;

        const filledField = this._getInternalField(consumer, "filledBoxes");
        if (!filledField) return;

        const c = this._getColor(color);
        const data = new BoxData(box, c[0], c[1], c[2], c[3], 1);

        filledField.get(phase ? 1 : 0).add(data);
    }


    /**
     * Creates a Minecraft Box object centered horizontally on X and Z.
     * @param {number} x - The center X coordinate.
     * @param {number} y - The bottom Y coordinate.
     * @param {number} z - The center Z coordinate.
     * @param {number} w - The width/depth of the box.
     * @param {number} h - The height of the box.
     * @returns {Box} A new net.minecraft.util.math.Box instance.
     */
    getBox(x, y, z, w, h) {
        return new Box(x - w / 2, y, z - w / 2, x + w / 2, y + h, z + w / 2)
    }

    calculateCameraPos() {
        const yaw = Player.getYaw() * Math.PI / 180
        const pitch = Player.getPitch() * Math.PI / 180
        const fx = -Math.sin(yaw) * Math.cos(pitch)
        const fy = -Math.sin(pitch)
        const fz = Math.cos(yaw) * Math.cos(pitch)

        const camX = Player.getRenderX() + fx * 50
        const camY = Player.getRenderY() + 1.62 + fy * 50
        const camZ = Player.getRenderZ() + fz * 50
        return [camX, camY, camZ]
    }


    /**
     * Queues a 3D line (tracer) between two points.
     * @param {number[]} startPos - The [x, y, z] starting coordinates.
     * @param {number[]} endPos - The [x, y, z] ending coordinates.
     * @param {number[]|number} color - The color (normalized array or hex).
     * @param {boolean} phase - If true, the line renders through walls.
     * @param {number} [thickness=2] - The line thickness.
     */
    drawTracer(startPos, endPos, color, phase, thickness = 2) {
        const consumer = RenderBatchManager.INSTANCE.getRenderConsumer();
        if (!consumer) return;

        const lineField = this._getInternalField(consumer, "lines");
        if (!lineField) return;
        const c = this._getColor(color);

        const start = new Vec3d(startPos[0], startPos[1], startPos[2]);
        const end = new Vec3d(endPos[0], endPos[1], endPos[2]);

        // LineData expects an ARGB Integer
        const argb = ((c[3] * 255) << 24) | ((c[0] * 255) << 16) | ((c[1] * 255) << 8) | (c[2] * 255);

        const data = new LineData(start, end, argb, argb, thickness);
        lineField.get(phase ? 1 : 0).add(data);
    }

}

const RenderUtils = new OdinRenderer();
export default RenderUtils;