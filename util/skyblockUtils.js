export class SkyBlockUtils {
    /**
     * Checks if the player is currently on the Hypixel Network.
     */
    static isHypixel() {
        const brand = Server.getIP()
        return brand && brand.toLowerCase().includes("hypixel");
    }

    /**
     * Checks if the player is in SkyBlock by looking at the Scoreboard.
     * Hypixel SkyBlock always has "SKYBLOCK" or a date near the top.
     */
    static inSkyBlock() {
        if (!this.isHypixel()) return false;
        
        const scoreboard = Scoreboard.getTitle();
        if (!scoreboard) return false;

        // Strip formatting and check for the SkyBlock title
        const title = ChatLib.removeFormatting(scoreboard).toUpperCase();
        return title.includes("SKYBLOCK");
    }

    /**
     * Gets the current SkyBlock Zone (e.g., "The Hub", "Dungeon Hub").
     */
    static getZone() {
        if (!this.inSkyBlock()) return null;
        
        // Loop through scoreboard lines to find the zone line
        const lines = Scoreboard.getLines();
        for (let line of lines) {
            let text = ChatLib.removeFormatting(line.getName());
            if (text.includes("⏣")) { // The 'house' icon usually marks the zone
                return text.replace("⏣ ", "").trim();
            }
        }
        return "Unknown";
    }
}