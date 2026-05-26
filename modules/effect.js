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
