import { ComponentOptions, ECSComponent } from './ECSComponent'
import { ECSSystem } from './ECSSystem'

import { v4 as uuidV4 } from 'uuid'

let instances = 0

export interface EntityOptions {}

export class ECSEntity {

    public dead : boolean = false
    public uuid : string = uuidV4()
    public name : string = `ecs-entity#${ instances + 1 }`

    public Components: { [ key: string ]: ECSComponent | any } = {}
    public System 
    public Parent

    constructor ( system: ECSSystem, options?: EntityOptions ) {

        this.System = system
        this.Parent  = system

        instances++
    }

    addComponent ( componentClass: typeof ECSComponent, options?: ComponentOptions ) {

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

    update ( deltaTime: number, elapsedTime: number, updateAnim: boolean ) {

        for ( const c in this.Components ) {

            if ( this.Components[ c ].active ) {

                this.Components[ c ].update( deltaTime, elapsedTime, updateAnim )

            }
            
        }

    }

}