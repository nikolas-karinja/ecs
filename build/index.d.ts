interface EntityOptions {
}
declare class ECSEntity {
    dead: boolean;
    uuid: string;
    name: string;
    Components: {
        [key: string]: ECSComponent;
    };
    Manager: ECSManager;
    Parent: ECSManager;
    constructor(manager: ECSManager, options?: EntityOptions);
    addComponent(componentClass: typeof ECSComponent, options?: ComponentOptions): void;
    destroy(): void;
    findEntity(name: string): ECSEntity;
    getComponent(name: string): ECSComponent;
    initEntity(): void;
    setActive(value: boolean): void;
    setName(name: string): void;
    update(deltaTime: number, elapsedTime: number, updateAnim: boolean): void;
}

interface Assembly {
    assemblyArgs?: any[];
    entityOptions?: EntityOptions;
    entityName?: string;
}
interface Entities {
    array: ECSEntity[];
    map: {
        [key: string]: ECSEntity;
    };
    uses: {
        [key: string]: number;
    };
}
declare class ECSManager {
    ids: number;
    name: string;
    uuid: string;
    Assemblies: {
        [key: string]: Function;
    };
    Entities: Entities;
    constructor();
    add(entity: ECSEntity, name: string): void;
    assemble(name: string, entityClass?: typeof ECSEntity, options?: Assembly): void;
    createAssembly(name: string, buildMethod?: (e: ECSEntity) => {}): void;
    filter(cb: () => {}): ECSEntity[];
    generateName(entity: ECSEntity): string;
    get(name: string): ECSEntity;
    setActive(entity: ECSEntity, value: boolean): void;
    update(deltaTime: number, elapsedTime: number, updateAnim?: boolean): void;
}

interface ComponentOptions {
}
declare class ECSComponent {
    active: boolean;
    Parent: ECSEntity;
    constructor(parent: ECSEntity, options?: ComponentOptions);
    destroy(): void;
    initComponent(): void;
    initEntity(): void;
    onUpdate(deltaTime: number, elapsedTime: number): void;
    onAnimUpdate(deltaTime: number, elapsedTime: number): void;
    get Manager(): ECSManager;
    findEntity(name: string): ECSEntity;
    getComponent(name: string): ECSComponent;
    isActive(): boolean;
    setActive(value: boolean): void;
    update(deltaTime: number, elapsedTime: number, updateAnim: boolean): void;
}

export { ECSComponent as Component, ComponentOptions, ECSEntity as Entity, EntityOptions, ECSManager as Manager };
