export class Component {
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
