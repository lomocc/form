import React from 'react';
/**
 * @param label
 * @param help
 * @param required
 * @param description
 * @param children
 * @param validating
 * @param error
 * @returns {XML}
 * @constructor
 */
const DefaultFormRenderer = ({label, help, required, description, children, validating, error, decorator})=>{
  let style = error?{borderColor: '#f04134'}:null;
  return (
    <div>
      <h1>{label}{required ? '*' : null}</h1>
      <span>{description}</span>
      {help}
      <br/>
      {
        React.cloneElement(children, {style})
      }
      {/*decorator?decorator(children):children*/}
      <br/>
      {validating && 'validating……'}{error}
    </div>
  );
};
const VALIDATE_MODE_ALL = 'all';
const VALIDATE_MODE_ITEM = 'item';
const VALIDATE_MODE_NONE = 'none';

let helperComponentImpls = [];
let inject = (componentImpls)=>{
  componentImpls.forEach((ComponentImpl)=>{
    if(helperComponentImpls.indexOf(ComponentImpl) == -1) {
      helperComponentImpls.push(ComponentImpl);
    }
  });
};
/**
 *  mOptions:{
    a: {
        label: 'LabelA',
        description: 'A的描述',
        required: 'A必填',
        initialValue:'AAA',
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
  mOptions;
  mMode;
  mFormRenderer;
  mUpdateCallback;
  mCallbackOrder = -1;

  getMode = ()=>{
    return this.mMode;
  };
  setMode = (mode)=>{
    this.mMode = mode || this.mMode || VALIDATE_MODE_ALL;
  };
  getOption = ()=>{
    return this.mOptions;
  };
  setOption = (options)=>{
    this.mOptions = options || {};
  };
  setFormRenderer = (formRenderer)=>{
    this.mFormRenderer = formRenderer || DefaultFormRenderer;
  };
  constructor(updateCallback, formRenderer){
    this.mUpdateCallback = updateCallback;
    this.inject(helperComponentImpls);
  }
  getValue = (name)=>{
    if(this.mOptions.hasOwnProperty(name)){
      let option = this.mOptions[name];
      return option.hasOwnProperty('value')?option.value:option.initialValue;
    }
  };
  getValues = ()=>{
    let values = {};
    for (let name in this.mOptions) {
      values[name] = this.getValue(name);
    }
    return values;
  };
  getError = (name)=>{
    if(this.mOptions.hasOwnProperty(name)){
      let option = this.mOptions[name];
      return option.hasOwnProperty('error')?option.error:null;
    }
  };
  getErrors = ()=>{
    let errors = null;
    for (let name in this.mOptions) {
      let error = this.getError(name);
      if(error){
        if(!errors) {
          errors = {};
        }
        errors[name] = error;
      }
    }
    return errors;
  };
  setValue = (name, value, needUpdate=false)=>{
    if(this.mOptions.hasOwnProperty(name)){
      let oldValue = this.mOptions[name].value;
      if(oldValue !== value){
        this.mOptions[name].value = value;
        needUpdate && this.$doUpdate(name, true);
        return true;
      }else{
        return false;
      }
    }else{
      this.mOptions[name] = {value};
      needUpdate && this.$doUpdate(name, true);
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
    hasChanged && needUpdate && this.$doUpdate(null, true);
    return hasChanged;
  };
  removeValue = (name, needUpdate=false)=>{
    if(this.mOptions.hasOwnProperty(name)){
      if(this.mOptions[name].hasOwnProperty('value')){
        delete this.mOptions[name].value;
        needUpdate && this.$doUpdate(name, true);
        return true;
      }else{
        return false;
      }
    }
    return false;
  };
  removeValues = (needUpdate=false)=>{
    let hasChanged = false;
    for (let name in this.mOptions) {
      if(this.removeValue(name)){
        hasChanged = true;
      }
    }
    hasChanged && needUpdate && this.$doUpdate(null, true);
    return hasChanged;
  };
  setInitialValue = (name, value, needUpdate=false, updateValidate=false)=>{
    if(this.mOptions.hasOwnProperty(name)){
      let oldValue = this.mOptions[name].initialValue;
      if(oldValue !== value){
        this.mOptions[name].initialValue = value;
        needUpdate && this.$doUpdate(name, updateValidate);
        return true;
      }else{
        return false;
      }
    }else{
      this.mOptions[name] = {initialValue: value};
      needUpdate && this.$doUpdate(name, updateValidate);
      return true;
    }
  };
  setInitialValues = (values, needUpdate=false, updateValidate=false)=>{
    let hasChanged = false;
    for (let name in values) {
      let value = values[name];
      if(this.setInitialValue(name, value)){
        hasChanged = true;
      }
    }
    hasChanged && needUpdate && this.$doUpdate(null, updateValidate);
    return hasChanged;
  };
  removeInitialValue = (name, needUpdate=false, updateValidate=false)=>{
    if(this.mOptions.hasOwnProperty(name)){
      if(this.mOptions[name].hasOwnProperty('initialValue')){
        delete this.mOptions[name].initialValue;
        needUpdate && this.$doUpdate(name, updateValidate);
        return true;
      }else{
        return false;
      }
    }
    return false;
  };
  removeInitialValues = (needUpdate=false, updateValidate=false)=>{
    let hasChanged = false;
    for (let name in this.mOptions) {
      if(this.removeInitialValue(name)){
        hasChanged = true;
      }
    }
    hasChanged && needUpdate && this.$doUpdate(null, updateValidate);
    return hasChanged;
  };
  $getCallbackOrder = (updateOrder)=>{
    return updateOrder?++this.mCallbackOrder:this.mCallbackOrder;
  };
  /**
   * 验证
   * @param cb
   */
  validate = (names=null, cb=null)=>{
    this.$getCallbackOrder(true);
    let validateCount = 0;
    if(Array.isArray(names)){
      validateCount = names.length;
    }else{
      if(typeof names == 'function'){
        cb = names;
      }
      names = [];
      for (let name in this.mOptions) {
        validateCount ++;
        names.push(name);
      }
    }
    names && names.forEach((name)=>{
      this.$doValidate(name, false, ()=>{
        validateCount --;
        if(validateCount == 0){
          cb && cb(this.getErrors(), this.getValues());
        }
      });
    });
  };
  $doValidate = (name, updateOrder=false, cb=null)=> {
    let option = this.mOptions[name];
    let value = this.getValue(name);
    let {validator} = option;
    if(typeof validator == 'function'){
      option.validating = true;
      let callbackOrder = this.$getCallbackOrder(updateOrder);
      validator(value, (error)=>{
        // 如果 order 不同则不更新
        if(callbackOrder === this.mCallbackOrder){
          option.validating = false;
          option.error = error;
          this.mUpdateCallback();
        }
        cb && cb();
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
      cb && cb();
    }else{
      option.validating = false;
      option.error = null;
      cb && cb();
    }
  };
  /**
   * 更新显示
   * @param name 待更新的属性名
   * @param updateValidate 是否需要验证
   */
  $doUpdate = (name, updateValidate=false)=>{
    if(updateValidate){
      if(this.mMode != VALIDATE_MODE_NONE){
        if(name != void 0 && this.mMode == VALIDATE_MODE_ITEM){
          this.$doValidate(name, true);
        }else if(this.mMode == VALIDATE_MODE_ALL){
          this.validate();
        }
      }
    }
    this.mUpdateCallback();
  };
  $destroy = ()=>{
    this.initialValues = null;
    this.values = null;
    this.mOptions = null;
    this.mUpdateCallback = null;
  };
  $createHandler = (name, callback)=>{
    return (value)=>{
      let hasChanged = this.setValue(name, value);
      let needUpdate = typeof callback != 'function' || callback(name, value) !== false;
      hasChanged && needUpdate && this.$doUpdate(name, true);
    };
  };
  inject = (ComponentImpl, formRenderer, customDisplayName)=>{
    if(Array.isArray(ComponentImpl)){
      return ComponentImpl.map((ComponentImpl)=>this.inject(ComponentImpl));
    }
    let displayName = customDisplayName || ComponentImpl.displayName || ComponentImpl.name;
    if(!displayName){
      console.error('displayName is undefined');// eslint-disable-line
      return;
    }
    if(this.hasOwnProperty(displayName)){
      return this[displayName];
    }
    let Component = ({name, onChange, decorator, ...props})=>{
      let FormRenderer = formRenderer || this.mFormRenderer;
      let option = this.mOptions[name];
      let {label, help, required, description, status, error} = option || {};
      return (
        <FormRenderer label={label} required={required != void 0} description={description} status={status} error={error} help={help} decorator={decorator}>
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
let create = (formRenderer, mode, options)=>WrappedComponent =>class FormDecorator extends React.Component{
  componentWillMount(){
    this.form = new FormImpl(::this.forceUpdate, formRenderer);
    this.form.setFormRenderer(formRenderer);
    this.form.setMode(mode);
    this.form.setOption(options);
  }
  componentWillUnmount(){
    this.form.$destroy();
    delete this.form;
  }
  render() {
    return React.createElement(WrappedComponent, { ...this.props, form:this.form});
  }
};

let FormLite = create();

FormLite.create = create;
FormLite.inject = inject;

FormLite.VALIDATE_MODE_ALL = VALIDATE_MODE_ALL;
FormLite.VALIDATE_MODE_ITEM = VALIDATE_MODE_ITEM;
FormLite.VALIDATE_MODE_NONE = VALIDATE_MODE_NONE;

module.exports = FormLite;
