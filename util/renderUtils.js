const Box = Java.type("net.minecraft.util.math.Box");
const BoxData = Java.type("com.odtheking.odin.utils.render.BoxData");
const LineData = Java.type("com.odtheking.odin.utils.render.LineData");
const Vec3d = Java.type("net.minecraft.util.math.Vec3d");
const RenderBatchManager = Java.type("com.odtheking.odin.utils.render.RenderBatchManager");
const TextData = Java.type("com.odtheking.odin.utils.render.TextData");

class SmoothPos {
    constructor(smoothing = 0.25, snapThreshold = 0.01) {
        this.smoothing = smoothing;
        this.snapThreshold = snapThreshold;
        this.pos = null;
    }

    /**
     * Updates and returns the smoothed coordinates.
     * @param {number} tx - Target X
     * @param {number} ty - Target Y
     * @param {number} tz - Target Z
     */
    update(tx, ty, tz) {
        if (!this.pos) {
            this.pos = { x: tx, y: ty, z: tz };
            return this.pos;
        }

        const dx = tx - this.pos.x;
        const dy = ty - this.pos.y;
        const dz = tz - this.pos.z;
        const distanceSq = dx * dx + dy * dy + dz * dz;

        if (distanceSq > 100) { 
            this.pos = { x: tx, y: ty, z: tz };
            return this.pos;
        }

        if (distanceSq < (this.snapThreshold * this.snapThreshold)) {
            this.pos.x = tx;
            this.pos.y = ty;
            this.pos.z = tz;
        } else {
            // Apply smoothing
            this.pos.x += dx * this.smoothing;
            this.pos.y += dy * this.smoothing;
            this.pos.z += dz * this.smoothing;
        }

        return this.pos;
    }

    reset() {
        this.pos = null;
    }
}

class OdinRenderer {
    constructor() {
        this.consumer = RenderBatchManager.INSTANCE.getRenderConsumer();

        // Cache the internal fields
        this.wireField = this._getInternalField("wireBoxes");
        this.filledField = this._getInternalField("filledBoxes");
        this.lineField = this._getInternalField("lines");
        this.textField = this._getInternalField("texts");
    }


    /**
     * Uses Java Reflection to access private fields within the RenderConsumer.
     * @param {string} fieldName - The name of the field to access.
     * @returns {*} The Java collection or field requested.
     * @private
     */
    _getInternalField(fieldName) {
        try {
            const field = this.consumer.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(this.consumer);
        } catch (e) {
            return this.consumer[fieldName] || this.consumer[fieldName + "$odin"];
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

    reduceAlpha(color, multiplier = 0.3) {
        const rgba = this._getColor(color); // ensures float [r,g,b,a]
        return [
            rgba[0],
            rgba[1],
            rgba[2],
            rgba[3] * multiplier
        ];
    }


    /**
     * Queues a wireframe box outline for rendering.
     * @param {Box} box - The net.minecraft.util.math.Box to render.
     * @param {number[]|number} color - The color (normalized array or hex).
     * @param {boolean} phase - If true, the outline renders through walls.
     * @param {number} [thickness=2] - The line thickness.
     */
    drawOutline(box, color, phase, thickness = 2) {
        if (!this.wireField) return;
        const c = this._getColor(color);
        const data = new BoxData(box, c[0], c[1], c[2], c[3], thickness);
        this.wireField.get(phase ? 1 : 0).add(data);
    }


    /**
     * Queues a solid filled box for rendering.
     * @param {Box} box - The net.minecraft.util.math.Box to render.
     * @param {number[]|number} color - The color (normalized array or hex).
     * @param {boolean} phase - If true, the box renders through walls.
     */
    drawFilled(box, color, phase) {
        if (!this.filledField) return;
        const c = this._getColor(color);
        const data = new BoxData(box, c[0], c[1], c[2], c[3], 1);
        this.filledField.get(phase ? 1 : 0).add(data);
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
        if (!this.lineField) return;
        const c = this._getColor(color);

        const start = new Vec3d(startPos[0], startPos[1], startPos[2]);
        const end = new Vec3d(endPos[0], endPos[1], endPos[2]);

        // LineData expects an ARGB Integer
        const argb = ((c[3] * 255) << 24) | ((c[0] * 255) << 16) | ((c[1] * 255) << 8) | (c[2] * 255);

        const data = new LineData(start, end, argb, argb, thickness);
        this.lineField.get(phase ? 1 : 0).add(data);
    }

    /**
     * Queues 3D text to be rendered in the world.
     * @param {string} text - The string to display.
     * @param {number} x - World X position.
     * @param {number} y - World Y position.
     * @param {number} z - World Z position.
     * @param {number} scale - Scale multiplier (default 1.0).
     * @param {boolean} depth - If true, text is occluded by blocks.
     */
    /**
     * Queues 3D text to be rendered in the world.
     */
    drawText(text, x, y, z, scale = 1, depth = false) {
        if (!this.textField) return;

        const font = Renderer.getFontRenderer();
        
        const mc = Client.getMinecraft();
        if (!mc || !mc.gameRenderer) return;

        const camera = mc.gameRenderer.getCamera();
        const cameraRotation = camera.getRotation();
        
        const pos = new Vec3d(x, y, z);
        const textWidth = font.getWidth(text);

        const data = new TextData(
            text, 
            pos, 
            parseFloat(scale), 
            depth, 
            cameraRotation, 
            font, 
            parseFloat(textWidth)
        );

        this.textField.add(data);
    }

    /**
     * Helper to draw a "Waypoint" style text (larger based on distance)
     */
    drawWaypointText(text, x, y, z, color = "§f") {
        const playerPos = Player.asPlayerMP().getPos();
        const dist = Math.sqrt(Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2) + Math.pow(z - playerPos.z, 2));
        
        const dynamicScale = Math.max(1.0, dist * 0.05);
        const displayString = `${text} ${color}(${Math.round(dist)}m)`;
        
        this.drawText(displayString, x, y + 0.5, z, dynamicScale, false);
    }

}

const RenderUtils = new OdinRenderer();
RenderUtils.SmoothPos = SmoothPos;
export default RenderUtils;