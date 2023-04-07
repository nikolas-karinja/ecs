import { ComponentOptions, Component } from './Component';
import { System } from './System';
export interface EntityOptions {
}
export declare class Entity {
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
    setActive(value: boolean): void;
    setName(name: string): void;
    update(deltaTime: number, elapsedTime: number): void;
}
