import * as ECS from '@little-island/ecs'
import * as THREE from 'three'

const Scene = new THREE.Scene()

const Camera = new THREE.PerspectiveCamera( 60, 1, 0.01, 1000 )
Camera.position.y -= 3
Camera.lookAt( 0, 0, 0 )

const Renderer = new THREE.WebGLRenderer()
Renderer.setPixelRatio( window.devicePixelRatio )

document.body.appendChild( Renderer.domElement )

// define components

class CubeMesh extends ECS.Component {
    
    constructor ( parent, options ) {

        super( parent, options )

        const Geometry = new THREE.BoxGeometry( 1, 1, 1 )
        const Material = new THREE.MeshNormalMaterial()

        this.Mesh = new THREE.Mesh( Geometry, Material )

        if ( options.x ) {

            this.Mesh.position.x = options.x

        }

    }

    initComponent () {

        Scene.add( this.Mesh )

    }

    onUpdate ( d ) {

        this.Mesh.rotation.x += d
        this.Mesh.rotation.z += d

    }

}

class CubeMaterial extends ECS.Component {

    initComponent () {

        const Mesh = this.getComponent( 'CubeMesh' ).Mesh
        
        this.Material = new THREE.ShaderMaterial( {
            uniforms: {
                colorA: { value: new THREE.Color( Math.random() * 0xffffff ) },
                colorB: { value: new THREE.Color( Math.random() * 0xffffff ) }
            },

            vertexShader: `
                varying vec3 vUv; 

                void main() {
                    vUv = position; 
        
                    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * modelViewPosition; 
                }
            `,
            fragmentShader: `
                uniform vec3 colorA; 
                uniform vec3 colorB; 
                varying vec3 vUv;
      
                void main() {
                    gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
                }
            `,
        } )

        Mesh.material = this.Material

    }

}

// create and assemble entities

const Manager = new ECS.Manager()

Manager.createAssembly( 'Cube1', ( e ) => {

    e.addComponent( CubeMesh, { x: -0.8 } )
    e.addComponent( CubeMaterial )

} )

Manager.createAssembly( 'Cube2', ( e ) => {

    e.addComponent( CubeMesh, { x: 0.8 } )
    e.addComponent( CubeMaterial )

} )

Manager.assemble( 'Cube1' )
Manager.assemble( 'Cube2' )

// create and start loop

const loop = () => {

    requestAnimationFrame( () => {

        Manager.update( 0.01 )

        Renderer.render( Scene, Camera )

        loop()

    } )

}

loop()