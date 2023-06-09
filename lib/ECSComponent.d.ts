import { ECSEntity } from './ECSEntity';
export interface ComponentOptions {
}
export declare class ECSComponent {
    active: boolean;
    Parent: ECSEntity;
    constructor(parent: ECSEntity, options: ComponentOptions);
    destroy(): void;
    initComponent(): void;
    initEntity(): void;
    onUpdate(deltaTime: number, elapsedTime: number): void;
    onAnimUpdate(deltaTime: number, elapsedTime: number): void;
    get System(): import("./ECSSystem").ECSSystem;
    findEntity(name: string): ECSEntity;
    getComponent(name: string): any;
    isActive(): boolean;
    setActive(value: boolean): void;
    update(deltaTime: number, elapsedTime: number, updateAnim: boolean): void;
}
