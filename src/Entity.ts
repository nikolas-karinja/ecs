import { ComponentOptions, Component } from './Component'
import { System } from './System'

import { v4 as uuidV4 } from 'uuid'

let instances = 0

export interface EntityOptions {}

export class Entity {

    public dead : boolean = false
    public uuid : string = uuidV4()
    public name : string = `ecs-entity#${ instances + 1 }`

    public Components: { [ key: string ]: Component | any } = {}
    public System 
    public Parent

    constructor ( system: System, options?: EntityOptions ) {

        this.System = system
        this.Parent  = system

        instances++
    }

    addComponent ( componentClass: typeof Component, options?: ComponentOptions ) {

        const C = new componentClass( this, options ? options : {} )

        this.Components[ C.constructor.name ] = C

        C.initComponent()

    }

    destroy () {

        for ( const c in this.Components ) {

            this.Components[ c ].destroy()
        }

        this.Components = {}

        this.dead = true

    }

    findEntity ( name: string ) {

        return this.System.get( name )

    }

    getComponent ( name: string ) {

        return this.Components[ name ]

    }

    initEntity () {

        for ( const c in this.Components ) {

            this.Components[ c ].initEntity()

        }
    }

    setActive ( value: boolean ) {

        this.System.setActive(this, value)

    }

    setName ( name: string ) {

        this.name = name

    }

    update ( deltaTime: number, elapsedTime: number ) {

        for ( const c in this.Components ) {

            if ( this.Components[ c ].active ) this.Components[ c ].update( deltaTime, elapsedTime )
            
        }

    }

}