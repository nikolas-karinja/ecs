import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface EntityOptions {
}
declare class ECSEntity {
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
declare class ECSSystem {
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

interface ComponentOptions {
}
declare class ECSComponent {
    active: boolean;
    Parent: ECSEntity;
    constructor(parent: ECSEntity, options: ComponentOptions);
    destroy(): void;
    initComponent(): void;
    initEntity(): void;
    onUpdate(deltaTime: number, elapsedTime: number): void;
    onAnimUpdate(deltaTime: number, elapsedTime: number): void;
    get System(): ECSSystem;
    findEntity(name: string): ECSEntity;
    getComponent(name: string): any;
    isActive(): boolean;
    setActive(value: boolean): void;
    update(deltaTime: number, elapsedTime: number, updateAnim: boolean): void;
}

declare class GLTFAnimation {
    Action: THREE.AnimationAction;
    Clip: THREE.AnimationClip;
    Mixer: THREE.AnimationMixer;
    constructor(mixer: THREE.AnimationMixer, clip: THREE.AnimationClip);
}
declare class GLTFAnimationStorage {
    count: number;
    currentBaseAnimName: string;
    Stored: {
        [key: string]: GLTFAnimation;
    };
    activate(name: string): void;
    init(): void;
}
interface GLTFModelOptions extends ComponentOptions {
    data: GLTF;
    onModelLoaded?: (model: GLTF, scene: THREE.Object3D) => {};
    parent?: THREE.Object3D;
    sceneIndex?: number;
    startAnimName?: string;
    storeAnimations?: boolean;
}
declare class GLTFModel extends ECSComponent {
    private storeAnimations;
    Animations: GLTFAnimationStorage;
    Mixer: THREE.AnimationMixer;
    Model: GLTF;
    ModelGroup: THREE.Object3D;
    Skeleton: THREE.SkeletonHelper;
    constructor(parent: ECSEntity, options: GLTFModelOptions);
    private determineModelGroup;
    private initAnimations;
    private loadAnimations;
    private setOptions;
    cloneSkeleton(modelGroup: THREE.Object3D): THREE.Object3D;
    executeCrossFade(startAnimation: GLTFAnimation, endAnimation: GLTFAnimation, duration: number): void;
    hideSkeleton(): void;
    playAnimation(name: string, fadeDuration: number): void;
    playAnimationWithDelay(name: string, fadeDuration: number, delayInSeconds?: number): void;
    prepareCrossFade(startAnimation: GLTFAnimation, endAnimation: GLTFAnimation, duration: number): void;
    setTimeScale(speed: number): void;
    setWeight(animation: GLTFAnimation, weight: number): void;
    showSkeleton(): void;
    synchronizeCrossFade(startAnimation: GLTFAnimation, endAnimation: GLTFAnimation, duration: number): void;
    initComponent(): void;
    onUpdate(deltaTime: number, elapsedTime: number): void;
}

type index_d_GLTFModel = GLTFModel;
declare const index_d_GLTFModel: typeof GLTFModel;
declare namespace index_d {
  export {
    index_d_GLTFModel as GLTFModel,
  };
}

export { ECSComponent as Component, ComponentOptions, index_d as Components, ECSEntity as Entity, EntityOptions, ECSSystem as System };
