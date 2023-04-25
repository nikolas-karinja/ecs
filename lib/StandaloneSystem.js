import { System } from './System';
import { Clock } from '@little-island/time';
export class StandaloneSystem extends System {
    constructor() {
        super();
        this.delta = 0;
        this.elapsed = 0;
        this.Clock = new Clock();
    }
    loop() {
        requestAnimationFrame(() => {
            this.delta = this.Clock.getDelta();
            this.elapsed = this.Clock.getElapsedTime();
            this.update(this.delta, this.elapsed);
            this.loop();
        });
    }
}
