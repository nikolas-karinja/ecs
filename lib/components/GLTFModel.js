import { ECSComponent } from '../ECSComponent';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
export class GLTFAnimation {
    constructor(mixer, clip) {
        this.Clip = clip;
        this.Mixer = mixer;
        this.Action = this.Mixer.clipAction(this.Clip);
    }
}
class GLTFAnimationStorage {
    constructor() {
        this.count = 0;
        this.currentBaseAnimName = 'idle';
        this.Stored = {};
    }
    activate(name) {
        if (name !== 'idle' && Object.keys(this.Stored).length > 1) {
            this.Stored[name].Action.weight = 0;
        }
        else {
            this.Stored[name].Action.weight = 1;
        }
        this.Stored[name].Action.play();
    }
    init() {
        this.count = Object.keys(this.Stored).length;
        this.currentBaseAnimName = this.count === 1 ? Object.keys(this.Stored)[0] : 'idle';
        for (const a in this.Stored)
            this.activate(a);
    }
}
export class GLTFModel extends ECSComponent {
    constructor(parent, options) {
        super(parent, options);
        this.Animations = new GLTFAnimationStorage();
        this.storeAnimations = options.storeAnimations ? options.storeAnimations : true;
        this.Model = options.data;
        this.ModelGroup = this.determineModelGroup(options);
        this.Mixer = new THREE.AnimationMixer(this.ModelGroup);
        this.Skeleton = new THREE.SkeletonHelper(this.ModelGroup);
        if (this.storeAnimations)
            this.initAnimations();
        this.setOptions(options);
    }
    determineModelGroup(options) {
        return options.sceneIndex ? this.cloneSkeleton(this.Model.scenes[options.sceneIndex]) : this.cloneSkeleton(this.Model.scene);
    }
    initAnimations() {
        this.loadAnimations();
        this.Animations.init();
    }
    loadAnimations() {
        for (let a of this.Model.animations) {
            this.Animations.Stored[a.name] = new GLTFAnimation(this.Mixer, a);
        }
    }
    setOptions(options) {
        if (options.onModelLoaded)
            options.onModelLoaded(this.Model, this.ModelGroup);
        if (options.parent)
            options.parent.add(this.ModelGroup, this.Skeleton);
    }
    //
    cloneSkeleton(modelGroup) {
        return SkeletonUtils.clone(modelGroup);
    }
    executeCrossFade(startAnimation, endAnimation, duration) {
        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)
        if (endAnimation) {
            this.setWeight(endAnimation, 1);
            endAnimation.Action.time = 0;
            if (startAnimation) {
                // Crossfade with warping
                startAnimation.Action.crossFadeTo(endAnimation.Action, duration, true);
            }
            else {
                // Fade in
                endAnimation.Action.fadeIn(duration);
            }
        }
        else {
            // Fade out
            startAnimation.Action.fadeOut(duration);
        }
    }
    hideSkeleton() {
        if (this.Skeleton.visible)
            this.Skeleton.visible = false;
    }
    playAnimation(name, fadeDuration) {
        this.prepareCrossFade(this.Animations.Stored[this.Animations.currentBaseAnimName], this.Animations.Stored[name], fadeDuration);
    }
    playAnimationWithDelay(name, fadeDuration, delayInSeconds = 1) {
        setTimeout(() => this.playAnimation(name, fadeDuration), delayInSeconds * 1000);
    }
    prepareCrossFade(startAnimation, endAnimation, duration) {
        // If the current action is 'idle', execute the crossfade immediately;
        // else wait until the current action has finished its current loop
        if (this.Animations.currentBaseAnimName === 'idle' || !startAnimation || !endAnimation) {
            this.executeCrossFade(startAnimation, endAnimation, duration);
        }
        else {
            this.synchronizeCrossFade(startAnimation, endAnimation, duration);
        }
        // Update control colors
        if (endAnimation) {
            const clip = endAnimation.Action.getClip();
            this.Animations.currentBaseAnimName = clip.name;
        }
        else {
            this.Animations.currentBaseAnimName = 'None';
        }
    }
    setTimeScale(speed) {
        this.Mixer.timeScale = speed;
    }
    setWeight(animation, weight) {
        animation.Action.enabled = true;
        animation.Action.setEffectiveTimeScale(1);
        animation.Action.setEffectiveWeight(weight);
    }
    showSkeleton() {
        if (!this.Skeleton.visible)
            this.Skeleton.visible = true;
    }
    synchronizeCrossFade(startAnimation, endAnimation, duration) {
        const onLoopFinished = (event) => {
            if (event.action === startAnimation.Action) {
                this.Mixer.removeEventListener('loop', onLoopFinished);
                this.executeCrossFade(startAnimation, endAnimation, duration);
            }
        };
        this.Mixer.addEventListener('loop', onLoopFinished);
    }
    //
    initComponent() {
        this.hideSkeleton();
    }
    onUpdate(deltaTime, elapsedTime) {
        this.Mixer.update(deltaTime);
    }
}
