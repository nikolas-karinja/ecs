import { ComponentOptions, ECSComponent } from './ECSComponent'
import { ECSEntity, EntityOptions } from './ECSEntity'
import ECSManager from './ECSManager'

export * as Components from './components/index'

export { 
    ECSComponent as Component, 
    ECSEntity as Entity, 
    ECSManager as Manager, 

    ComponentOptions, 
    EntityOptions 
}
