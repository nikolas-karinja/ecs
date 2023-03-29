import { ComponentOptions, ECSComponent } from '../ECSComponent';
import { ECSEntity } from '../ECSEntity';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
export declare class GLTFAnimation {
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
export declare class GLTFModel extends ECSComponent {
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
export {};
