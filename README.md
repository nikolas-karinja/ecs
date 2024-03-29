# Entity Component System

Add this into any JavaScript game your building to allow a simple yet seamless way to handle multiple objects at once.

## How it works

The most likely reason you would need this is when having many objects in your game that are either clones or modified replicants of each other. To add an object to the program, first you must create the "Assembly" that those objects will be based on. Then once you have that base assembly, you can create as many cloned or custom instances of it as you want. The updating is all handled through the "Systems" provided. You can also create custom Components to add to the entities to allow for individual and specialized functionality.

#### System ```(): class```

This class essentially manages all the entities you create within it. It allows to store and run as many entities as you want. Store this when declared in a variable, then run its "update" method in whatever game loop you already have in your program

**Below are the methods intended for your program's usage.**

> - **assemble** ```(name: string, entityClass?: typeof Entity, options?: Assembly): void```
This stores, adds, and initializes an entity based on the name of an already registered assembly. The assemblt must be stored in the system before calling this.
> - **createAssembly** ```(name: string, buildMethod?: (e : Entity) => void): void```
This stores the assembly method.
> - **get** ```(name: string): Entity```
Retrieves stored entity based on its name.
> - **setActive** ```(entity: Entity, value: boolean): void```
Tell the entity to be active or inactive base on its name. If an entity is inactive, it will not be updated until active again.
> - **update** ```(deltaTime: number, elapsedTime: number): void```
This updates every active entity in this system. If an entity is marked as "dead", it will add it to a list. By the end of that run of the method, it will have removed every entity in that "dead" list from this system.

#### StandaloneSystem ```() extends System: class```

This class does the same as the regular system accept it has its own "requestAnimationFrame" loop built in.

**Below are the methods intended for your program's usage.**

> - **loop** ```(): void```
Call this to start the frame-based system updating. This already contains the delta and elapsed time as well.

#### Component ```(parent: Entity, options: ComponentOptions): class```

This class allows you to add custom functionality to your entities and it meant to be extending by the user. The base class on its own only contains the skeleton code for a component.

**Below are the methods intended for your program's usage.**

> - **constructor** ```(parent: Entity, options: ComponentOptions)```
Sets the entity in which this isntance of this component is paired too (the system handles this). The options are so you can enter custom data into the component on its creation.
> - **destroy** ```(): void```
Does whatever the user puts inside when this component's entity is "killed/dead".
> - **findEntity** ```(name: string): Entity```
Retrieves stored entity in this component's entity's system based on its name.
> - **getComponent** ```(name: string): Component```
Retrieves a stored component in its entity.
> - **initComponent** ```(): void```
Does whatever the user puts inside when this component is created.
> - **initEntity** ```(): void```
Does whatever the user puts inside when this component's entity is created.
> - **isActive** ```(): boolean```
Returns if this component is active or not.
> - **onUpdate** ```(deltaTime: number, elapsedTime: number): void```
Does whatever the user puts inside when the component is updated.
> - **setActive** ```(value: boolean): void```
Set if this component is active or not.
> - **System** ```get (): System```
Retrieves the system that this component's entity belongs to.

#### Entity ```(system: System, options?: EntityOptions): class```

This class allows is the object that is created from the assembly you choose. You can add components to it to give it custom functionality. The base class on its own only contains the skeleton code for an entity.

**Below are the methods intended for your program's usage.**

> - **constructor** ```(system: System, options?: EntityOptions)```
Sets the system in which this isntance of this entity is paired too (the system handles this). The options are so you can enter custom data into the entity on its creation.
> - **addComponent** ```(componentClass: typeof Component, options?: ComponentOptions): void```
Stores and initializes a component in this entity based on its class and data inserted.
> - **destroy** ```(): void```
Calls all of its component's "destroy" methods so the entity can do what is neccessary to the program before being deleted.
> - **findEntity** ```(name: string): Entity```
Retrieves stored entity in this entity's system based on its name.
> - **getComponent** ```(name: string): Component```
Retrieves a stored component in this entity.
> - **initEntity** ```(): void```
Calls all of its component's "initEntity" methods when this entity is created or added to it's system.
> - **kill** ```(): void```
Marks this entity to be deleted before the end of its system's update loop.
> - **setActive** ```(value: boolean): void```
Set if this entity is active or not.
> - **setName** ```(name: string): void```
Set the name of this entity.

## Get Started

There are a couple ways to use it.

#### With the "System" class

```javascript
import * as ECS from '@little-island/ecs'
import * as THREE from 'three'

const TIME = {
    delta   : 0,
    elapsed : 0,
}

// define three.js dependents
const CLOCK = new THREE.Clock()
const SCENE = new THREE.Scene()

const CAMERA = new THREE.PerspectiveCamera(60, 1, 0.01, 1000)
CAMERA.position.y -= 3
CAMERA.lookAt(0, 0, 0)

const RENDERER = new THREE.WebGLRenderer()
RENDERER.setPixelRatio(window.devicePixelRatio)

document.body.appendChild(RENDERER.domElement)

// define components
class CubeMesh extends ECS.Component 
{
    constructor (parent, options) 
    {
        super(parent, options)

        const _GEOMETRY = new THREE.BoxGeometry( 1, 1, 1 )
        const _MATERIAL = new THREE.MeshNormalMaterial()

        this.Mesh = new THREE.Mesh(_GEOMETRY, _MATERIAL)

        if (options.x) 
        {
            this.Mesh.position.x = options.x
        }

    }

    initComponent () 
    {
        Scene.add(this.Mesh)
    }

    onUpdate (d) 
    {
        this.Mesh.rotation.x += d
        this.Mesh.rotation.z += d
    }

}

class CubeMaterial extends ECS.Component 
{
    initComponent () 
    {
        const _MESH = this.getComponent( 'CubeMesh' ).Mesh
        
        this.Material = new THREE.ShaderMaterial({
            uniforms: {
                colorA: {value: new THREE.Color(Math.random() * 0xffffff)},
                colorB: {value: new THREE.Color(Math.random() * 0xffffff)}
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

        _MESH.material = this.Material
    }
}

// create and assemble entities
const SYSTEM = new ECS.System()

SYSTEM.createAssembly('Cube1', (e) => 
{
    e.addComponent(CubeMesh, {x: -0.8})
})

SYSTEM.createAssembly('Cube2', (e) => 
{
    e.addComponent(CubeMesh, {x: 0.8})
    e.addComponent(CubeMaterial)
})

SYSTEM.assemble('Cube1')
SYSTEM.assemble('Cube2')
 
// create and start loop
const loop = () => 
{
    requestAnimationFrame(() => 
    {
        TIME.delta   = CLOCK.getDelta()
        TIME.elapsed = CLOCK.getElapsedTime()

        SYSTEM.update(TIME.delta, TIME.elapsed)
        RENDERER.render(SCENE, CAMERA)

        loop()
    })
}

loop()
```

#### With "StandaloneSystem" class

```javascript
import * as ECS from '@little-island/ecs'
import * as THREE from 'three'

// define three.js dependents
const SCENE = new THREE.Scene()

const CAMERA = new THREE.PerspectiveCamera(60, 1, 0.01, 1000)
CAMERA.position.y -= 3
CAMERA.lookAt(0, 0, 0)

const RENDERER = new THREE.WebGLRenderer()
RENDERER.setPixelRatio(window.devicePixelRatio)

document.body.appendChild(RENDERER.domElement)

// define components
class CubeMesh extends ECS.Component 
{
    constructor (parent, options) 
    {
        super(parent, options)

        const _GEOMETRY = new THREE.BoxGeometry( 1, 1, 1 )
        const _MATERIAL = new THREE.MeshNormalMaterial()

        this.Mesh = new THREE.Mesh(_GEOMETRY, _MATERIAL)

        if (options.x) 
        {
            this.Mesh.position.x = options.x
        }

    }

    initComponent () 
    {
        Scene.add(this.Mesh)
    }

    onUpdate (d) 
    {
        this.Mesh.rotation.x += d
        this.Mesh.rotation.z += d
    }

}

class CubeMaterial extends ECS.Component 
{
    initComponent () 
    {
        const _MESH = this.getComponent( 'CubeMesh' ).Mesh
        
        this.Material = new THREE.ShaderMaterial({
            uniforms: {
                colorA: {value: new THREE.Color(Math.random() * 0xffffff)},
                colorB: {value: new THREE.Color(Math.random() * 0xffffff)}
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

        _MESH.material = this.Material
    }
}

// create and assemble entities
const SYSTEM = new ECS.StandaloneSystem()

SYSTEM.createAssembly('Cube1', (e) => 
{
    e.addComponent(CubeMesh, {x: -0.8})
})

SYSTEM.createAssembly('Cube2', (e) => 
{
    e.addComponent(CubeMesh, {x: 0.8})
    e.addComponent(CubeMaterial)
})

SYSTEM.assemble('Cube1')
SYSTEM.assemble('Cube2')
 
// start loop
SYSTEM.loop()
```