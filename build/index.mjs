import { v4 } from 'uuid';

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
        this.uuid = v4();
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
        this.dead = true;
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
        this.uuid = v4();
        this.Assemblies = {};
        this.Entities = {
            array: [],
            map: {},
            uses: {},
        };
        instances++;
    }
    add(entity, name) {
        if (!name)
            name = this.generateName(entity);
        this.Entities.map[name] = entity;
        this.Entities.array.push(entity);
        entity.setName(name);
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

export { Component, Entity, System };
