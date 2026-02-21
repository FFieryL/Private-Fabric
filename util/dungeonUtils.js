import { SkyBlockUtils } from "./skyblockUtils"
import { onScoreboardLine, onTabLineUpdated, registerPacketChat } from "./Events"
import { decodeNumeral, getTablist, removeUnicode, getMatchFromLines } from "./utils"

global.goldorTicks = 0;
global.stormTicks = 0;
global.goldorTotal = 0;
global.goldorColor = "&a"

export default new class dungeonUtils {
    constructor() {
        this.inDungeon = false
        this.reset()
        this.dungeonChangeFuncs = []
        this.bossMessageListeners = new Set();
        this.debug = false
        const initialChecker = register("tick", () => {
            this.checkStuff()
            initialChecker.unregister()
        })

        register("tick", (ticks) => {
            if (ticks % 10) return
            if (!SkyBlockUtils.inSkyBlock() && this.inDungeon) return this.reset()

            const tabList = getTablist(false)
            if (tabList && tabList.length > 60) this.doPartyStuff(tabList)
        })

        register("command", () => {
            if (this.debug) debug.unregister()
            else debug.register()
        }).setName("debugdungeons")

        const debug = register("step", () => {
            this.dumpState()
        }).setDelay(1).unregister()

        // ===== SCOREBOARD DETECTION =====
        onScoreboardLine((lineNumber, text) => {
            const cataMatch = text.match(/^ §7⏣ §cThe Catac§combs §7\((\w+)\)$/)
            if (cataMatch) {
                this._setInDungeon(true)

                this.floor = cataMatch[1]
                this.setFloorStuff()
            }
        })

        // ===== TABLIST DETECTION =====
        onTabLineUpdated((text) => {
            if (text === "Dungeon: Catacombs") this._setInDungeon(true)
        })

        registerPacketChat((message) => {
            if (message === "[BOSS] Storm: I should have known that I stood no chance.") this.currentStage = 1
            if ((message.includes("(7/7)") || message.includes("(8/8)")) && !message.includes(":") && this.currentPhase === 3) this.currentStage += 1

            const match = message.match(/\[BOSS\] (.+): (.+)/)
            if (!match) return;

            const name = match[1];
            const bossmsg = match[2]

            const phases = {
                "Maxor": 1,
                "Storm": 2,
                "Goldor": 3,
                "Necron": 4,
                "Wither King": 5
            }

            if (phases[name]) {
                this.currentPhase = phases[name]
                this.inBoss = true
            }
            this.bossMessageListeners.forEach(listener => {
                listener(name, bossmsg);
            });
        })

        register("worldUnload", () => this.reset())
    }

    // ================= RESET =================

    reset() {
        this._setInDungeon(false)
        this.inBoss = false
        this.floor = null
        this.floorNumber = null
        this.dungeonType = null

        this.currentPhase = 0
        this.currentStage = 0

        this.party = new Set()
        this.classes = {}
        this.playerClasses = {}
    }

    // ================= STATE =================
    _setInDungeon(state) {
        if (state !== this.inDungeon) this.dungeonChangeFuncs.forEach(f => f(state))
        this.inDungeon = state
    }


    /**
     * Registers a trigger when a dungeon is entered, and unregisters it when left
     * @param {IRegister} trigger 
     * @param {Boolean} unregisterDefault - Will automatically unregister the trigger
     */
    registerWhenInDungeon(trigger, unregisterDefault = true) {
        // Unregister by default so it doesn't run outside dungeon
        if (unregisterDefault) trigger.unregister()

        // Hook into dungeon state changes
        this.onDungeonChange((inDungeon) => {
            if (inDungeon) trigger.register()
            else trigger.unregister()
        })
    }

    /**
     * Creates a custom trigger for boss messages.
     * @param {Function} callback 
     * @returns {Object} An object with register() and unregister() methods.
     */
    onBossMessage(callback) {
        const listener = {
            register: () => {
                this.bossMessageListeners.add(callback);
                return listener;
            },
            unregister: () => {
                this.bossMessageListeners.delete(callback);
                return listener;
            },
        };
        return listener.register();
    }

    dumpState() {
        const data = {
            inDungeon: this.inDungeon,
            floor: this.floor,
            floorNumber: this.floorNumber,
            dungeonType: this.dungeonType,
            party: [...this.party],
            classes: this.classes,
            playerClasses: this.playerClasses,
            stage: this.currentStage,
            phase: this.currentPhase,
            inBoss: this.inBoss
        }

        ChatLib.chat("&8----- &bDungeon State Dump &8-----")
        Object.entries(data).forEach(([key, value]) => {
            ChatLib.chat(`&7${key}: &a${JSON.stringify(value)}`)
        })
        ChatLib.chat("&8-------------------------------")
    }


    onDungeonChange(func) {
        this.dungeonChangeFuncs.push(func)
    }

    setFloorStuff() {
        this.floorNumber = 0
        if (this.floor !== "E") this.floorNumber = parseInt(this.floor[this.floor.length - 1])

        this.dungeonType = this.floor.startsWith("M") ? "Master Mode" : "The Catacombs"
    }

    // ================= CHECK ON RELOAD =================

    checkStuff() {
        const scoreboard = Scoreboard.getLines()
            .map(a => removeUnicode(a.getName().toString().removeFormatting()))

        this.floor = getMatchFromLines(/The Catacombs \((.{1,3})\)/, scoreboard) ?? this.floor
        this._setInDungeon(!!this.floor)

        if (this.floor) this.setFloorStuff()
    }

    // ================= PARTY + CLASSES =================

    doPartyStuff(tabList) {
        const lines = Array(5).fill().map((_, i) => tabList[i * 4 + 1])

        const matches = lines.reduce((arr, line) => {
            const match = line.match(/^.?\[(\d+)\] (?:\[\w+\] )*(\w+) .*?\((\w+)(?: (\w+))*\)$/)
            if (!match) return arr

            const [_, sbLevel, player, dungeonClass, classLevel] = match
            return arr.concat([[player, dungeonClass, classLevel]])
        }, [])

        this.party.clear()

        matches.forEach(([player, dungeonClass, classLevel]) => {
            if (!["DEAD", "EMPTY"].includes(dungeonClass)) this.classes[player] = dungeonClass
            this.party.add(player)

            if (!classLevel) return

            this.playerClasses[player] = {
                class: dungeonClass,
                level: decodeNumeral(classLevel),
                numeral: classLevel
            }
        })
    }

    // ================= HELPERS =================

    getStage = () => this.currentStage;
    inStage = (stage) => Array.isArray(stage) ? stage.includes(this.currentStage) : this.currentStage === stage;
    getPhase = () => this.currentPhase;
    inPhase = (phase) => Array.isArray(phase) ? phase.includes(this.currentPhase) : this.currentPhase === phase;

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
        return this.classes[playerName]
    }
}