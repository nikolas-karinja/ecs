import * as ECS from '@little-island/ecs'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

document.body.style.setProperty( 'margin', '0px' )
document.body.style.setProperty( 'overflow', 'hidden' )

const Loader = new GLTFLoader()

const Scene = new THREE.Scene()
Scene.background = new THREE.Color( 0xa0a0a0 )
Scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

const Camera = new THREE.PerspectiveCamera( 45, 1, 0.01, 1000 )
Camera.position.set( -1, 2, 3  )
Camera.lookAt( 0, 1, 0 )

// lights

const HemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 )
HemiLight.position.set( 0, 20, 0 )

Scene.add( HemiLight )

const DirLight = new THREE.DirectionalLight( 0xffffff )
DirLight.position.set( 3, 10, 10 )
DirLight.castShadow = true
DirLight.shadow.camera.top = 2
DirLight.shadow.camera.bottom = - 2
DirLight.shadow.camera.left = - 2
DirLight.shadow.camera.right = 2
DirLight.shadow.camera.near = 0.1
DirLight.shadow.camera.far = 40

Scene.add( DirLight )

// ground

const GroundMesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) )
GroundMesh.rotation.x = - Math.PI / 2
GroundMesh.receiveShadow = true

Scene.add( GroundMesh )

// renderer

const Renderer = new THREE.WebGLRenderer()
Renderer.setPixelRatio( window.devicePixelRatio )
Renderer.setSize( window.innerWidth, window.innerHeight )
Renderer.outputEncoding = THREE.sRGBEncoding
Renderer.shadowMap.enabled = true

document.body.appendChild( Renderer.domElement )

// create and assemble entities

const Manager = new ECS.Manager()

Loader.load( 'assets/Xbot.glb', ( gltf ) => {

    Manager.createAssembly( 'Model', ( e ) => {

        e.addComponent( ECS.Components.GLTFModel, { 
            data: gltf, 
            parent: Scene,
            onModelLoaded: ( model, scene ) => {

                scene.traverse( ( child ) => {

                    if ( child.isMesh ) child.castShadow = true

                } )

            },
        } )

        e.getComponent( 'GLTFModel' ).showSkeleton()
        e.getComponent( 'GLTFModel' ).playAnimationWithDelay( 'walk', 0.35, 3 )
        e.getComponent( 'GLTFModel' ).playAnimationWithDelay( 'run', 0.35, 6 )
    
    } )
    
    Manager.assemble( 'Model' )

} )

// create and start loop

const loop = () => {

    requestAnimationFrame( () => {

        Manager.update( 0.014 )

        Renderer.render( Scene, Camera )

        loop()

    } )

}

loop()