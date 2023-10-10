import type { ValidationRule } from 'vuetify/types/services/validation'

//  Mandatory calibration
export const requiredValidator: ValidationRule = (value: any) => !!value || ' This field is required'

//  Digital calibration
export const numberValidator: ValidationRule = (value: any) => !isNaN(value) || ' Please enter a number'
