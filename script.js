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

class Player {
    constructor (name, x, y) {
        this.x_position = x
        this.y_position = y
        this.name = name
        this.x_source = tileList[this.name][0]
        this.y_source = tileList[this.name][1]

        this.vitality = 10
        this.charisma = 10
        this.perception = 10
        this.agility = 10
        this.strength = 10
        this.wisdom = 10
        this.intelligence = 10

        this.health = this.vitality*10 + this.strength*5
        this.mana = this.intelligence*10
        this.movement_points = Math.round(this.agility * 0.2)

        this.moving = false
        this.move_list = []
        this.move_queue = []

        this.effects = []
    }
    move_check() {
        if (!this.moving) {
            this.moving = true
            game_loop.lock()
            this.move_list = area(this.x_position, this.y_position, this.movement_points)
        }
    }
    move(x, y) {
        const path = reversePath(x, y, this.move_list)
        if (path) {
            path.forEach(tile => {
                map.get(`${tile.x}${tile.y}`).trigger(this)
            })
        }
    }
    move_draw() {
        if (character_map.get(current_character) === this)
            this.move_list.forEach(tile => {
                map.get(`${tile.x}${tile.y}`).highlight()
        })
    }
    mouse_handeler(x, y) {
        if (this.moving) {
            this.move(x, y)
        }
    }
    highlight() {
        ctx.strokeStyle = "lightblue"
        ctx.strokeRect(this.x_position*tile_size, this.y_position*tile_size,
                    tile_size, tile_size
        )
    }
    draw() {
        ctx.drawImage(tile_map, this.x_source * tile_source_size, this.y_source * tile_source_size,
                  tile_source_size, tile_source_size,
                  this.x_position * tile_size, this.y_position * tile_size,
                  tile_size, tile_size
        )
    }
    get x() {return this.x_position}
    get y() {return this.y_position}
    get is_alive() {return this.health > 0}
    get _x_source() {return this.x_source}
    get _y_source() {return this.y_source}

    get _health() {return this.health}
    get _mana() {return this.mana}
    get _movement_points() {return this.movement_points}

    get _strenght() {return this.strength}
    get _agility() {return this.agility}
    get _vitality() {return this.vitality}
    get _charisma() {return this.charisma}
    get _perception() {return this.perception}
    get _wisdom() {return this.wisdom}
    get _intelligence() {return this.intelligence}
}

class Entity {
    constructor(name, x, y, passable=false) {
        this.x_position = x
        this.y_position = y
        this.name = name
        this.passable = passable

        this.effects = []
    }
    get x() {return this.x_position}
    get y() {return this.y_position}
    draw() {
        [this.x_source, this.y_source] = tileList[this.name]
        ctx.drawImage(tile_map, this.x_source * tile_source_size, this.y_source * tile_source_size,
                  tile_source_size, tile_source_size,
                  this.x_position * tile_size, this.y_position * tile_size,
                  tile_size, tile_size
        )
    }
}

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

class Tile {
    constructor(name, x, y, passable = true, cost = 1) {
        this.x_position = x
        this.y_position = y
        this.name = name
        this._passable = passable
        this.cost = cost

        this.effects = []
    }
    get x() {return this.x_position}
    get y() {return this.y_position}
    get passable() {return this._passable}
    set passable(v) {this._passable = v}
    highlight(color="rgba(0, 191, 255, 0.5)") {
        ctx.fillStyle = color; 
        ctx.fillRect(this.x_position*tile_size, this.y_position*tile_size,
                       tile_size, tile_size)
    }
    draw() {
        [this.x_source, this.y_source] = tileList[this.name]
        ctx.drawImage(tile_map, this.x_source * tile_source_size, this.y_source * tile_source_size,
                  tile_source_size, tile_source_size,
                  this.x_position * tile_size, this.y_position * tile_size,
                  tile_size, tile_size
        )
    }
    trigger(entity) {
        this.effects.forEach(effect => {
            effect(entity, this)
        })
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

class Path {
    constructor(start, end) {
        this.open_list = []
        this.closed_list = []
        this.path = []
        this.end = end
        this.open_list.push({
            x: start.x,
            y: start.y,
            h: 0,
            g: 0,
            f: 0,
            parent: undefined
        })
        this.find_path()
    }
    find_path() {
        while (this.open_list.length > 0) {
            let current_node = this.open_list[0]
            for (let i = 1; i < this.open_list.length; i++) {
                if (this.open_list[i].f < current_node.f || (this.open_list[i].f === current_node.f && this.open_list[i].h < current_node.h)) {
                    current_node = this.open_list[i]
                }
            }
            this.open_list.splice(this.open_list.indexOf(current_node), 1)
            this.closed_list.push(current_node)

            if (current_node.x === this.end.x && current_node.y === this.end.y) {
                let temp = current_node
                while (temp) {
                    this.path.push(temp)
                    temp = temp.parent
                }
                this.path.reverse()
                console.log("Path has been found ", this.path)
                break;
            }

            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]

            for (let dir of directions) {
                let x_position = current_node.x + dir[0]
                let y_position = current_node.y + dir[1]
                console.log(x_position, current_node.x)

                if (isValid(x_position, y_position)) {
                    const neighbor = {
                        x: x_position,
                        y: y_position,
                        g: current_node.g + map.get(`${x_position}${y_position}`).cost,
                        h: dist(x_position, y_position, this.end.x, this.end.y)["total_distance"],
                        f: 0,
                        parent: current_node
                    }
                    neighbor.f = neighbor.g + neighbor.h

                    if (this.closed_list.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                    continue;
                    }
                    
                    const open_list_tile = this.open_list.find((node) => node.x === neighbor.x && node.y === neighbor.y)
                    if (!open_list_tile || neighbor.g < open_list_tile.g) {
                        this.open_list.push(neighbor)
                        console.log(this.open_list)
                    }
                }
            }
        }
    }
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

function dist(x_start, y_start, x_end, y_end) {
    let x_distance = x_start - x_end
    let y_distance = y_start - y_end
    let total_distance = Math.abs(x_distance) + Math.abs(y_distance)
    return {x_distance:x_distance, y_distance:y_distance, total_distance:total_distance}
}

function isValid(x, y) {
    let tile = map.get(`${x}${y}`)
    if (tile && tile.passable) return true
    else return false
}

function reversePath(x, y, path) {
    let filteredPath = path.filter((tile) => tile.x === x && tile.y === y)
    if (filteredPath.length > 0) {
        currentTile = filteredPath[0]
        if (filteredPath.length > 1) {
            filteredPath.forEach((tile) => {
                if (tile.g < currentTile.g) {
                    currentTile = tile
                }
            })
        }
        let result = []
        while (currentTile) {
            result.push(currentTile)
            currentTile = currentTile.parent
        }
        return result.reverse()
    }
    return undefined
}

function area(x, y, distance=1) {
    let openSet = []
    let closedSet = []
    openSet.push({
        x:x,
        y:y,
        g:0,
        parent:undefined
    })

    while (openSet.length > 0) {
        currentNode = openSet[0]
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].g > currentNode.g) {
                currentNode = openSet[i]
            }
        }

        openSet.splice(openSet.indexOf(currentNode), 1);
        closedSet.push(currentNode);


        directions = [[0,1], [1,0], [0,-1], [-1,0]]

        for (let dir of directions) {
            xPos = currentNode.x + dir[0]
            yPos = currentNode.y + dir[1]

            if (isValid(xPos, yPos)) {
                neighbor = {
                    x:xPos,
                    y:yPos,
                    g:currentNode.g + map.get(`${xPos}${yPos}`).cost,
                    parent:currentNode
                }
            
            if (closedSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                continue
            }

            const openSetNode = openSet.find((node) => node.x === neighbor.x && node.y === neighbor.y)
            if ((!openSetNode || openSetNode.g > neighbor.g) && neighbor.g <= distance) {
                openSet.push(neighbor)
            }
            }
        }
    }
    return closedSet;
}

//EFFECTS

class TileEffects {
    constructor() {
        this.name = "effect"
    }
    execute(entity, tile) {
        return
    }
}
class TileTestEffect extends TileEffects {
    execute(entity, tile) {
        console.log("trigger", tile.x, " ", tile.y)
    }
}

class Effect {
    constructor() {
        this.name = "effect"
    }
    execute(unit) {
        return
    }
    on_phase(phase, unit) {
        if (phase == turn_phase.TURN_START) {
            return
        }
    }
}

class Posion extends Effect {
    constructor(duration, level) {
        this.name = "Posion"
        this.duration = duration
        this.level = level
        this.damage = level * 2
    }
    execute(unit) {
        unit.damage(this.damage)
    }
    on_phase(phase, unit) {
        if (phase == turn_phase.TURN_START && unit.is_alive) {
            this.execute(unit)
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