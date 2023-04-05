import { ECSEntity } from './ECSEntity'

export interface ComponentOptions {}

export class ECSComponent {

    public active: boolean = true

    public Parent: ECSEntity

    constructor ( parent: ECSEntity, options: ComponentOptions ) {

        this.Parent  = parent

    }

    destroy () {}
    initComponent () {}
    initEntity () {}
    onUpdate ( deltaTime: number, elapsedTime: number ) {}
    onAnimUpdate ( deltaTime: number, elapsedTime: number ) {}

    // getters

    get System () {

        return this.Parent.System

    }

    //

    findEntity ( name: string ) {

        return this.Parent.findEntity( name )

    }

    getComponent ( name: string ) {

        return this.Parent.getComponent( name )

    }

    isActive () {

        if ( this.active ) return true
        else return false

    }

    setActive ( value: boolean ) {

        this.active = value

    }

    update ( deltaTime: number, elapsedTime: number, updateAnim: boolean ) {

        this.onUpdate( deltaTime, elapsedTime )

        if ( updateAnim ) this.onAnimUpdate( deltaTime, elapsedTime )

    }
}
