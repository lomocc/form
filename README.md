# formlite

A React component for building validation forms

Inspire ~~Copy~~ by [react-jsonschema-form](https://github.com/mozilla-services/react-jsonschema-form)

## Options

属性|描述|可选值类型
-|:-:|-
label|标题|string
description|描述|string
required|是否必填|boolean
initialValue|初始值|any
validator|验证|function(value, callback){}
-|-|[{pattern:/.{5,10}/, message: '长度必须是5到10位'}, ...]

## Input.js
```js
import React from 'react';
export default function Input({value='', onChange, ...others}){
  return <input value={value} onChange={(event)=>onChange(event.target.value)} {...others}/>;
}
Input.displayName = 'Input';
```
## FormRenderer.js
```js
import React from 'react';
export default class FormRenderer extends React.Component {
  render() {
    let {label, help, required, description, children, validating, error, decorator} = this.props;
    let className = error?'error':'success';
    return (
      <div className="form-renderer">
        <label className={`label ${required?'required':''}`}>{label}</label>
        <div className="decorator">
          {
            React.cloneElement(children, {className: `input ${className}`})
          }
          <div className="error-text">{error}</div>
        </div>

        {/*decorator?decorator(children):children*/}

        {validating && 'validating……'}
      </div>
    );
  }
}
```
## Usage
### 常用
```js
import FormLite from 'formlite';
import DatePicker from './DatePicker';
import Input from './Input';
import FormRenderer from './FormRenderer';

FormLite.registerComponent([DatePicker, Input]); // 注册可用的组件
FormLite.setDefaultItemRenderer(FormRenderer); // 设置表单渲染模板默认值
FormLite.setDefaultMode(FormLite.ALL); // 设置表单值变化时验证模式， ALL: 自动验证所有值, ITEM: 只验证当前修改值， NONE: 不自动验证

@FormLite
class Example extends React.Component{
  onDateChange = (name, value)=>{
    console.log(value);
    this.props.form.setValues({c: value.format('YYYY-MM-DD hh:mm:ss')});
    return true;
  };
  render(){
    let {Input, DatePicker} = this.props.form;
    return (
      <div>
        <Input name="a" style={{color: 'blue'}}/>
        <Input name="b"/>
        <Input name="c"/>
        <Input name="c" style={{color: 'blue'}} readOnly/>
        <DatePicker name="d" onChange={this.onDateChange}/>
        <button onClick={this.onSubmit}>submit</button>
        <button onClick={this.onReset}>reset</button>
      </div>
    );
  }
}
```

### create
```js
import FormLite from 'formlite';
@FormLite.create({
  a: {
    label: 'LabelA',
    description: 'A的描述',
    required: true,
    initialValue:"AAA",
    validator: [{
      pattern:/^.{5,10}$/, message: '长度必须是5到10位'
    }, {
      pattern:/^[0-9]+$/, message: '必须是数字'
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
})
class Example extends React.Component{
  render(){
    // ……
  }
}
```

### Functions
```js
import FormLite from 'formlite';
@FormLite
class Example extends React.Component{
  componentWillMount(){
      this.props.form.registerComponent([Input, DatePicker, Select]); // 注册私有组件
      this.props.form.setItemRenderer(FormRenderer); // 注册私有表单渲染模板
      this.props.form.setMode(FormLite.ALL); // 设置私有验证模式
      this.props.form.setOption({a: {}})
      // 设置默认值
      this.props.form.setInitialValues({b: 'initialValue B', a: 'initialValue A', c: moment('2030-12-24')});
   }
  render(){
    // ……
  }
}
```
