import React from 'react';

function getDisplayName(Component) {
    return Component.displayName ||
        Component.name ||
        'Form'
}
const DefaultFormRenderer = ({label, help, required, description, children, validating, error})=>{
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
/**
 *  options:{
    a: {
        label: 'LabelA',
        description: 'A的描述',
        required: 'A必填',
        initialValue:"AAA",
        validator: [{
            pattern:/.{5,10}/, message: '长度必须是5到10位'
        }]
    },
    b: {
        label: 'LabelB',
        description: 'B的描述',
        initialValue: 'BBB',
        validator(value, callback){
            setTimeout(()=>{
                callback(value == '123456'? null: '请输入123456');
            }, 1000);
        }
    }
}
 *  
 */
class FormImpl{
    static ComponentImpls = [];
    static inject(ComponentImpls){
        ComponentImpls.forEach((ComponentImpl)=>{
            if(FormImpl.ComponentImpls.indexOf(ComponentImpl) == -1) {
                FormImpl.ComponentImpls.push(ComponentImpl);
            }
        });
    }
    options;
    mode;
    formRenderer;
    updateCallback;

    constructor(options, mode, formRenderer, updateCallback){
        this.options = options || {};
        this.mode = mode || FORM_MODE;
        this.formRenderer = formRenderer;
        this.updateCallback = updateCallback;
        this.$initComponent();
    }
    $initComponent = ()=>{
        FormImpl.ComponentImpls.forEach((ComponentImpl)=>this.injectComponent(ComponentImpl))
    };
    doValidate = (name)=> {
        let option = this.options[name];
        let value = this.getValue(name);

        let {validator} = option;
        if(typeof validator == 'function'){
            option.validating = true;
            validator(value, (error)=>{
                option.validating = false;
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
            option.validating = false;
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
    $createHandler = (name, callback)=>{
        return (value)=>{
            let hasChanged = this.setValue(name, value);
            let needUpdate = typeof callback != 'function' || !callback(name, value);
            hasChanged && needUpdate && this.doUpdate(name);
        };
    };
    injectComponent = (ComponentImpl, formRenderer)=>{
        let displayName = getDisplayName(ComponentImpl);
        if(this.hasOwnProperty(displayName)){
            return this[displayName];
        }
        let Component = ({name, onChange, ...props})=>{
            let FormRenderer = formRenderer || this.formRenderer || DefaultFormRenderer;
            let option = this.options[name];
            let {label, help, required, description, status, error} = option || {};
            return (
                <FormRenderer label={label} required={required != void 0} description={description} status={status} error={error} help={help}>
                    <ComponentImpl onChange={this.$createHandler(name, onChange)} value={this.getValue(name)} {...props}/>
                </FormRenderer>
            );
        };
        if(!this.hasOwnProperty(displayName)){
            this[displayName] = Component;
        }
        return Component;
    };
}
let create = (options, mode, formRenderer)=>WrappedComponent =>class FormDecorator extends React.Component{
    componentWillMount(){
        this.form = new FormImpl(options, mode, formRenderer, ::this.forceUpdate);
    }
    componentWillUnmount(){
        this.form.destroy();
        delete this.form;
    }
    render() {
        return React.createElement(WrappedComponent, { ...this.props, form:this.form});
    }
};

let Form = create();

Form.create = create;
Form.inject = FormImpl.inject;

Form.FORM_MODE = FORM_MODE;
Form.ITEM_MODE = ITEM_MODE;
Form.NONE_MODE = NONE_MODE;

module.exports = Form;