'use strict';

var uuid = require('uuid');

class Component {
    constructor(parent, options) {
        this.active = true;
        this.Parent = parent;
    }
    destroy() { }
    initComponent() { }
    initEntity() { }
    onUpdate(deltaTime, elapsedTime) { }
    // getters
    get System() {
        return this.Parent.System;
    }
    //
    findEntity(name) {
        return this.Parent.findEntity(name);
    }
    getComponent(name) {
        return this.Parent.getComponent(name);
    }
    isActive() {
        if (this.active)
            return true;
        else
            return false;
    }
    setActive(value) {
        this.active = value;
    }
    update(deltaTime, elapsedTime) {
        this.onUpdate(deltaTime, elapsedTime);
    }
}

let instances$1 = 0;
class Entity {
    constructor(system, options) {
        this.dead = false;
        this.uuid = uuid.v4();
        this.name = `ecs-entity#${instances$1 + 1}`;
        this.Components = {};
        this.System = system;
        this.Parent = system;
        instances$1++;
    }
    addComponent(componentClass, options) {
        const C = new componentClass(this, options ? options : {});
        this.Components[C.constructor.name] = C;
        C.initComponent();
    }
    destroy() {
        for (const c in this.Components) {
            this.Components[c].destroy();
        }
        this.Components = {};
    }
    findEntity(name) {
        return this.System.get(name);
    }
    getComponent(name) {
        return this.Components[name];
    }
    initEntity() {
        for (const c in this.Components) {
            this.Components[c].initEntity();
        }
    }
    kill() {
        this.dead = true;
    }
    setActive(value) {
        this.System.setActive(this, value);
    }
    setName(name) {
        this.name = name;
    }
    update(deltaTime, elapsedTime) {
        for (const c in this.Components) {
            if (this.Components[c].active)
                this.Components[c].update(deltaTime, elapsedTime);
        }
    }
}

let instances = 0;
class System {
    constructor() {
        this.ids = 0;
        this.name = `ecs-system#${instances + 1}`;
        this.uuid = uuid.v4();
        this.Assemblies = {};
        this.Entities = {
            array: [],
            map: {},
            uses: {},
        };
        instances++;
    }
    add(entity, name) {
        const n = name ? name : this.generateName(entity);
        this.Entities.map[n] = entity;
        this.Entities.array.push(entity);
        entity.setName(n);
        entity.initEntity();
    }
    assemble(name, entityClass, options) {
        const classPicked = entityClass ? entityClass : Entity;
        const e = new classPicked(this, options && options.entityOptions ? options.entityOptions : {});
        const entityName = options && options.entityName ? options.entityName : this.generateName(e);
        this.Assemblies[name](e);
        this.add(e, entityName);
    }
    createAssembly(name, buildMethod) {
        this.Assemblies[name] = buildMethod ? buildMethod : (e) => { };
    }
    filter(cb) {
        return this.Entities.array.filter(cb);
    }
    generateName(entity) {
        this.ids++;
        return `${entity.constructor.name}-${this.ids}`;
    }
    get(name) {
        return this.Entities.map[name];
    }
    setActive(entity, value) {
        const i = this.Entities.array.indexOf(entity);
        if (!value) {
            if (i < 0)
                return;
            this.Entities.array.splice(i, 1);
        }
        else {
            if (i >= 0)
                return;
            this.Entities.array.push(entity);
        }
    }
    update(deltaTime, elapsedTime) {
        const alive = [];
        const dead = [];
        for (let i = 0; i < this.Entities.array.length; i++) {
            const e = this.Entities.array[i];
            e.update(deltaTime, elapsedTime);
            if (e.dead)
                dead.push(e);
            else
                alive.push(e);
        }
        for (let i = 0; i < dead.length; i++) {
            const e = dead[i];
            delete this.Entities.map[e.name];
            e.destroy();
        }
        this.Entities.array = alive;
    }
}

// taken from three.js r150
class Clock {
    constructor(autoStart = true) {
        this.startTime = 0;
        this.oldTime = 0;
        this.elapsedTime = 0;
        this.running = false;
        this.autoStart = autoStart;
    }
    start() {
        this.startTime = now();
        this.oldTime = this.startTime;
        this.elapsedTime = 0;
        this.running = true;
    }
    stop() {
        this.getElapsedTime();
        this.running = false;
        this.autoStart = false;
    }
    getElapsedTime() {
        this.getDelta();
        return this.elapsedTime;
    }
    getDelta() {
        let diff = 0;
        if (this.autoStart && !this.running) {
            this.start();
            return 0;
        }
        if (this.running) {
            const newTime = now();
            diff = (newTime - this.oldTime) / 1000;
            this.oldTime = newTime;
            this.elapsedTime += diff;
        }
        return diff;
    }
}
function now() {
    return (typeof performance === 'undefined' ? Date : performance).now(); // see #10732
}

class StandaloneSystem extends System {
    constructor() {
        super();
        this.delta = 0;
        this.elapsed = 0;
        this.Clock = new Clock();
    }
    loop() {
        requestAnimationFrame(() => {
            this.delta = this.Clock.getDelta();
            this.elapsed = this.Clock.getElapsedTime();
            this.update(this.delta, this.elapsed);
            this.loop();
        });
    }
}

exports.Component = Component;
exports.Entity = Entity;
exports.StandaloneSystem = StandaloneSystem;
exports.System = System;
