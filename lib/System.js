import { Entity } from './Entity';
import { v4 as uuidV4 } from 'uuid';
let instances = 0;
export class System {
    constructor() {
        this.ids = 0;
        this.name = `ecs-system#${instances + 1}`;
        this.uuid = uuidV4();
        this.Assemblies = {};
        this.Entities = {
            array: [],
            map: {},
            uses: {},
        };
        instances++;
    }
    add(entity, name) {
        if (!name)
            name = this.generateName(entity);
        this.Entities.map[name] = entity;
        this.Entities.array.push(entity);
        entity.setName(name);
        entity.initEntity();
    }
    assemble(name, entityClass, options) {
        const classPicked = entityClass ? entityClass : Entity;
        const e = new classPicked(this, options && options.entityOptions ? options.entityOptions : {});
        const entityName = options && options.entityName ? options.entityName : this.generateName(e);
        this.Assemblies[name](e);
        this.add(e, entityName);
    }
    createAssembly(name, buildMethod) {
        this.Assemblies[name] = buildMethod ? buildMethod : (e) => { };
    }
    filter(cb) {
        return this.Entities.array.filter(cb);
    }
    generateName(entity) {
        this.ids++;
        return `${entity.constructor.name}-${this.ids}`;
    }
    get(name) {
        return this.Entities.map[name];
    }
    setActive(entity, value) {
        const i = this.Entities.array.indexOf(entity);
        if (!value) {
            if (i < 0)
                return;
            this.Entities.array.splice(i, 1);
        }
        else {
            if (i >= 0)
                return;
            this.Entities.array.push(entity);
        }
    }
    update(deltaTime, elapsedTime, updateAnim = false) {
        const alive = [];
        const dead = [];
        for (let i = 0; i < this.Entities.array.length; i++) {
            const e = this.Entities.array[i];
            e.update(deltaTime, elapsedTime, updateAnim);
            if (e.dead)
                dead.push(e);
            else
                alive.push(e);
        }
        for (let i = 0; i < dead.length; i++) {
            const e = dead[i];
            delete this.Entities.map[e.name];
            e.destroy();
        }
        this.Entities.array = alive;
    }
}
