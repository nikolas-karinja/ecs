import { ECSEntity, EntityOptions } from './ECSEntity'

import { v4 as uuidV4 } from 'uuid'

let instances = 0

interface Assembly {

    assemblyArgs?  : any[]
    entityOptions? : EntityOptions
    entityName?    : string

}

interface Entities {

    array: ECSEntity[]
    map: {
        [ key: string ]: ECSEntity
    }
    uses: {
        [ key: string ]: number
    }

}

export default class ECSManager {

    public ids: number  = 0
    public name: string = `ecs-manager#${instances + 1}`
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

    add ( entity: ECSEntity, name: string ) {

        if ( !name ) name = this.generateName( entity )

        this.Entities.map[ name ] = entity
        this.Entities.array.push( entity )

        entity.setName( name )
        entity.initEntity()
    }

    assemble ( name: string, entityClass?: typeof ECSEntity, options?: Assembly ) {

        const classPicked = entityClass ? entityClass : ECSEntity

        const e = new classPicked( this, options && options.entityOptions ? options.entityOptions : {} )

        const entityName = options && options.entityName ? options.entityName : this.generateName( e )

        this.Assemblies[ name ]( e )

        this.add( e, entityName )
    }

    createAssembly ( name: string, buildMethod?: ( e : ECSEntity ) => void ) {

        this.Assemblies[ name ] = buildMethod ? buildMethod : ( e: ECSEntity ) => {}

    }

    filter ( cb : () => {} ) {

        return this.Entities.array.filter( cb )

    }

    generateName ( entity: ECSEntity ) {

        this.ids++

        return `${ entity.constructor.name }-${ this.ids }`

    }

    get ( name: string ) {

        return this.Entities.map[ name ]

    }

    setActive ( entity: ECSEntity, value: boolean ) {

        const i = this.Entities.array.indexOf( entity )

        if ( !value ) {

            if ( i < 0 ) return

            this.Entities.array.splice( i, 1 )

        } else {

            if ( i >= 0 ) return

            this.Entities.array.push( entity )

        }

    }

    update ( deltaTime: number, elapsedTime: number, updateAnim: boolean = false ) {

        const alive: ECSEntity[] = []
        const dead: ECSEntity[]  = []

        for ( let i = 0; i < this.Entities.array.length; i++ ) {

            const e = this.Entities.array[ i ]

            e.update( deltaTime, elapsedTime, updateAnim )

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
