const Box = Java.type("net.minecraft.util.math.Box");
const BoxData = Java.type("com.odtheking.odin.utils.render.BoxData");
const LineData = Java.type("com.odtheking.odin.utils.render.LineData");
const Vec3d = Java.type("net.minecraft.util.math.Vec3d");
const RenderBatchManager = Java.type("com.odtheking.odin.utils.render.RenderBatchManager");

class OdinRenderer {
    constructor() {
        this.consumer = RenderBatchManager.INSTANCE.getRenderConsumer();
        
        // Cache the internal fields
        this.wireField = this.getInternalField("wireBoxes");
        this.filledField = this.getInternalField("filledBoxes");
        this.lineField = this.getInternalField("lines");
    }

    getInternalField(fieldName) {
        try {
            const field = this.consumer.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(this.consumer);
        } catch (e) {
            return this.consumer[fieldName] || this.consumer[fieldName + "$odin"];
        }
    }

    /**
     * Translates Vigilance colors to Float arrays [r, g, b, a]
     */
    vigtorgba(vigColor) {
        if (!vigColor) return [1, 1, 1, 1]; // Fallback white
        
        // Handle java.awt.Color
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

    drawOutline(box, color, phase, thickness = 2) {
        if (!this.wireField) return;
        const c = this._getColor(color);
        const data = new BoxData(box, c[0], c[1], c[2], c[3], thickness);
        this.wireField.get(phase ? 1 : 0).add(data);
    }

    drawFilled(box, color, phase) {
        if (!this.filledField) return;
        const c = this._getColor(color);
        const data = new BoxData(box, c[0], c[1], c[2], c[3], 1);
        this.filledField.get(phase ? 1 : 0).add(data);
    }

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
}

const RenderUtils = new OdinRenderer();
export default RenderUtils;