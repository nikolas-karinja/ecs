import { ComponentOptions, ECSComponent } from './ECSComponent';
import { ECSSystem } from './ECSSystem';
export interface EntityOptions {
}
export declare class ECSEntity {
    dead: boolean;
    uuid: string;
    name: string;
    Components: {
        [key: string]: ECSComponent | any;
    };
    System: ECSSystem;
    Parent: ECSSystem;
    constructor(system: ECSSystem, options?: EntityOptions);
    addComponent(componentClass: typeof ECSComponent, options?: ComponentOptions): void;
    destroy(): void;
    findEntity(name: string): ECSEntity;
    getComponent(name: string): any;
    initEntity(): void;
    setActive(value: boolean): void;
    setName(name: string): void;
    update(deltaTime: number, elapsedTime: number, updateAnim: boolean): void;
}
