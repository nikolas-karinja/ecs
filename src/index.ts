import { ComponentOptions, ECSComponent } from './ECSComponent'
import { ECSEntity, EntityOptions } from './ECSEntity'
import { ECSSystem } from './ECSSystem'

export * as Components from './components/index'

export { 
    ECSComponent as Component, 
    ECSEntity as Entity, 
    ECSSystem as System, 

    ComponentOptions, 
    EntityOptions 
}
