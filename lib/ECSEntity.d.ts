import { ComponentOptions, ECSComponent } from './ECSComponent';
import ECSManager from './ECSManager';
export interface EntityOptions {
}
export declare class ECSEntity {
    dead: boolean;
    uuid: string;
    name: string;
    Components: {
        [key: string]: ECSComponent | any;
    };
    Manager: ECSManager;
    Parent: ECSManager;
    constructor(manager: ECSManager, options?: EntityOptions);
    addComponent(componentClass: typeof ECSComponent, options?: ComponentOptions): void;
    destroy(): void;
    findEntity(name: string): ECSEntity;
    getComponent(name: string): any;
    initEntity(): void;
    setActive(value: boolean): void;
    setName(name: string): void;
    update(deltaTime: number, elapsedTime: number, updateAnim: boolean): void;
}
