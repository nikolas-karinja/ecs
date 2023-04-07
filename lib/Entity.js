import { v4 as uuidV4 } from 'uuid';
let instances = 0;
export class Entity {
    constructor(system, options) {
        this.dead = false;
        this.uuid = uuidV4();
        this.name = `ecs-entity#${instances + 1}`;
        this.Components = {};
        this.System = system;
        this.Parent = system;
        instances++;
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
