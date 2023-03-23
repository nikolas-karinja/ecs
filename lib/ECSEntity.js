import { v4 as uuidV4 } from 'uuid';
let instances = 0;
export class ECSEntity {
    constructor(manager, options) {
        this.dead = false;
        this.uuid = uuidV4();
        this.name = `ecs-entity#${instances + 1}`;
        this.Components = {};
        this.Manager = manager;
        this.Parent = manager;
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
        return this.Manager.get(name);
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
        this.Manager.setActive(this, value);
    }
    setName(name) {
        this.name = name;
    }
    update(deltaTime, elapsedTime, updateAnim) {
        for (const c in this.Components) {
            if (this.Components[c].active) {
                this.Components[c].update(deltaTime, elapsedTime, updateAnim);
            }
        }
    }
}
