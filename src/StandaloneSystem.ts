import { System } from './System'
import { Clock } from '@little-island/time'

export class StandaloneSystem extends System {

    public delta: number
    public elapsed: number

    public Clock: Clock

    constructor () {

        super()

        this.delta   = 0
        this.elapsed = 0

        this.Clock = new Clock()

    }

    loop () {

        requestAnimationFrame( () => {

            this.delta   = this.Clock.getDelta()
            this.elapsed = this.Clock.getElapsedTime()

            this.update( this.delta, this.elapsed )
            this.loop()

        } )

    } 

}