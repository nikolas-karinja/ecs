import { ComponentOptions, ECSComponent } from '../ECSComponent'
import { ECSEntity } from '../ECSEntity'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'

export class GLTFAnimation {

    public Action: THREE.AnimationAction
    public Clip: THREE.AnimationClip
    public Mixer: THREE.AnimationMixer

    constructor ( mixer: THREE.AnimationMixer, clip: THREE.AnimationClip ) {

        this.Clip   = clip
        this.Mixer  = mixer
        this.Action = this.Mixer.clipAction( this.Clip )

    }

}

class GLTFAnimationStorage {

    public count: number               = 0
    public currentBaseAnimName: string = 'idle'

    public Stored: { [ key : string ]: GLTFAnimation } = {}

    activate ( name: string ) {

        if ( name !== 'idle' && Object.keys( this.Stored ).length > 1 ) {

            this.Stored[ name ].Action.weight = 0

        } else {

            this.Stored[ name ].Action.weight = 1

        }

        this.Stored[ name ].Action.play()

    }

    init () {

        this.count = Object.keys( this.Stored ).length

        this.currentBaseAnimName = this.count === 1 ? Object.keys( this.Stored )[ 0 ] : 'idle'

        for ( const a in this.Stored ) this.activate( a )

    }

}

interface GLTFModelOptions extends ComponentOptions {

    data: GLTF
    onModelLoaded?: ( model : GLTF, scene: THREE.Object3D ) => {}
    parent?: THREE.Object3D
    sceneIndex?: number
    startAnimName?: string
    storeAnimations?: boolean

}

export class GLTFModel extends ECSComponent {

    private storeAnimations: boolean

    public Animations: GLTFAnimationStorage = new GLTFAnimationStorage()
    public Mixer: THREE.AnimationMixer
    public Model: GLTF
    public ModelGroup: THREE.Object3D
    public Skeleton: THREE.SkeletonHelper

    constructor ( parent: ECSEntity, options: GLTFModelOptions ) {

        super( parent, options )

        this.storeAnimations = options.storeAnimations ? options.storeAnimations : true

        this.Model      = options.data
        this.ModelGroup = this.determineModelGroup( options )
        this.Mixer      = new THREE.AnimationMixer( this.ModelGroup )
        this.Skeleton   = new THREE.SkeletonHelper( this.ModelGroup )

        if ( this.storeAnimations ) this.initAnimations()

        this.setOptions( options )

    }

    private determineModelGroup ( options: GLTFModelOptions ): THREE.Object3D {

        return options.sceneIndex ? this.cloneSkeleton( this.Model.scenes[ options.sceneIndex ] ) : this.cloneSkeleton( this.Model.scene )

    }

    private initAnimations () {

        this.loadAnimations()

        this.Animations.init()

    }

    private loadAnimations () {

        for ( let a of this.Model.animations ) {

            this.Animations.Stored[ a.name ] = new GLTFAnimation( this.Mixer, a )

        }

    }

    private setOptions ( options: GLTFModelOptions ) {

        if ( options.onModelLoaded ) options.onModelLoaded( this.Model, this.ModelGroup )
        if ( options.parent ) options.parent.add( this.ModelGroup, this.Skeleton )

    }

    //

    cloneSkeleton ( modelGroup: THREE.Object3D ): THREE.Object3D {

        return SkeletonUtils.clone( modelGroup )

    }

    executeCrossFade ( startAnimation: GLTFAnimation, endAnimation: GLTFAnimation, duration: number ) {

        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)

        if ( endAnimation ) {

            this.setWeight( endAnimation, 1 )

            endAnimation.Action.time = 0

            if ( startAnimation ) {

                // Crossfade with warping

                startAnimation.Action.crossFadeTo( endAnimation.Action, duration, true )

            } else {

                // Fade in

                endAnimation.Action.fadeIn( duration )

            }

        } else {

            // Fade out

            startAnimation.Action.fadeOut( duration )

        }

    }

    hideSkeleton () {

        if ( this.Skeleton.visible ) this.Skeleton.visible = false

    }

    playAnimation ( name: string, fadeDuration: number ) {

        this.prepareCrossFade( this.Animations.Stored[ this.Animations.currentBaseAnimName ], this.Animations.Stored[ name ], fadeDuration )

    }

    playAnimationWithDelay ( name: string, fadeDuration: number, delayInSeconds: number = 1 ) {

        setTimeout( () => this.playAnimation( name, fadeDuration ), delayInSeconds * 1000 )

    }

    prepareCrossFade ( startAnimation: GLTFAnimation, endAnimation: GLTFAnimation, duration: number ) {

        // If the current action is 'idle', execute the crossfade immediately;
        // else wait until the current action has finished its current loop

        if ( this.Animations.currentBaseAnimName === 'idle' || !startAnimation || !endAnimation ) {

            this.executeCrossFade( startAnimation, endAnimation, duration )

        } else {

            this.synchronizeCrossFade( startAnimation, endAnimation, duration )

        }

        // Update control colors

        if ( endAnimation ) {

            const clip = endAnimation.Action.getClip()

            this.Animations.currentBaseAnimName = clip.name

        } else {

            this.Animations.currentBaseAnimName = 'None'

        }

    }

    setTimeScale ( speed: number ) {

        this.Mixer.timeScale = speed

    }

    setWeight ( animation: GLTFAnimation, weight: number ) {

        animation.Action.enabled = true
        animation.Action.setEffectiveTimeScale( 1 )
        animation.Action.setEffectiveWeight( weight )

    }

    showSkeleton () {

        if ( !this.Skeleton.visible ) this.Skeleton.visible = true

    }

    synchronizeCrossFade ( startAnimation: GLTFAnimation, endAnimation: GLTFAnimation, duration: number ) {

        const onLoopFinished = ( event: any ) => {

            if ( event.action === startAnimation.Action ) {

                this.Mixer.removeEventListener( 'loop', onLoopFinished )

                this.executeCrossFade( startAnimation, endAnimation, duration )

            }

        }

        this.Mixer.addEventListener( 'loop', onLoopFinished )

    }

    //

    initComponent () {

        this.hideSkeleton()
        
    }

    onUpdate ( deltaTime: number, elapsedTime: number ) {

        this.Mixer.update( deltaTime )
        
    }

}       