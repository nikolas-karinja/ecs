import { Entity, EntityOptions } from './Entity';
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
export declare class System {
    ids: number;
    name: string;
    uuid: string;
    Assemblies: {
        [key: string]: any;
    };
    Entities: Entities;
    constructor();
    add(entity: Entity, name: string): void;
    assemble(name: string, entityClass?: typeof Entity, options?: Assembly): void;
    createAssembly(name: string, buildMethod?: (e: Entity) => void): void;
    filter(cb: () => {}): Entity[];
    generateName(entity: Entity): string;
    get(name: string): Entity;
    setActive(entity: Entity, value: boolean): void;
    update(deltaTime: number, elapsedTime: number, updateAnim?: boolean): void;
}
export {};
