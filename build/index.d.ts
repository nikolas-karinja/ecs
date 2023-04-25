interface EntityOptions {
}
declare class Entity {
    dead: boolean;
    uuid: string;
    name: string;
    Components: {
        [key: string]: Component | any;
    };
    System: System;
    Parent: System;
    constructor(system: System, options?: EntityOptions);
    addComponent(componentClass: typeof Component, options?: ComponentOptions): void;
    destroy(): void;
    findEntity(name: string): Entity;
    getComponent(name: string): any;
    initEntity(): void;
    kill(): void;
    setActive(value: boolean): void;
    setName(name: string): void;
    update(deltaTime: number, elapsedTime: number): void;
}

interface Assembly {
    entityOptions?: EntityOptions;
    entityName?: string;
}
interface Entities {
    array: Entity[];
    map: {
        [key: string]: Entity;
    };
    uses: {
        [key: string]: number;
    };
}
declare class System {
    ids: number;
    name: string;
    uuid: string;
    Assemblies: {
        [key: string]: any;
    };
    Entities: Entities;
    constructor();
    add(entity: Entity, name?: string): void;
    assemble(name: string, entityClass?: typeof Entity, options?: Assembly): void;
    createAssembly(name: string, buildMethod?: (e: Entity) => void): void;
    filter(cb: () => {}): Entity[];
    generateName(entity: Entity): string;
    get(name: string): Entity;
    setActive(entity: Entity, value: boolean): void;
    update(deltaTime: number, elapsedTime: number): void;
}

interface ComponentOptions {
}
declare class Component {
    active: boolean;
    Parent: Entity;
    constructor(parent: Entity, options: ComponentOptions);
    destroy(): void;
    initComponent(): void;
    initEntity(): void;
    onUpdate(deltaTime: number, elapsedTime: number): void;
    get System(): System;
    findEntity(name: string): Entity;
    getComponent(name: string): any;
    isActive(): boolean;
    setActive(value: boolean): void;
    update(deltaTime: number, elapsedTime: number): void;
}

export { Component, ComponentOptions, Entity, EntityOptions, System };
