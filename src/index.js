import React from 'react';
import warning from 'warning';
import assign from 'object-assign';
// import Checkbox from './Checkbox';
// import CheckboxGroup from './CheckboxGroup';
import Input from './Input';
// import Select from './Select';
// import Radio from './Radio';
// import Textarea from './Textarea';

// function getDisplayName(Component) {
//     return Component.displayName ||
//         Component.name ||
//         'FormComponent'
// }
const DefaultItemRenderer = ({label, help, required, description, children, validating, error})=>{
    return (
        <div>
            <h1>{label}{required ? "*" : null}</h1>
            <span>{description}</span>
            {help}
            <br/>
            {children}
            <br/>
            {validating && "validating……"}{error}
        </div>
    );
};
const FORM_MODE = 'form';
const ITEM_MODE = 'item';
const NONE_MODE = 'none';

const SUCCESS_STATUS = 'success';
// const WARNING_STATUS = 'warning';
const ERROR_STATUS = 'error';
const VALIDATING_STATUS = 'validating';
/**
 *
 */
class FormFactory{
    // initialValues = {};
    // values = {};

    // items = {
    //     a: {
    //         required: '必填',
    //         initialValue: 2,
    //         validator: (value)=>{},
    //         rules:[
    //             {type: "string", pattern: schema.pattern.email, message: "invalid zip"}
    //         ]
    //     }
    // };
    options;
    mode;
    itemRenderer;
    updateCallback;

    constructor(options, mode, itemRenderer, updateCallback){
        this.options = options || {};
        this.mode = mode || ITEM_MODE;
        this.itemRenderer = itemRenderer || DefaultItemRenderer;
        this.updateCallback = updateCallback;
    }
    // validate = (validator, value, message, callback)=>{
    //     if (validator) {
    //         if (validator instanceof RegExp) {
    //             callback(validator.test(value)?null:message);
    //         } else if (typeof validator === 'string') {
    //             validator = new RegExp(validator);
    //             callback(validator.test(value)?null:message);
    //             // if (!validator.test(value)) {
    //             //     return false;
    //
    //             // if(typeof message == 'string'){
    //             //     return message;
    //             // }else if(typeof message == 'function'){
    //             //     errors.push(message() || '');
    //             // }
    //             // }
    //         }else if(typeof validator === 'function'){
    //             validator(value, callback);
    //         }
    //     }
    // };
    doValidate = (name)=> {
        let option = this.options[name];
        let value = this.getValue(name);

        let {validator} = option;
        if(typeof validator == 'function'){
            option.status = VALIDATING_STATUS;
            validator(value, (error)=>{
                option.status = !error?SUCCESS_STATUS:ERROR_STATUS;
                option.error = error;
                this.updateCallback();
            });
        }else if(Array.isArray(validator)){
            if(value == void 0)
                value = '';
            let error = validator
                .filter(({pattern})=>{
                    if (pattern instanceof RegExp) {
                        return !pattern.test(value);
                    } else if (typeof pattern === 'string') {
                        return !new RegExp(pattern).test(value);
                    }
                })
                .map(({message})=>message)
                .join('');
            option.status = !error?SUCCESS_STATUS:ERROR_STATUS;
            option.error = error;
        }
    };
    doUpdate = (name)=>{
        if(this.mode != NONE_MODE){
            if(name != void 0 && this.mode == ITEM_MODE){
                this.doValidate(name);
            }else if(this.mode == FORM_MODE){
                for (let name in this.options) {
                    this.doValidate(name);
                }
            }
        }
        this.updateCallback();
    };
    destroy = ()=>{
        this.initialValues = null;
        this.values = null;
        this.options = null;
        this.updateCallback = null;
    };
    getValue = (name)=>{
        if(this.options.hasOwnProperty(name)){
            let option = this.options[name];
            return option.hasOwnProperty('value')?option.value:option.initialValue;
        }
    };
    getValues = ()=>{
        let values = {};
        for (let name in this.options) {
            values[name] = this.getValue(name);
        }
        return values;
    };
    setValue = (name, value, needUpdate=false)=>{
        if(this.options.hasOwnProperty(name)){
            let oldValue = this.options[name].value;;
            if(oldValue !== value){
                this.options[name].value = value;
                needUpdate && this.doUpdate(name);
                return true;
            }else{
                return false;
            }
        }else{
            this.options[name] = {value};
            needUpdate && this.doUpdate(name);
            return true;
        }
    };
    setValues = (values, needUpdate=false)=>{
        let hasChanged = false;
        for (let name in values) {
            let value = values[name];
            if(this.setValue(name, value)){
                hasChanged = true;
            }
        }
        hasChanged && needUpdate && this.doUpdate();
        return hasChanged;
    };
    removeValue = (name, needUpdate=false)=>{
        if(this.options.hasOwnProperty(name)){
            if(this.options[name].hasOwnProperty('value')){
                delete this.options[name].value;
                needUpdate && this.doUpdate(name);
                return true;
            }else{
                return false;
            }
        }
        return false;
    };
    removeValues = (needUpdate=false)=>{
        let hasChanged = false;
        for (let name in this.options) {
            if(this.removeValue(name)){
                hasChanged = true;
            }
        }
        hasChanged && needUpdate && this.doUpdate();
        return hasChanged;
    };
    setInitialValue = (name, value, needUpdate=false)=>{
        if(this.options.hasOwnProperty(name)){
            let oldValue = this.options[name].initialValue;
            if(oldValue !== value){
                this.options[name].initialValue = value;
                needUpdate && this.doUpdate(name);
                return true;
            }else{
                return false;
            }
        }else{
            this.options[name] = {initialValue: value};
            needUpdate && this.doUpdate(name);
            return true;
        }
    };
    setInitialValues = (values, needUpdate=false)=>{
        let hasChanged = false;
        for (let name in values) {
            let value = values[name];
            if(this.setInitialValue(name, value)){
                hasChanged = true;
            }
        }
        hasChanged && needUpdate && this.doUpdate();
        return hasChanged;
    };
    removeInitialValue = (name, needUpdate=false)=>{
        if(this.options.hasOwnProperty(name)){
            if(this.options[name].hasOwnProperty('initialValue')){
                delete this.options[name].initialValue;
                needUpdate && this.doUpdate(name);
                return true;
            }else{
                return false;
            }
        }
        return false;
    };
    removeInitialValues = (needUpdate=false)=>{
        let hasChanged = false;
        for (let name in this.options) {
            if(this.removeInitialValue(name)){
                hasChanged = true;
            }
        }
        hasChanged && needUpdate && this.doUpdate();
        return hasChanged;
    };
    // validate = (name)=>{
    //     if(this.mode == ITEM_MODE){
    //         let option = this.options[name];
    //         let value = this.getValue(name);
    //
    //         let rules = option.rules;
    //         if(rules && rules.length > 0){
    //             rules.filter((rule)=>{rule.})
    //         }
    //
    //     }else if(this.mode == FORM_MODE){
    //
    //     }
    // };
    // errorMessage = (name)=>{
    //     let option = this.options[name];
    //     if(option){
    //         let valid = true;
    //         return valid?null:option.message;
    //     }
    //     if(this.values.hasOwnProperty(name)){
    //         return this.values[name];
    //     }else if(this.initialValues.hasOwnProperty(name)){
    //         return this.initialValues[name];
    //     }
    // };
    $createHandler = (name, callback)=>{
        return (value)=>{
            let hasChanged = this.setValue(name, value);
            let needUpdate = typeof callback != 'function' || !callback(name, value);
            if(hasChanged && needUpdate){
                // this.validate(name);
                // validate
                this.doUpdate(name);
            }
            // hasChanged && needUpdate && this.doUpdate();
        };
    };
    createElement = (Component, defaultValue)=>{
        return ({name, onChange, initialValue, ...props})=>{
            // this.setInitialValue(name, initialValue !== void 0?initialValue:defaultValue);
            let ItemRendererClass = this.itemRenderer;
            let option = this.options[name];
            let {label, help, required, description, status, error} = option || {};
            console.log('render', error, option);
            return (
                <ItemRendererClass label={label} required={required != void 0} description={description} status={status} error={error} help={help}>
                    <Component onChange={this.$createHandler(name, onChange)} value={this.getValue(name)} {...props}/>
                </ItemRendererClass>
            );
        };
    };
    Input = this.createElement(Input, '');
    // Select = this.createElement(Select, 0);
    // Checkbox = this.createElement(Checkbox, false);
    // Radio = this.createElement(Radio, 0);
    // CheckboxGroup = this.createElement(CheckboxGroup, []);
    // Textarea = this.createElement(Textarea, '');
}
let FormWithOptions = (options, mode, itemRenderer)=>WrappedComponent =>class FormDecorator extends React.Component{
    componentWillMount(){
        this.form = new FormFactory(options, mode, itemRenderer, ::this.forceUpdate);
    }
    componentWillUnmount(){
        this.form.destroy();
        delete this.form;
    }
    render() {
        return React.createElement(WrappedComponent, { ...this.props, form:this.form});
    }
};

let Form = FormWithOptions();

Form.FormWithOptions = FormWithOptions;

Form.FORM_MODE = FORM_MODE;
Form.ITEM_MODE = ITEM_MODE;
Form.NONE_MODE = NONE_MODE;

Form.SUCCESS_STATUS = SUCCESS_STATUS;
Form.ERROR_STATUS = ERROR_STATUS;
Form.VALIDATING_STATUS = VALIDATING_STATUS;

module.exports = Form;