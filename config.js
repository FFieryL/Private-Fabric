import { activategui, data } from "./managers/guimanager"
import {
    @ButtonProperty,
    @CheckboxProperty,
    Color,
    @ColorProperty,
    @PercentSliderProperty,
    @DecimalSliderProperty,
    @SelectorProperty,
    @SwitchProperty,
    @TextProperty,
    @Vigilant,
    @SliderProperty
} from '../Vigilance/index';

@Vigilant("PrivateASF-Fabric/data", "§5PrivateASF-Fabric", {
    getCategoryComparator: () => (a, b) => {
        const categories = ['Highlight', 'Pets', 'Dungeon', 'Boss', 'GUI', "Settings"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})

class config {
    constructor() {
        this.initialize(this)
        // --- Dependencies ---
        this.addDependency("Wither Highlight Type", "Wither Highlight");
        this.addDependency("ESP mode", "Wither Highlight");
        this.addDependency("Wither Box Color", "Wither Highlight");
        this.addDependency("Wither Fill Color", "Wither Highlight");
        this.addDependency("Wither Tracer in P3", "Wither Highlight");

        this.addDependency("Shorten Pet Rule Noti", "Pet Rule Notifier");
        this.addDependency("Pet Rule Notifier Sound", "Pet Rule Notifier");
        this.addDependency("Use custom color instead of rarity", "Pet Rule Notifier");

        this.addDependency("Bonzo Mask Text", "Bonzo, Phoenix, and Spirit Messages")
        this.addDependency("Phoenix Text", "Bonzo, Phoenix, and Spirit Messages")
        this.addDependency("Spirit Mask Text", "Bonzo, Phoenix, and Spirit Messages")

        this.addDependency("Invincibility Display Mode", "Invincibility Display")
        this.addDependency("Always show", "Invincibility Display")

        this.addDependency("Ignore dupe mage", "Dupe Class Notifier");


        this.addDependency("Use seconds instead of ticks", "Death Tick Timer")
        this.addDependency("Disable after blood open", "Death Tick Timer")

        this.addDependency("Blood Countdown", "Blood Timer")
        this.addDependency("Only Mage", "Blood Timer")
        this.addDependency("Send to Party", "Blood Timer")

        this.addDependency("Archer LB Swapper at Pillars", "Archer Death Bow Swapper")
        this.addDependency("Item to swap to from death bow", "Archer Death Bow Swapper")

        this.addDependency("py LB seconds", "py Last Breath Timer")

        this.addDependency("Goldor Timer Version", "Goldor Timer")
        this.addDependency("Show Goldor timer in ticks", "Goldor Timer")

        this.addDependency("Gate Blown Notifier", "Terminal Notifier");
        this.addDependency("Disable standard term titles", "Terminal Notifier");
        this.addDependency("Keep Custom Term Titles on screen", "Terminal Notifier");
        this.addDependency("Show I4 done and Lights done", "Terminal Notifier");
        this.addDependency("Full names", "Terminal Notifier");
        this.addDependency("Show names", "Terminal Notifier");

        this.addDependency("Enable Lever Trigger Bot for Device", "Lever Trigger Bot");

        this.addDependency("Item Border Color", "Armor and EQ gui")
        this.addDependency("GUI Background Color", "Armor and EQ gui")

        this.addDependency("GUI Border Color", "Armor and EQ gui")

        this.registerListener("Open Gui Editor", (curr) => {
            Client.currentGui.close()
            activategui()
        })


        this.registerListener("Disable Text Shadow", (curr) => {
            data.globalShadow = !data.globalShadow
            data.save()
            ChatLib.chat(`§aOverlays shadow is now: ${data.globalShadow ? "§bON" : "§cOFF"}`)
        })
    }

    @SwitchProperty({
        name: "Wither Highlight",
        description: "Highlight for Withers in F7 § M7",
        category: "Highlight",
        subcategory: "§4Boss"
    })
    espWither = false;

    @SelectorProperty({
        name: "Wither Highlight Type",
        description: "",
        category: "Highlight",
        subcategory: "§4Boss",
        options: ["Box", "Box Filled"]
    })
    espWitherType = 0;

    @ColorProperty({
        name: "Wither Box Color",
        description: "",
        category: "Highlight",
        subcategory: "§4Boss"
    })
    witherESPColorBox = new Color(244 / 255, 0, 25 / 255, 96 / 255);

    @ColorProperty({
        name: "Wither Fill Color",
        description: "",
        category: "Highlight",
        subcategory: "§4Boss"
    })
    witherESPColorFill = new Color(244 / 255, 0, 25 / 255, 96 / 255);

    @ColorProperty({
        name: "Wither Tracer Color",
        description: "",
        category: "Highlight",
        subcategory: "§4Boss"
    })
    witherESPColorTracer = new Color(244 / 255, 0, 25 / 255, 96 / 255);

    @SwitchProperty({
        name: "ESP mode",
        description: "",
        category: "Highlight",
        subcategory: "§4Boss"
    })
    witherThruBlocks = false;

    @SwitchProperty({
        name: "Wither Tracer in P3",
        description: "",
        category: "Highlight",
        subcategory: "§4Boss"
    })
    witherTracer = false;


    @SwitchProperty({
        name: "Star mob Highlight",
        description: "idk its self explanatory...",
        category: "Highlight",
        subcategory: "§5Star Mobs"
    })
    starMobESP = false;

    @SwitchProperty({
        name: "Star ESP mode",
        description: "",
        category: "Highlight",
        subcategory: "§5Star Mobs"
    })
    starMobESPThruBlocks = false;

    @SelectorProperty({
        name: "Star Render Mode",
        description: "The visual shape of the highlight",
        category: "Highlight",
        subcategory: "§5Star Mobs",
        options: ["Box", "Box Filled"]
    })
    starHighlightType = 0;

    @TextProperty({
        name: "Highlight Size",
        description: "default 0.6",
        category: "Highlight",
        subcategory: "§5Star Mobs",
    })
    starHighlightSize = "0.6";

    @ColorProperty({
        name: "Star Mobs Color",
        description: "",
        category: "Highlight",
        subcategory: "§5Star Mobs"
    })
    starMobESPColor = new Color(1, 1, 1, 1);

    @ColorProperty({
        name: "SA Color",
        description: "",
        category: "Highlight",
        subcategory: "§5Star Mobs"
    })
    starMobESPColorSA = new Color(1, 1, 1, 1);

    @ColorProperty({
        name: "Fel Color",
        description: "",
        category: "Highlight",
        subcategory: "§5Star Mobs"
    })
    starMobESPColorFel = new Color(1, 1, 1, 1);

    // ===== GARDEN =====

    @SwitchProperty({
        name: "Pest Highlight",
        description: "Highlights pests in the garden",
        category: "Highlight",
        subcategory: "§aPests"
    })
    pestESP = false;
    

    @ColorProperty({
        name: "Pest Color",
        description: "",
        category: "Highlight",
        subcategory: "§aPests"
    })
    pestESPColor = new Color(1, 1, 1, 1);

    @SwitchProperty({
        name: "Pest ESP mode",
        description: "",
        category: "Highlight",
        subcategory: "§aPests"
    })
    pestESPThruBlocks = false;

    @SelectorProperty({
        name: "Pest Render Mode",
        description: "The visual shape of the highlight",
        category: "Highlight",
        subcategory: "§aPests",
        options: ["Box", "Box Filled"]
    })
    pestESPHighlightType = 0;

    @SwitchProperty({
        name: "Pest Tracer",
        description: "",
        category: "Highlight",
        subcategory: "§aPests"
    })
    pestESPTracer = false;


    // ===== BATS =====

    @SwitchProperty({
        name: "Bat Highlight",
        description: "",
        category: "Highlight",
        subcategory: "§bBats"
    })
    batESP = false;

    @ColorProperty({
        name: "Bats Color",
        description: "",
        category: "Highlight",
        subcategory: "§bBats"
    })
    batESPColor = new Color(1, 1, 1, 1);

    @SwitchProperty({
        name: "Bats ESP mode",
        description: "",
        category: "Highlight",
        subcategory: "§bBats",
    })
    batESPThruBlocks = false;

    @SelectorProperty({
        name: "Bat Render Mode",
        description: "",
        category: "Highlight",
        subcategory: "§bBats",
        options: ["Box", "Box Filled"]
    })
    batHighlightType = 0;

    @SwitchProperty({
        name: "Secret Highlight",
        description: "",
        category: "Highlight",
        subcategory: "§cSecrets"
    })
    secretHighlight = false;

    @ColorProperty({
        name: "Secret Locked Box Color",
        description: "",
        category: "Highlight",
        subcategory: "§cSecrets"
    })
    secretLockedColor = new Color(1, 1, 1, 1);

    @ColorProperty({
        name: "Secret Locked Fill Color",
        description: "",
        category: "Highlight",
        subcategory: "§cSecrets"
    })
    secretLockedColorFill = new Color(1, 1, 1, 1);
    
    @ColorProperty({
        name: "Secret Opened Box Color",
        description: "",
        category: "Highlight",
        subcategory: "§cSecrets"
    })
    secretOpenedColor = new Color(1, 1, 1, 1);

    @ColorProperty({
        name: "Secret Opened Fill Color",
        description: "",
        category: "Highlight",
        subcategory: "§cSecrets"
    })
    secretOpenedColorFill = new Color(1, 1, 1, 1);




    // --- PETS ---
    @SwitchProperty({
        name: "Current pet display",
        description: "displays your current pet §cWIP",
        category: "Pets",
        subcategory: "§0GUI"
    })
    CurrentPetGui = false;

    @SwitchProperty({
        name: "Custom pet messages in chat",
        description: "Replaces all pet messages (level, summon, autopet) with a custom one",
        category: "Pets",
        subcategory: "§1CHAT"
    })
    CancelPetChats = false;

    @SwitchProperty({
        name: "Pet Rule Notifier",
        description: "Displays a title of the pet that was equipped",
        category: "Pets",
        subcategory: "§3Noti"
    })
    PetRuleNoti = false;

    @SwitchProperty({
        name: "Shorten Pet Rule Noti",
        description: "Shortens Pet rule noti to just the pet",
        category: "Pets",
        subcategory: "§3Noti"
    })
    PetRuleNotiShort = false;

    @SwitchProperty({
        name: "Pet Rule Notifier Sound",
        description: "Plays a sound when you swap pets",
        category: "Pets",
        subcategory: "§3Noti"
    })
    PetRuleSound = false;

    @SwitchProperty({
        name: "Use custom color instead of rarity",
        description: "When displaying, will use the color you set instead of the pets rarity",
        category: "Pets",
        subcategory: "§3Noti"
    })
    customPetRuleColor = false;

    // --- DUNGEON SECTION (Sorted: Masks -> Party -> Death Tick -> Dupe Class -> Secrets -> Quiz) ---
    @SwitchProperty({
        name: "Bonzo, Phoenix, and Spirit Messages",
        description: "Announces when one of the above proc",
        category: "Dungeon",
        subcategory: "§0Masks"
    })
    maskPhoenixMsg = false;

    @TextProperty({
        name: "Bonzo Mask Text",
        description: "Text used for Bonzo Mask Message",
        category: "Dungeon",
        subcategory: "§0Masks"
    })
    maskText = "Bonzo Mask Procced!";

    @TextProperty({
        name: "Phoenix Text",
        description: "Text used for Phoenix Message",
        category: "Dungeon",
        subcategory: "§0Masks"
    })
    phoenixText = "Phoenix Procced!";

    @TextProperty({
        name: "Spirit Mask Text",
        description: "Text used for Spirit Mask Message",
        category: "Dungeon",
        subcategory: "§0Masks"
    })
    spiritText = "Spirit Mask Procced!";

    @SwitchProperty({
        name: "Invincibility Display",
        description: "Shows the cooldown of the masks when you proc them",
        category: "Dungeon",
        subcategory: "§0Masks"
    })
    invincibilityDisplay = false;

    @SelectorProperty({
        name: "Invincibility Display Mode",
        description: "Choose when to show the invincibility display in dungeons",
        category: "Dungeon",
        subcategory: "§0Masks",
        options: ["Always", "Only in Boss", "Only in P3"]
    })
    invincibilityDisplayMode = 0;

    @SwitchProperty({
        name: "Always show",
        description: "if toggled, the text will always show even if off cooldown in dungeons",
        category: "Dungeon",
        subcategory: "§0Masks",
    })
    invincibilityDisplayAlways = false;

    // 1. Party (§a)
    @SwitchProperty({
        name: "Party Full Alarm",
        description: "plays a loud sound if party is full §cWIP§r",
        category: "Dungeon",
        subcategory: "§5Party"
    })
    partyFullNoti = false;

    @SwitchProperty({
        name: "Only when leader",
        description: "Only when leader do you hear the sound",
        category: "Dungeon",
        subcategory: "§5Party"
    })
    partyLeaderOnly = false;

    @SwitchProperty({
        name: "Party Dequeued Alarm",
        description: "plays a loud sound if party is dequeued §cWIP§r",
        category: "Dungeon",
        subcategory: "§5Party"
    })
    partyDequeuedAlarm = false;

    @SliderProperty({
        name: "Party Full Alarm Volume",
        description: "",
        category: "Dungeon",
        subcategory: "§5Party",
        min: 0,
        max: 10,
        increment: 1
    })
    partyNotiVolume = 1;

    @SliderProperty({
        name: "Party Full Alarm Time",
        description: "How long the alarm should sound for",
        category: "Dungeon",
        subcategory: "§5Party",
        min: 0,
        max: 10,
        increment: 1
    })
    partyNotiTime = 1;


    // 2. Death Tick (§b)
    @SwitchProperty({
        name: "Death Tick Timer",
        description: "",
        category: "Dungeon",
        subcategory: "§7Death Tick"
    })
    deathTickTimer = false;

    @SwitchProperty({
        name: "Use seconds instead of ticks",
        description: "",
        category: "Dungeon",
        subcategory: "§7Death Tick"
    })
    deathTickTimerType = false;

    @SwitchProperty({
        name: "Disable after blood open",
        description: "Disable after blood open instead of dungeon start",
        category: "Dungeon",
        subcategory: "§7Death Tick"
    })
    deathTickTimerBloodOpen = false;

    // 3. Dupe Class (§c)
    @SwitchProperty({
        name: "Dupe Class Notifier",
        description: "Notifys if theres a dupe class",
        category: "Dungeon",
        subcategory: "§8Dupe Class"
    })
    dupeClass = false;

    @SwitchProperty({
        name: "Ignore dupe mage",
        description: "",
        category: "Dungeon",
        subcategory: "§8Dupe Class"
    })
    ignoreDoubleMage = false;

    // 4. Secrets (§d)
    @SwitchProperty({
        name: "Secret Tracker",
        description: "Tracks secrets done by party",
        category: "Dungeon",
        subcategory: "§9Secrets"
    })
    SecretTracker = false;

    // 5. Quiz (§e)
    @SwitchProperty({
        name: "Quiz Timer",
        description: "Displays a timer for when quiz is ready",
        category: "Dungeon",
        subcategory: "§bQuiz"
    })
    QuizTimer = false;

    @SwitchProperty({
        name: "Blood Timer",
        description: "Displays when to kill blood mobs",
        category: "Dungeon",
        subcategory: "§cBlood"
    })
    bloodTimer = false;

    @SwitchProperty({
        name: "Blood Countdown",
        description: "Show a countdown to when to kill",
        category: "Dungeon",
        subcategory: "§cBlood"
    })
    btCountDown = false;

    @SwitchProperty({
        name: "Only Mage",
        description: "Only show when on mage",
        category: "Dungeon",
        subcategory: "§cBlood"
    })
    btMageOnly = false;

    @SwitchProperty({
        name: "Send to Party",
        description: "Send to Party instead of just your chat",
        category: "Dungeon",
        subcategory: "§cBlood"
    })
    btSendParty = false

    // --- BOSS ---
    @SwitchProperty({
        name: "Storm Timer",
        category: "Boss",
        subcategory: "§aStorm"
    })
    stormTimer = false;

    @SwitchProperty({
        name: "Send Storm Death Time",
        description: "Send time killed for each piller",
        category: "Boss",
        subcategory: "§aStorm"
    })
    sendStormTime = false;

    @SwitchProperty({
        name: "Archer Death Bow Swapper",
        category: "Boss",
        subcategory: "§aStorm"
    })
    autoSwap = false;

    @SwitchProperty({
        name: "Archer LB Swapper at Pillars",
        category: "Boss",
        subcategory: "§aStorm"
    })
    lastBreathSwap = false;

    @TextProperty({
        name: "Item to swap to from death bow",
        category: "Boss",
        subcategory: "§aStorm",
        placeholder: "ex. fabled hyperion"
    })
    autoSwapItem = "";

    @SwitchProperty({
        name: "py Last Breath Timer",
        category: "Boss",
        subcategory: "§aStorm"
    })
    pyLBTimer = false;

    @TextProperty({
        name: "py LB seconds",
        category: "Boss",
        subcategory: "§aStorm",
        placeholder: "34.6"
    })
    pyLBTimerSeconds = "34.6";

    // 2. GOLDOR (§b)
    @SwitchProperty({
        name: "Goldor Start Timer",
        category: "Boss",
        subcategory: "§bGoldor"
    })
    goldorStartTimer = false;

    @SwitchProperty({
        name: "Goldor Timer",
        category: "Boss",
        subcategory: "§bGoldor"
    })
    goldorTimer = false;

    @SelectorProperty({
        name: "Goldor Timer Version",
        category: "Boss",
        subcategory: "§bGoldor",
        options: ["death tick", "full section"]
    })
    goldorTimerType = 0;

    @SwitchProperty({
        name: "Show Goldor timer in ticks",
        category: "Boss",
        subcategory: "§bGoldor"
    })
    goldorTimerTicks = false;

    // 3. P3 (§c)
    @SwitchProperty({
        name: "Leap Notifier",
        category: "Boss",
        subcategory: "§cP3"
    })
    leapNoti = false;

    @SwitchProperty({
        name: "Melody Title",
        category: "Boss",
        subcategory: "§cP3"
    })
    MelodyTitle = false;

    @SwitchProperty({
        name: "Lever Trigger Bot",
        category: "Boss",
        subcategory: "§cP3"
    })
    leverTriggerBot = false;

    @SwitchProperty({
        name: "Enable Lever Trigger Bot for Device",
        category: "Boss",
        subcategory: "§cP3"
    })
    EnableForDevice = false;

    // 4. TERMINALS (§d)
    @SwitchProperty({
        name: "Terminal Notifier",
        category: "Boss",
        subcategory: "§dTerminals"
    })
    TermNoti = false;

    @CheckboxProperty({
        name: "Gate Blown Notifier",
        category: "Boss",
        subcategory: "§dTerminals"
    })
    GateNoti = true;

    @CheckboxProperty({
        name: "Disable standard term titles",
        category: "Boss",
        subcategory: "§dTerminals"
    })
    CancelTitles = true;

    @CheckboxProperty({
        name: "Keep Custom Term Titles on screen",
        category: "Boss",
        subcategory: "§dTerminals"
    })
    KeepTitles = true;

    @CheckboxProperty({
        name: "Show I4 done and Lights done",
        category: "Boss",
        subcategory: "§dTerminals"
    })
    instaNoti = false;

    @CheckboxProperty({
        name: "Full names",
        category: "Boss",
        subcategory: "§dTerminals"
    })
    fullName = false;

    @CheckboxProperty({
        name: "Show names",
        category: "Boss",
        subcategory: "§dTerminals"
    })
    detailedMode = false;

    @SwitchProperty({
        name: "Open Gui Editor",
        description: "§aLMB §7= Select | §aDrag §7= Move | §cRMB §7= Center | §bScroll §7= Scale | §eMiddle Click §7= Reset | §dR §7= Change color",
        category: "GUI",
        subcategory: "Editor"
    })
    guiEditor = false

    @SwitchProperty({
        name: "Disable Text Shadow",
        description: "Disable the text shadows for PrivateASF GUIS ONLY",
        category: "GUI",
        subcategory: "Editor"
    })
    disableTextShadow = false

    @SwitchProperty({
        name: "Armor and EQ gui",
        description: "Toggle the Armor and Equipment HUD display. (§c not fully working atm §r)",
        category: "GUI",
        subcategory: "invGUI"
    })
    invGUI = false;

    @ColorProperty({
        name: "Item Border Color",
        description: "Color for the individual item boxes.",
        category: "GUI",
        subcategory: "invGUI"
    })
    // Legacy: [80, 40, 100, 150]
    itemBorder = new Color(80 / 255, 40 / 255, 100 / 255, 150 / 255);

    @ColorProperty({
        name: "GUI Background Color",
        description: "Background color for the inventory overlay.",
        category: "GUI",
        subcategory: "invGUI"
    })
    // Legacy: [25, 10, 40, 130]
    invBgColor = new Color(25 / 255, 10 / 255, 40 / 255, 130 / 255);

    @ColorProperty({
        name: "GUI Border Color",
        description: "Outer border color for the inventory overlay.",
        category: "GUI",
        subcategory: "invGUI"
    })
    // Legacy: [120, 40, 180, 200]
    invBorderColor = new Color(120 / 255, 40 / 255, 180 / 255, 200 / 255);


    

    @SelectorProperty({
        name: "Prefix for mod chats",
        description: "",
        category: "Settings",
        subcategory: "Prefix",
        options: ["PrivateASF", "Private", "PA", "PASF"]
    })
    customPrefix = 0;

    @SwitchProperty({
        name: "More legit right clicks???",
        description: "Might be a more legit version of right click for features that right click for you, idk might be schitzo",
        category: "Settings",
        subcategory: "Right Clicks"
    })
    legitRightClicks = false
    
}

export default new config()