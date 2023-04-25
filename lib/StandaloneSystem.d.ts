import { System } from './System';
import { Clock } from '@little-island/time';
export declare class StandaloneSystem extends System {
    delta: number;
    elapsed: number;
    Clock: Clock;
    constructor();
    loop(): void;
}
