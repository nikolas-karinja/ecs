import { Entity } from './Entity';
export interface ComponentOptions {
}
export declare class Component {
    active: boolean;
    Parent: Entity;
    constructor(parent: Entity, options: ComponentOptions);
    destroy(): void;
    initComponent(): void;
    initEntity(): void;
    onUpdate(deltaTime: number, elapsedTime: number): void;
    onAnimUpdate(deltaTime: number, elapsedTime: number): void;
    get System(): import("./System").System;
    findEntity(name: string): Entity;
    getComponent(name: string): any;
    isActive(): boolean;
    setActive(value: boolean): void;
    update(deltaTime: number, elapsedTime: number, updateAnim: boolean): void;
}
