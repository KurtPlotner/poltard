import * as effect from "modules/effect.js"
import * as entity from "modules/entity.js"
import * as pathfinder from "modules/pathfinder.js"
import * as tile from "modules/tile.js"


//VARIABLES
const canvas = document.getElementById("canvas");
const canvas_width = canvas.width;
const canvas_height = canvas.height;
const ctx = canvas.getContext("2d");

const tile_map = new Image()
tile_map.src = "Asset.png"
const tile_source_size = 10
const tile_size = 10
const tileList = Object.freeze({
    "mushroom" : [0,0],
    "grass" : [1,0]
})

const map = new Map
const character_map = new Map
const entity_map = new Map

const turn_order = []
const TURN_PHASE = Object.freeze({
  TURN_START: "TURN_START",
  PRE_MOVE: "PRE_MOVE",
  MOVE: "MOVE",
  POST_MOVE: "POST_MOVE",
  PRE_ACTION: "PRE_ACTION",
  ACTION: "ACTION",
  POST_ACTION: "POST_ACTION",
  TURN_END: "TURN_END"
});
const TURN_PHASE_ORDER = Object.freeze([
  TURN_PHASE.TURN_START,
  TURN_PHASE.PRE_MOVE,
  TURN_PHASE.MOVE,
  TURN_PHASE.POST_MOVE,
  TURN_PHASE.PRE_ACTION,
  TURN_PHASE.ACTION,
  TURN_PHASE.POST_ACTION,
  TURN_PHASE.TURN_END
]);

const GAME_STATE = Object.freeze({
  PLAYER_TURN: "PLAYER_TURN",
  ENEMY_TURN: "ENEMY_TURN",
  CUTSCENE: "CUTSCENE",
  MENU: "MENU"
});

let current_character = 1

canvas.addEventListener("mousedown", function (e) {mouseHandeler(e)})

//MAIN CLASSES

class Phases {
    constructor() {

    }
    run() {
        TURN_PHASE_FUNCTIONS[game_loop._phase]
    }
    TURN_START() {
        console.log("a")
    }
    PRE_MOVE() {

    }
    MOVE() {

    }
    POST_MOVE() {

    }
    PRE_ACTION() {

    }
    ACTION() {

    }
    POST_ACTION() {

    }
    TURN_END() {

    }
}



class EventBus {
    constructor() {
        this.listeners = new Map()
    }
    on(event_type, handler) {
        if (!this.listeners.has(event_type)) {
            this.listeners.set(event_type, new Set())
        }
        this.listeners.get(event_type).add(handler);
    }
    off(event_type, handler) {
        this.listeners.get(event_type)?.delete(handler)
    }
    emit(event_type, payload) {
        this.listeners.get(event_type)?.forEach(handler => handler(payload))
    }
}

class GameLoop {
    constructor() {
        this.state = null
        this.phase = "TURN_START"
        this.activeEntity = null
        this.turnQueue = []
        this.isLocked = false
    }
    lock() {
        this.isLocked = true
    }
    unlock() {
        this.isLocked = false
    }
    nextPhase() {
        if (!this.isLocked) {
        const index = TURN_PHASE_ORDER.indexOf(this.phase);
        this.phase = TURN_PHASE_ORDER[index + 1] ?? TURN_PHASE.TURN_START;
        }
        document.getElementById("turn_phase_label").innerHTML = this.phase
    }
    endTurn() {
        this.phase = TURN_PHASE.TURN_START
        document.getElementById("turn_phase_label").innerHTML = this.phase
    }
    get _phase() {return this.phase}
}



//FUNCTIONS

function mouseHandeler(event) {
    let rect = canvas.getBoundingClientRect()
    let x_scale = rect.width / canvas. width
    let y_scale = rect.height / canvas.height
    let x = Math.floor(((event.clientX - rect.left) / x_scale) / tile_size)
    let y = Math.floor(((event.clientY - rect.top) / y_scale) / tile_size)
    character_map.get(current_character)?.mouse_handeler(x, y)
}

function updateStatLabels() {
    character = character_map.get(current_character)
    document.getElementById("HealthLabel").innerHTML = character._health
    document.getElementById("ManaLabel").innerHTML = character._mana

    document.getElementById("StrenghtLabel").innerHTML = character._strenght
    document.getElementById("AgilityLabel").innerHTML = character._agility
    document.getElementById("VitalityLabel").innerHTML = character._vitality
    document.getElementById("CharismaLabel").innerHTML = character._charisma
    document.getElementById("PerceptionLabel").innerHTML = character._perception
    document.getElementById("WisdomLabel").innerHTML = character._wisdom
    document.getElementById("IntelligenceLabel").innerHTML = character._intelligence
    document.getElementById("MovementPointsLabel").innerHTML = character._movement_points 
}

function updatePortaits() {
    document.getElementById("characterList").innerHTML = ""
    for (let i = 1; i <= character_map.size; i++) {
        let character = character_map.get(i)
        document.getElementById("characterList").innerHTML += `
            <div class="character-portrait" onclick="selectCharacter(${i})">
                <div class="portrait-sprite" style="background-position: -${character._x_source*80}px -${character._y_source*80}px;"></div>
                <span>${character.name}</span>
            </div>
        `
    }
}

function selectCharacter(id) {
    if (character_map.get(id) != null) {
        current_character = id
    }
    updateStatLabels()
}

function draw_grid() {
    for (let x = 0; x < canvas_width/tile_size; x++) {
        for (let y = 0; y < canvas_height/tile_size; y++) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(x*tile_size, y*tile_size, tile_size, tile_size);
        }
    }
}





const phases = new Phases()
const game_loop = new GameLoop()

let rawMap = [new Tile("grass", 0, 0),new Tile("grass", 1, 0),new Tile("grass", 2, 0),new Tile("grass", 3, 0),new Tile("grass", 4, 0),new Tile("grass", 5, 0),new Tile("grass", 6, 0),new Tile("grass", 7, 0),new Tile("grass", 8, 0),new Tile("grass", 9, 0),new Tile("grass", 0, 1),new Tile("grass", 1, 1),new Tile("grass", 2, 1),new Tile("grass", 3, 1),new Tile("grass", 4, 1),new Tile("grass", 5, 1),new Tile("grass", 6, 1),new Tile("grass", 7, 1),new Tile("grass", 8, 1),new Tile("grass", 9, 1),new Tile("grass", 0, 2),new Tile("grass", 1, 2),new Tile("grass", 2, 2),new Tile("grass", 3, 2),new Tile("grass", 4, 2),new Tile("grass", 5, 2),new Tile("grass", 6, 2),new Tile("grass", 7, 2),new Tile("grass", 8, 2),new Tile("grass", 9, 2),new Tile("grass", 0, 3),new Tile("grass", 1, 3),new Tile("grass", 2, 3),new Tile("grass", 3, 3),new Tile("grass", 4, 3),new Tile("grass", 5, 3),new Tile("grass", 6, 3),new Tile("grass", 7, 3),new Tile("grass", 8, 3),new Tile("grass", 9, 3),new Tile("grass", 0, 4),new Tile("grass", 1, 4),new Tile("grass", 2, 4),new Tile("grass", 3, 4),new Tile("grass", 4, 4),new Tile("grass", 5, 4),new Tile("grass", 6, 4),new Tile("grass", 7, 4),new Tile("grass", 8, 4),new Tile("grass", 9, 4),new Tile("grass", 0, 5),new Tile("grass", 1, 5),new Tile("grass", 2, 5),new Tile("grass", 3, 5),new Tile("grass", 4, 5),new Tile("grass", 5, 5),new Tile("grass", 6, 5),new Tile("grass", 7, 5),new Tile("grass", 8, 5),new Tile("grass", 9, 5),new Tile("grass", 0, 6),new Tile("grass", 1, 6),new Tile("grass", 2, 6),new Tile("grass", 3, 6),new Tile("grass", 4, 6),new Tile("grass", 5, 6),new Tile("grass", 6, 6),new Tile("grass", 7, 6),new Tile("grass", 8, 6),new Tile("grass", 9, 6),new Tile("grass", 0, 7),new Tile("grass", 1, 7),new Tile("grass", 2, 7),new Tile("grass", 3, 7),new Tile("grass", 4, 7),new Tile("grass", 5, 7),new Tile("grass", 6, 7),new Tile("grass", 7, 7),new Tile("grass", 8, 7),new Tile("grass", 9, 7),new Tile("grass", 0, 8),new Tile("grass", 1, 8),new Tile("grass", 2, 8),new Tile("grass", 3, 8),new Tile("grass", 4, 8),new Tile("grass", 5, 8),new Tile("grass", 6, 8),new Tile("grass", 7, 8),new Tile("grass", 8, 8),new Tile("grass", 9, 8),new Tile("grass", 0, 9),new Tile("grass", 1, 9),new Tile("grass", 2, 9),new Tile("grass", 3, 9),new Tile("grass", 4, 9),new Tile("grass", 5, 9),new Tile("grass", 6, 9),new Tile("grass", 7, 9),new Tile("grass", 8, 9),new Tile("grass", 9, 9),]
character_map.set(1, new Player("mushroom", 5, 5))
character_map.set(2, new Player("grass", 2, 5))
character_map.set(3, new Player("mushroom", 3, 5))
entity_map.set(1, new Entity("mushroom", 1, 1))
for (const tile in rawMap) {
    map.set(`${rawMap[tile].x}${rawMap[tile].y}`, rawMap[tile])
}

updatePortaits()
updateStatLabels()
document.getElementById("turn_phase_label").innerHTML = game_loop._phase

const TURN_PHASE_FUNCTIONS = Object.freeze({
    "TURN_START": phases.TURN_START(),
    "PRE_MOVE": phases.PRE_MOVE(),
    "MOVE": phases.MOVE(),
    "POST_MOVE": phases.POST_MOVE(),
    "PRE_ACTION": phases.PRE_ACTION(),
    "ACTION": phases.ACTION(),
    "POST_ACTION": phases.POST_ACTION(),
    "TURN_END": phases.TURN_END()
});


//MAIN LOOP

let last = 0
const fps = 60
const interval = 1000 / fps

function loop(now) {
    if (now - last >= interval){
        last = now
        //Turn phase
        phases.run()
        //Draw
        map.forEach(tile => {
            tile.draw()
        });
        character_map.forEach(character => {character.move_draw()})
        entity_map.forEach(entity => {entity.draw()})
        character_map.forEach(character => {character.draw()})
        character_map.get(current_character)?.highlight()
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);