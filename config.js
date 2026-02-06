// import Settings from "../Amaterasu/core/Settings"
// import DefaultConfig from "../Amaterasu/core/DefaultConfig"
// import { chat } from "./util/utils"
// import { activategui, OverlayEditor } from "./managers/guimanager"

// const config = new DefaultConfig("PrivateASF-Fabric", "data/settings.json")

//     .addSwitch({
//         category: "Highlight",
//         subcategory: "Boss",
//         configName: "espWither",
//         title: "Wither Highlight",
//         description: "Highlight for Withers in F7 & M7",
//         registerListener(previousValue, newValue) {
//             chat(`&7Wither Highlight ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addDropDown({
//         category: "Highlight",
//         subcategory: "Boss",
//         configName: "espWitherType",
//         title: "Wither Highlight Type",
//         description: "",
//         options: ["Box", "Filled"],
//         value: 0,
//         shouldShow: data => data.espWither
//     })
//     .addSwitch({
//         category: "Highlight",
//         subcategory: "Boss",
//         configName: "witherThruBlocks",
//         title: "ESP mode",
//         description: "",
//         shouldShow: data => data.espWither
//     })
//     // .addSwitch({
//     //     category: "Highlight",
//     //     subcategory: "Boss",
//     //     configName: "witherTracer",
//     //     title: "Wither Tracer in P3",
//     //     description: "&cRequires Odin",
//     //     value: false,
//     //     shouldShow: data => data.espWither
//     // })
//     .addColorPicker({
//         category: "Highlight",
//         subcategory: "Boss",
//         configName: "witherESPColorBox",
//         title: "Wither Box Color",
//         description: "",
//         value: [244, 0, 25, 96],
//         shouldShow: data => data.espWither
//     })
//     .addColorPicker({
//         category: "Highlight",
//         subcategory: "Boss",
//         configName: "witherESPColorFill",
//         title: "Wither Fill Color",
//         description: "",
//         value: [244, 0, 25, 96],
//         shouldShow: data => data.espWither
//     })





//     .addSwitch({
//         category: "Pets",
//         subcategory: "gui",
//         configName: "CurrentPetGui",
//         title: "Current pet display",
//         description: "displays your current pet &cWIP",
//         registerListener(previousValue, newValue) {
//             chat(`&7Pet GUI ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Pets",
//         subcategory: "chat",
//         configName: "CancelPetChats",
//         title: "Custom pet messages in chat",
//         description: "Replaces all pet messages (level, summon, autopet) with a custom one",
//         registerListener(previousValue, newValue) {
//             chat(`&7Custom Pet Messages ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Pets",
//         subcategory: "Noti",
//         configName: "PetRuleNoti",
//         title: "Pet Rule Notifier",
//         description: "Displays a title of the pet that was equipped",
//         registerListener(previousValue, newValue) {
//             chat(`&7Pet Rule Notifier ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Pets",
//         subcategory: "Noti",
//         configName: "PetRuleNotiShort",
//         title: "Shorten Pet Rule Noti",
//         description: "Shortens Pet rule noti to just the pet",
//         shouldShow: data => data.PetRuleNoti
//     })
//     .addSwitch({
//         category: "Pets",
//         subcategory: "Noti",
//         configName: "PetRuleSound",
//         title: "Pet Rule Notifier Sound",
//         description: "Plays a sound when you swap pets",
//         shouldShow: data => data.PetRuleNoti
//     })
//     .addSwitch({
//         category: "Pets",
//         subcategory: "Noti",
//         configName: "customPetRuleColor",
//         title: "Use custom color instead of rarity",
//         description: "When displaying, will use the color you set instead of the pets rarity",
//         shouldShow: data => data.PetRuleNoti
//     })



//     .addSwitch({
//         category: "Dungeon",
//         subcategory: "Secrets",
//         configName: "SecretTracker",
//         title: "Secret Tracker",
//         description: "Tracks secrets done by party",
//         registerListener(previousValue, newValue) {
//             chat(`&7Secret Tracker ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Dungeon",
//         subcategory: "Quiz",
//         configName: "QuizTimer",
//         title: "Quiz Timer",
//         description: "Displays a timer for when quiz is ready",
//         registerListener(previousValue, newValue) {
//             chat(`&7Quiz Timer ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Dungeon",
//         subcategory: "dupe",
//         configName: "dupeClass",
//         title: "Dupe Class Notifier",
//         description: "Notifys if theres a dupe class",
//         registerListener(previousValue, newValue) {
//             chat(`&7Dupe Class Notifier ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Dungeon",
//         subcategory: "dupe",
//         configName: "ignoreDoubleMage",
//         title: "Ignore dupe mage",
//         description: "",
//         shouldShow: data => data.dupeClass
//     })
//     .addSwitch({
//         category: "Dungeon",
//         subcategory: "Death Tick",
//         configName: "deathTickTimer",
//         title: "Death Tick Timer",
//         description: ""
//     })
//     .addSwitch({
//         category: "Dungeon",
//         subcategory: "Death Tick",
//         configName: "deathTickTimerType",
//         title: "Use seconds instead of ticks",
//         description: "",
//         shouldShow: data => data.deathTickTimer
//     })
//     .addSwitch({
//         category: "Dungeon",
//         subcategory: "Party",
//         configName: "partyFullNoti",
//         title: "Party Full Alarm",
//         description: "plays a loud sound if party is full &cWIP&r",
//         registerListener(previousValue, newValue) {
//             chat(`&7Party Full Alarm ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Dungeon",
//         subcategory: "Party",
//         configName: "partyLeaderOnly",
//         title: "Only when leader",
//         description: "Only when leader do you hear the sound",
//         shouldShow: data => data.partyFullNoti
//     })
//     .addSwitch({
//         category: "Dungeon",
//         subcategory: "Party",
//         configName: "partyDequeuedAlarm",
//         title: "Party Dequeued Alarm",
//         description: "plays a loud sound if party is dequeued &cWIP&r",
//         registerListener(previousValue, newValue) {
//             chat(`&7Party Dequeued Alarm ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSlider({
//         category: "Dungeon",
//         subcategory: "Party",
//         configName: "partyNotiVolume",
//         title: "Party Full Alarm Volume",
//         description: "",
//         options: [0, 10],
//         step: 1,
//         value: 5,
//         shouldShow: data => data.partyFullNoti || data.partyDequeuedAlarm
//     })
//     .addSlider({
//         category: "Dungeon",
//         subcategory: "Party",
//         configName: "partyNotiTime",
//         title: "Party Full Alarm Time",
//         description: "How long the alarm should sound for",
//         options: [0, 10],
//         step: 1,
//         value: 4,
//         shouldShow: data => data.partyFullNoti || data.partyDequeuedAlarm
//     })

//     .addSwitch({
//         category: "Boss",
//         subcategory: "P2",
//         configName: "stormTimer",
//         title: "Storm Timer",
//         description: "A timer for the entire storm phase",
//         registerListener(previousValue, newValue) {
//             chat(`&7Storm Timer ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P2",
//         configName: "sendStormTime",
//         title: "Send Storm Time",
//         description: "Send time killed for each piller",
//         registerListener(previousValue, newValue) {
//             chat(`&7Send Storm Time ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P2",
//         configName: "autoSwap",
//         title: "Archer Death Bow Swapper",
//         description: "",
//         registerListener(previousValue, newValue) {
//             chat(`&7Archer Death Bow Swapper ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P2",
//         configName: "lastBreathSwap",
//         title: "Archer LB Swapper at Pillars",
//         description: "",
//         shouldShow: data => data.autoSwap,
//         registerListener(previousValue, newValue) {
//             chat(`&7Archer Last Breath Swapper ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addTextInput({
//         category: "Boss",
//         subcategory: "P2",
//         configName: "autoSwapItem",
//         title: "Item to swap to from death bow",
//         description: "",
//         shouldShow: data => data.autoSwap
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P2",
//         configName: "pyLBTimer",
//         title: "py Last Breath Timer",
//         description: "Timer for a perfect py LB (idk why wayzel wanted ts, it's lowkey ass)",
//         registerListener(previousValue, newValue) {
//             chat(`&7py Last Breath Timer ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addTextInput({
//         category: "Boss",
//         subcategory: "P2",
//         configName: "pyLBTimerSeconds",
//         title: "The time it should countdown to in seconds",
//         description: "",
//         placeHolder: 34.6,
//         value: 34.6,
//         shouldShow: data => data.pyLBTimer
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "leapNoti",
//         title: "Leap Notifier",
//         description: "",
//         registerListener(previousValue, newValue) {
//             chat(`&7Leap Notifier ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "goldorStartTimer",
//         title: "Goldor Start Timer",
//         description: "",
//         registerListener(previousValue, newValue) {
//             chat(`&7Goldor Timer ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "goldorTimer",
//         title: "Goldor Timer",
//         description: "a tick timer idk",
//         registerListener(previousValue, newValue) {
//             chat(`&7Goldor Timer ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addDropDown({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "goldorTimerType",
//         title: "Goldor Timer Version",
//         description: "",
//         options: ["death tick", "full section"],
//         value: 0,
//         shouldShow: data => data.goldorTimer
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "goldorTimerTicks",
//         title: "Show goldor timer in ticks instead",
//         description: "",
//         shouldShow: data => data.goldorTimer
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "TermNoti",
//         title: "Terminal Notifier",
//         description: "Notifys of term/dev/lever being done",
//         registerListener(previousValue, newValue) {
//             chat(`&7Terminal Notifier ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addMultiCheckbox({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "TermNotiToggles",
//         title: "Term Noti Settings",
//         description: "",
//         options: [
//             {
//                 title: "Gate Blown Notifier",
//                 configName: "GateNoti",
//                 value: true
//             },
//             {
//                 title: "Disable standard term titles",
//                 configName: "CancelTitles",
//                 value: true
//             },
//             {
//                 title: "Keep Custom Term Titles on screen",
//                 configName: "KeepTitles",
//                 value: true
//             },
//             {
//                 title: "Show I4 done and Lights done",
//                 configName: "instaNoti",
//                 value: false
//             },
//             {
//                 title: "full names (terminal, device, lever)",
//                 configName: "fullName",
//                 value: false
//             },
//             {
//                 title: "Show names",
//                 configName: "detailedMode",
//                 value: false
//             }
//         ],
//         shouldShow: data => data.TermNoti,
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "MelodyTitle",
//         title: "Melody Title",
//         description: "Displays a title of who has a melody and the progress",
//         registerListener(previousValue, newValue) {
//             chat(`&7Melody Title ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "leverTriggerBot",
//         title: "Lever Trigger Bot",
//         description: "&cidk use at your own risk",
//         registerListener(previousValue, newValue) {
//             chat(`&7Lever Trigger Bot ${newValue ? "&aEnabled" : "&cDisabled"}`)
//         }
//     })
//     .addSwitch({
//         category: "Boss",
//         subcategory: "P3",
//         configName: "EnableForDevice",
//         title: "Enable Lever Trigger Bot for Device",
//         description: "",
//         shouldShow: data => data.leverTriggerBot
//     })


//     .addTextParagraph({
//         category: "GUI",
//         subcategory: "gui",
//         configName: "MoveOverlayText",
//         title: "Gui Editor Instructions",
//         description: "&aLMB &7= Select | &aDrag &7= Move | &cRMB &7= Center | &bScroll &7= Scale | &eMiddle Click &7= Reset | &dR &7= Change color",
//         centered: true
//     })
//     .addButton({
//         category: "GUI",
//         subcategory: "gui",
//         configName: "MoveOverlays",
//         title: "Gui Editor",
//         description: "Move and resize all overlays",
//         onClick: () => {
//             Client.currentGui.close()
//             OverlayEditor.open()
//             activategui()
//         }
//     })
//     .addSwitch({
//         category: "GUI",
//         subcategory: "invGUI",
//         configName: "invGUI",
//         title: "Armor and EQ gui",
//         description: "Not ported yet, kinda weird ngl"
//     })
//     .addColorPicker({
//         category: "GUI",
//         subcategory: "invGUI",
//         configName: "itemBorder",
//         title: "Item Border Color",
//         description: "",
//         value: [80, 40, 100, 150],
//         shouldShow: data => data.invGUI
//     })
//     .addColorPicker({
//         category: "GUI",
//         subcategory: "invGUI",
//         configName: "invBgColor",
//         title: "GUI Background Color",
//         description: "",
//         value: [25, 10, 40, 130],
//         shouldShow: data => data.invGUI
//     })
//     .addColorPicker({
//         category: "GUI",
//         subcategory: "invGUI",
//         configName: "invBorderColor",
//         title: "GUI Border Color",
//         description: "",
//         value: [120, 40, 180, 200],
//         shouldShow: data => data.invGUI
//     })

// // Initialize as null
// let setting = null;

// Client.scheduleTask(0, () => {
//     setting = new Settings("PrivateASF-Fabric", config, "data/ColorScheme.json");
// });

// export default () => {
//     // If setting isn't ready, return an empty object so property 
//     // access like config().autoSwap just returns undefined instead of crashing.
//     if (!setting) return {}; 

//     return setting.settings;
// }









import { chat } from "./util/utils";
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

import { Color } from "../barrl/Barrl"

@Vigilant("PrivateASF-Fabric/data", "§5PrivateASF-Fabric", {
    getCategoryComparator: () => (a, b) => {
        const categories = ['Highlight', 'Pets', 'Dungeon', 'Boss', 'GUI'];
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


        this.addDependency("Ignore dupe mage", "Dupe Class Notifier");

        this.addDependency("Use seconds instead of ticks", "Death Tick Timer")



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
            chat(`&aOverlays shadow is now: ${data.globalShadow ? "&bON" : "&cOFF"}`)
        })
    }

    @SwitchProperty({
        name: "Wither Highlight",
        description: "Highlight for Withers in F7 & M7",
        category: "Highlight",
        subcategory: "Boss"
    })
    espWither = false;

    @SelectorProperty({
        name: "Wither Highlight Type",
        description: "",
        category: "Highlight",
        subcategory: "Boss",
        options: ["Box", "Box Filled"]
    })
    espWitherType = 0;

    @ColorProperty({
        name: "Wither Box Color",
        description: "",
        category: "Highlight",
        subcategory: "Boss"
    })
    witherESPColorBox = new Color(244 / 255, 0, 25 / 255, 96 / 255);

    @ColorProperty({
        name: "Wither Fill Color",
        description: "",
        category: "Highlight",
        subcategory: "Boss"
    })
    witherESPColorFill = new Color(244 / 255, 0, 25 / 255, 96 / 255);

    @SwitchProperty({
        name: "ESP mode",
        description: "",
        category: "Highlight",
        subcategory: "Boss"
    })
    witherThruBlocks = false;
    @SwitchProperty({
        name: "Wither Tracer in P3",
        description: "",
        category: "Highlight",
        subcategory: "Boss"
    })
    witherTracer = false;

    // --- PETS ---
    @SwitchProperty({
        name: "Current pet display",
        description: "displays your current pet &cWIP",
        category: "Pets",
        subcategory: "gui"
    })
    CurrentPetGui = false;

    @SwitchProperty({
        name: "Custom pet messages in chat",
        description: "Replaces all pet messages (level, summon, autopet) with a custom one",
        category: "Pets",
        subcategory: "chat"
    })
    CancelPetChats = false;

    @SwitchProperty({
        name: "Pet Rule Notifier",
        description: "Displays a title of the pet that was equipped",
        category: "Pets",
        subcategory: "Noti"
    })
    PetRuleNoti = false;

    @SwitchProperty({
        name: "Shorten Pet Rule Noti",
        description: "Shortens Pet rule noti to just the pet",
        category: "Pets",
        subcategory: "Noti"
    })
    PetRuleNotiShort = false;

    @SwitchProperty({
        name: "Pet Rule Notifier Sound",
        description: "Plays a sound when you swap pets",
        category: "Pets",
        subcategory: "Noti"
    })
    PetRuleSound = false;

    @SwitchProperty({
        name: "Use custom color instead of rarity",
        description: "When displaying, will use the color you set instead of the pets rarity",
        category: "Pets",
        subcategory: "Noti"
    })
    customPetRuleColor = false;

    // --- DUNGEON SECTION (Sorted: Party -> Death Tick -> Dupe Class -> Secrets -> Quiz) ---


    // 1. Party (§a)
    @SwitchProperty({
        name: "Party Full Alarm",
        description: "plays a loud sound if party is full &cWIP&r",
        category: "Dungeon",
        subcategory: "§aParty"
    })
    partyFullNoti = false;

    @SwitchProperty({
        name: "Only when leader",
        description: "Only when leader do you hear the sound",
        category: "Dungeon",
        subcategory: "§aParty"
    })
    partyLeaderOnly = false;

    @SwitchProperty({
        name: "Party Dequeued Alarm",
        description: "plays a loud sound if party is dequeued &cWIP&r",
        category: "Dungeon",
        subcategory: "§aParty"
    })
    partyDequeuedAlarm = false;

    @SliderProperty({
        name: "Party Full Alarm Volume",
        description: "",
        category: "Dungeon",
        subcategory: "§aParty",
        min: 0,
        max: 10,
        increment: 1
    })
    partyNotiVolume = 1;

    @SliderProperty({
        name: "Party Full Alarm Time",
        description: "How long the alarm should sound for",
        category: "Dungeon",
        subcategory: "§aParty",
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
        subcategory: "§bDeath Tick"
    })
    deathTickTimer = false;

    @SwitchProperty({
        name: "Use seconds instead of ticks",
        description: "",
        category: "Dungeon",
        subcategory: "§bDeath Tick"
    })
    deathTickTimerType = false;

    // 3. Dupe Class (§c)
    @SwitchProperty({
        name: "Dupe Class Notifier",
        description: "Notifys if theres a dupe class",
        category: "Dungeon",
        subcategory: "§cDupe Class"
    })
    dupeClass = false;

    @SwitchProperty({
        name: "Ignore dupe mage",
        description: "",
        category: "Dungeon",
        subcategory: "§cDupe Class"
    })
    ignoreDoubleMage = false;

    // 4. Secrets (§d)
    @SwitchProperty({
        name: "Secret Tracker",
        description: "Tracks secrets done by party",
        category: "Dungeon",
        subcategory: "§dSecrets"
    })
    SecretTracker = false;

    // 5. Quiz (§e)
    @SwitchProperty({
        name: "Quiz Timer",
        description: "Displays a timer for when quiz is ready",
        category: "Dungeon",
        subcategory: "§eQuiz"
    })
    QuizTimer = false;


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
        description: "&aLMB &7= Select | &aDrag &7= Move | &cRMB &7= Center | &bScroll &7= Scale | &eMiddle Click &7= Reset | &dR &7= Change color",
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
        description: "Toggle the Armor and Equipment HUD display. (&c not fully working atm &r)",
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
}

export default new config()