import { ECSEntity, EntityOptions } from './ECSEntity';
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
export declare class ECSSystem {
    ids: number;
    name: string;
    uuid: string;
    Assemblies: {
        [key: string]: any;
    };
    Entities: Entities;
    constructor();
    add(entity: ECSEntity, name: string): void;
    assemble(name: string, entityClass?: typeof ECSEntity, options?: Assembly): void;
    createAssembly(name: string, buildMethod?: (e: ECSEntity) => void): void;
    filter(cb: () => {}): ECSEntity[];
    generateName(entity: ECSEntity): string;
    get(name: string): ECSEntity;
    setActive(entity: ECSEntity, value: boolean): void;
    update(deltaTime: number, elapsedTime: number, updateAnim?: boolean): void;
}
export {};
