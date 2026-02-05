const odinUtils = Java.type("com.odtheking.odin.utils.skyblock.dungeon.DungeonUtils").INSTANCE
const odinBlessing = Java.type("com.odtheking.odin.utils.skyblock.dungeon.Blessing")
global.goldorTicks = 0;
global.stormTicks = 0;
global.goldorTotal = 0;
global.goldorColor = "&a"

class dungeonUtils {
    constructor() {
        this.currentStage = 0
        this.currentPhase = 0;
        this.inBoss = false
        
        register("chat", message => {
            if (message === "[BOSS] Storm: I should have known that I stood no chance.") this.currentStage = 1;
            if ((message.includes("(7/7)") || message.includes("(8/8)")) && !message.includes(":") && this.currentPhase == 3) this.currentStage += 1;
        }).setCriteria("${message}");

        register("chat", (name, event) => {
            name = name.removeFormatting();
            if (name === "Maxor") this.currentPhase = 1;
            if (name === "Storm") this.currentPhase = 2;
            if (name === "Goldor") this.currentPhase = 3;
            if (name === "Necron") this.currentPhase = 4;
            if (name === "Wither King") this.currentPhase = 5;
            if (this.currentPhase > 0) this.inBoss = true
        }).setCriteria("[BOSS] ${name}: ${*}");


        register("worldLoad", () => {
            this.currentPhase = 0; 
            this.currentStage = 0; 
            this.inBoss = false;
        });


    }


    inDungeon() {
        return odinUtils.inDungeons
    }
    
    getClassColor(playerClass) {
        const colors = {
            Healer: "&d",
            Tank: "&a",
            Mage: "&b",
            Berserk: "&c",
            Archer: "&6"
        };
        return colors[playerClass] || "&f"; 
    }

    translateClass(classLetter) {
        const DungeonClassMap = new Map([
            ["M", "Mage"],
            ["B", "Berserk"],
            ["A", "Archer"],
            ["H", "Healer"],
            ["T", "Tank"]
        ])
        return DungeonClassMap.get(classLetter) || "Unknown Class";
    }

    getPlayerClass(playerName) {
        const teammates = odinUtils.getDungeonTeammates().toArray();
        
        const player = teammates.find(p => p.getName() === playerName);
        
        return player ? player.getClazz().toString() : "Unknown";
    }

    getParty() {
        return odinUtils.getDungeonTeammates().toArray().map(player => player.getName());
    }


    getStage = () => this.currentStage;
    inStage = (stage) => Array.isArray(stage) ? stage.includes(this.currentStage) : this.currentStage === stage;
    getPhase = () => this.currentPhase;
    inPhase = (phase) => Array.isArray(phase) ? phase.includes(this.currentPhase) : this.currentPhase === phase;

}

export default new dungeonUtils();
