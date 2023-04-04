import { v4 } from 'uuid';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';

class ECSComponent {
    constructor(parent, options) {
        this.active = true;
        this.Parent = parent;
    }
    destroy() { }
    initComponent() { }
    initEntity() { }
    onUpdate(deltaTime, elapsedTime) { }
    onAnimUpdate(deltaTime, elapsedTime) { }
    // getters
    get Manager() {
        return this.Parent.Manager;
    }
    //
    findEntity(name) {
        return this.Parent.findEntity(name);
    }
    getComponent(name) {
        return this.Parent.getComponent(name);
    }
    isActive() {
        if (this.active)
            return true;
        else
            return false;
    }
    setActive(value) {
        this.active = value;
    }
    update(deltaTime, elapsedTime, updateAnim) {
        this.onUpdate(deltaTime, elapsedTime);
        if (updateAnim)
            this.onAnimUpdate(deltaTime, elapsedTime);
    }
}

let instances$1 = 0;
class ECSEntity {
    constructor(manager, options) {
        this.dead = false;
        this.uuid = v4();
        this.name = `ecs-entity#${instances$1 + 1}`;
        this.Components = {};
        this.Manager = manager;
        this.Parent = manager;
        instances$1++;
    }
    addComponent(componentClass, options) {
        const C = new componentClass(this, options ? options : {});
        this.Components[C.constructor.name] = C;
        C.initComponent();
    }
    destroy() {
        for (const c in this.Components) {
            this.Components[c].destroy();
        }
        this.Components = {};
    }
    findEntity(name) {
        return this.Manager.get(name);
    }
    getComponent(name) {
        return this.Components[name];
    }
    initEntity() {
        for (const c in this.Components) {
            this.Components[c].initEntity();
        }
    }
    setActive(value) {
        this.Manager.setActive(this, value);
    }
    setName(name) {
        this.name = name;
    }
    update(deltaTime, elapsedTime, updateAnim) {
        for (const c in this.Components) {
            if (this.Components[c].active) {
                this.Components[c].update(deltaTime, elapsedTime, updateAnim);
            }
        }
    }
}

let instances = 0;
class ECSManager {
    constructor() {
        this.ids = 0;
        this.name = `ecs-manager#${instances + 1}`;
        this.uuid = v4();
        this.Assemblies = {};
        this.Entities = {
            array: [],
            map: {},
            uses: {},
        };
        instances++;
    }
    add(entity, name) {
        if (!name)
            name = this.generateName(entity);
        this.Entities.map[name] = entity;
        this.Entities.array.push(entity);
        entity.setName(name);
        entity.initEntity();
    }
    assemble(name, entityClass, options) {
        const classPicked = entityClass ? entityClass : ECSEntity;
        const e = new classPicked(this, options && options.entityOptions ? options.entityOptions : {});
        const entityName = options && options.entityName ? options.entityName : this.generateName(e);
        this.Assemblies[name](e);
        this.add(e, entityName);
    }
    createAssembly(name, buildMethod) {
        this.Assemblies[name] = buildMethod ? buildMethod : (e) => { };
    }
    filter(cb) {
        return this.Entities.array.filter(cb);
    }
    generateName(entity) {
        this.ids++;
        return `${entity.constructor.name}-${this.ids}`;
    }
    get(name) {
        return this.Entities.map[name];
    }
    setActive(entity, value) {
        const i = this.Entities.array.indexOf(entity);
        if (!value) {
            if (i < 0)
                return;
            this.Entities.array.splice(i, 1);
        }
        else {
            if (i >= 0)
                return;
            this.Entities.array.push(entity);
        }
    }
    update(deltaTime, elapsedTime, updateAnim = false) {
        const alive = [];
        const dead = [];
        for (let i = 0; i < this.Entities.array.length; i++) {
            const e = this.Entities.array[i];
            e.update(deltaTime, elapsedTime, updateAnim);
            if (e.dead)
                dead.push(e);
            else
                alive.push(e);
        }
        for (let i = 0; i < dead.length; i++) {
            const e = dead[i];
            delete this.Entities.map[e.name];
            e.destroy();
        }
        this.Entities.array = alive;
    }
}

class GLTFAnimation {
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
class GLTFModel extends ECSComponent {
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

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    GLTFModel: GLTFModel
});

export { ECSComponent as Component, index as Components, ECSEntity as Entity, ECSManager as Manager };
