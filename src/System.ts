import { Entity, EntityOptions } from './Entity'

import { v4 as uuidV4 } from 'uuid'

let instances = 0

interface Assembly {

    entityOptions? : EntityOptions
    entityName?    : string

}

interface Entities {

    array : Entity[]
    map   : { [ key: string ]: Entity }
    uses  : { [ key: string ]: number }

}

export class System {

    public ids: number  = 0
    public name: string = `ecs-system#${instances + 1}`
    public uuid: string = uuidV4()

    public Assemblies: { [ key: string ]: any } = {}

    public Entities: Entities = {
        array : [],
        map   : {},
        uses  : {},
    }

    constructor () {

        instances++

    }

    add ( entity: Entity, name: string ) {

        if ( !name ) name = this.generateName( entity )

        this.Entities.map[ name ] = entity
        this.Entities.array.push( entity )

        entity.setName( name )
        entity.initEntity()
    }

    assemble ( name: string, entityClass?: typeof Entity, options?: Assembly ) {

        const classPicked = entityClass ? entityClass : Entity

        const e = new classPicked( this, options && options.entityOptions ? options.entityOptions : {} )

        const entityName = options && options.entityName ? options.entityName : this.generateName( e )

        this.Assemblies[ name ]( e )

        this.add( e, entityName )
    }

    createAssembly ( name: string, buildMethod?: ( e : Entity ) => void ) {

        this.Assemblies[ name ] = buildMethod ? buildMethod : ( e: Entity ) => {}

    }

    filter ( cb : () => {} ) {

        return this.Entities.array.filter( cb )

    }

    generateName ( entity: Entity ) {

        this.ids++

        return `${ entity.constructor.name }-${ this.ids }`

    }

    get ( name: string ) {

        return this.Entities.map[ name ]

    }

    setActive ( entity: Entity, value: boolean ) {

        const i = this.Entities.array.indexOf( entity )

        if ( !value ) {

            if ( i < 0 ) return

            this.Entities.array.splice( i, 1 )

        } else {

            if ( i >= 0 ) return

            this.Entities.array.push( entity )

        }

    }

    update ( deltaTime: number, elapsedTime: number ) {

        const alive: Entity[] = []
        const dead: Entity[]  = []

        for ( let i = 0; i < this.Entities.array.length; i++ ) {

            const e = this.Entities.array[ i ]

            e.update( deltaTime, elapsedTime )

            if ( e.dead ) dead.push( e ) 
            else alive.push( e )

        }

        for ( let i = 0; i < dead.length; i++ ) {

            const e = dead[ i ]

            delete this.Entities.map[ e.name ]

            e.destroy()

        }

        this.Entities.array = alive

    }

}
