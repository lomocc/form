import React from "react";
import assign from "object-assign";
/**
 * @param name
 * @param required
 * @param children
 * @param validating
 * @param error
 * @returns {XML}
 * @constructor
 */
const DefaultItemRenderer = ({name, required, children, validating, error, ...props})=>{
  return (
    <div>
      {children}
    </div>
  );
};
/**
 * 每次表单值改变时自动验证全部值
 * @type {string}
 */
const ALL = 'all';
/**
 * 每次表单值改变时只自动验证当前值
 * @type {string}
 */
const ITEM = 'item';
/**
 * 每次表单值改变时不自动验证表单
 * @type {string}
 */
const NONE = 'none';

let defaultProps = {
  defaultComponents: [],
  defaultItemRenderer: DefaultItemRenderer,
  defaultMode: ALL
};

/**
 *  options:{
    a: {
        required: 'A必填',
        initialValue:'AAA',
        validator: [{
            pattern:/.{5,10}/, message: '长度必须是5到10位'
        }]
    },
    b: {
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
class Form{
  mOptions;
  mMode;
  mItemRenderer;
  mUpdateCallback;
  mCallbackOrder = -1;

  constructor(updateCallback){
    this.mUpdateCallback = updateCallback;
  }
  getMode = ()=>{
    return this.mMode || defaultProps.defaultMode;
  };
  /**
   * 设置表单验证模式
   * ALL: 自动验证所有值, ITEM: 只验证当前修改值， NONE: 不自动验证
   * @param mode
   */
  setMode = (mode)=>{
    this.mMode = mode;
  };
  getOption = ()=>{
    return this.mOptions;
  };
  /**
   * 设置表单选项
   * @param options
   * @param merge 是否合并，默认值: false（不合并）
   */
  setOption = (options, merge=false)=>{
    if(!merge){
      this.mOptions = options || {};
    }else{
      if(!this.mOptions){
        this.mOptions = options || {};
      }else{
        for (let name in options) {
          if(options.hasOwnProperty(name)) {
            this.mOptions[name] = assign({}, this.mOptions[name], options[name]);
          }
        }
      }
    }
  };
  setItemRenderer = (itemRenderer)=>{
    this.mItemRenderer = itemRenderer;
  };
  getItemRenderer = ()=>{
    return this.mItemRenderer || defaultProps.defaultItemRenderer;
  };
  /**
   * 获取单个表单值
   * @param name
   * @returns {*}
   */
  getValue = (name)=>{
    if(this.mOptions.hasOwnProperty(name)){
      let option = this.mOptions[name];
      return option.hasOwnProperty('value')?option.value:option.initialValue;
    }
  };
  /**
   * 获取表单所有值
   * @returns {{}} 键值对{a:1, b:2}
   */
  getValues = ()=>{
    let values = {};
    for (let name in this.mOptions) {
      if(this.mOptions.hasOwnProperty(name)) {
        values[name] = this.getValue(name);
      }
    }
    return values;
  };
  /**
   * 获取表单错误
   * @returns {string}
   */
  getError = (name)=>{
    if(this.mOptions.hasOwnProperty(name)){
      let option = this.mOptions[name];
      return option.hasOwnProperty('error')?option.error:null;
    }
  };
  /**
   * 获取表单错误
   * @returns {[string]}
   */
  getErrors = ()=>{
    let errors = null;
    for (let name in this.mOptions) {
      if(this.mOptions.hasOwnProperty(name)) {
        let error = this.getError(name);
        if(error){
          if(!errors) {
            errors = {};
          }
          errors[name] = error;
        }
      }
    }
    return errors;
  };
  /**
   * 设置值
   * @param name
   * @param value
   * @param needUpdate
   * @returns {boolean}
   */
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
  /**
   * 批量设置值
   * @param values 键值对 {a: 1, b:2}
   * @param needUpdate
   * @returns {boolean}
   */
  setValues = (values, needUpdate=false)=>{
    let hasChanged = false;
    for (let name in values) {
      if(values.hasOwnProperty(name)) {
        let value = values[name];
        if(this.setValue(name, value)){
          hasChanged = true;
        }
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
      if(this.mOptions.hasOwnProperty(name)) {
        if (this.removeValue(name)) {
          hasChanged = true;
        }
      }
    }
    hasChanged && needUpdate && this.$doUpdate(null, true);
    return hasChanged;
  };
  /**
   * 设置默认值
   * @param name
   * @param value
   * @param needUpdate
   * @param updateValidate
   * @returns {boolean}
   */
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
  /**
   * 批量设置默认值
   * @param values
   * @param needUpdate
   * @param updateValidate
   * @returns {boolean}
   */
  setInitialValues = (values, needUpdate=false, updateValidate=false)=>{
    let hasChanged = false;
    for (let name in values) {
      if(values.hasOwnProperty(name)) {
        let value = values[name];
        if (this.setInitialValue(name, value)) {
          hasChanged = true;
        }
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
      if(this.mOptions.hasOwnProperty(name)) {
        if (this.removeInitialValue(name)) {
          hasChanged = true;
        }
      }
    }
    hasChanged && needUpdate && this.$doUpdate(null, updateValidate);
    return hasChanged;
  };
  $getCallbackOrder = (updateOrder)=>{
    return updateOrder?++this.mCallbackOrder:this.mCallbackOrder;
  };
  /**
   * 验证表单
   * @param names
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
        if(this.mOptions.hasOwnProperty(name)) {
          validateCount++;
          names.push(name);
        }
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
      if(this.getMode() != NONE){
        if(name != void 0 && this.getMode() == ITEM){
          this.$doValidate(name, true);
        }else if(this.getMode() == ALL){
          this.validate();
        }
      }
    }
    this.mUpdateCallback();
  };
  $destroy = ()=>{
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
  /**
   * 注册组件
   * @param ComponentImpl
   * @param itemRenderer
   * @param customDisplayName
   * @returns {*}
   */
  registerComponent = (ComponentImpl, itemRenderer, customDisplayName)=>{
    if(!ComponentImpl){
      return;
    }
    if(Array.isArray(ComponentImpl)){
      return ComponentImpl.map((ComponentImpl)=>this.registerComponent(ComponentImpl));
    }
    let displayName = customDisplayName || ComponentImpl.displayName || ComponentImpl.name;
    if(!displayName){
      console.error('displayName is undefined');// eslint-disable-line
      return;
    }
    if(this.hasOwnProperty(displayName)){
      return this[displayName];
    }
    return this[displayName] = ({name, onChange, ...props})=>{
      let ItemRenderer = itemRenderer || this.getItemRenderer();
      let option = this.mOptions[name];
      let {required, status, error} = option || {};
      return (
        <ItemRenderer
          {...props}
          name={name}
          required={required != void 0}
          status={status}
          error={error}
        >
          <ComponentImpl
            {...props}
            name={name}
            onChange={this.$createHandler(name, onChange)}
            value={this.getValue(name)}
          />
        </ItemRenderer>
      );
    };
  };
}
let create = (options, components)=>WrappedComponent =>class FormWrapper extends React.Component{
  componentDidMount(){
    this.form = new Form(::this.forceUpdate);
    this.form.registerComponent(defaultProps.defaultComponents);
    this.form.registerComponent(components);
    // this.form.setItemRenderer(ItemRenderer);
    // this.form.setMode(mode);
    this.form.setOption(options);
    this.forceUpdate();
  }
  componentWillUnmount(){
    if(this.form){
      this.form.$destroy();
      this.form = null;
    }
  }
  render() {
    if(!this.form){
      return false;
    }
    return React.createElement(WrappedComponent, {...this.props, form: this.form});
  }
};

let FormLite = create();
FormLite.create = create;
/**
 * 注册全局通用组件
 * @param components
 */
FormLite.registerComponent = function (components) {
  components.forEach((component)=>{
    if(defaultProps.defaultComponents.indexOf(component) == -1) {
      defaultProps.defaultComponents.push(component);
    }
  });
};
/**
 * 设置默认渲染器
 * @param defaultItemRenderer
 */
FormLite.setDefaultItemRenderer = function(defaultItemRenderer){
  defaultProps.defaultItemRenderer = defaultItemRenderer;
};
/**
 * 设置默认验证模式
 * @param defaultMode
 */
FormLite.setDefaultMode = function(defaultMode){
  defaultProps.defaultMode = defaultMode;
};

FormLite.ALL = ALL;
FormLite.ITEM = ITEM;
FormLite.NONE = NONE;

module.exports = FormLite;
