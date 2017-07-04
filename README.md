# formlite
A React component for building validation forms

Inspire~~copy~~ by [react-jsonschema-form](https://github.com/mozilla-services/react-jsonschema-form)

## Options

属性|描述|可选值类型
-|:-:|-
label|标题|string
description|描述|string
required|是否必填|boolean
initialValue|初始值|any
validator|验证|function(value, callback){}
-|-|[{pattern:/.{5,10}/, message: '长度必须是5到10位'}, ...]

### formlite
```js
import formlite from 'formlite';
@formlite
class Example extends React.Component{
  render(){

  }
}
```

### create
```js
import {create} from 'formlite';

// the custom form ItemRenderer
const FormRenderer = ({label, help, required, description, children, validating, error})=>{
  return (
    <div>
      <h1>{label}{required ? '*' : null}</h1>
      <span>{description}</span>
      {help}
      <br/>
      {children}
      <br/>
      {validating && 'validating……'}
      {error}
    </div>
  );
};
@create(FormRenderer)
class Example extends React.Component{
  render(){

  }
}
```

### inject global
```js
import formlite, {create, inject} from 'formlite';
// inject components in all form
inject([Input, DatePicker, Select]);

@formlite
class Example extends React.Component{
  componentWillMount(){
      this.props.form.setInitialValues({b: 'ccccc', a: 'componentWillMount', c: moment('2030-12-24')}, true);
   }
  onDateChange = (name, value)=>{
    console.log(value);
    this.props.form.setValues({b: value.format('YYYY-MM-DD hh:mm:ss')});
    return true;
  };
  render(){
    let {Input, DatePicker, Select} = this.props.form;
    return (
    <div>
      <Input name="a" style={{color: 'blue'}}/>
      <Input name="b"/>
      <Input name="b" style={{color: 'blue'}}/>
      <DatePicker name="c" onChange={this.onDateChange}/>
    </div>
    )
  }
}
```
### inject local
```js
import formlite, {create, inject} from 'formlite';

@formlite
class Example extends React.Component{
  componentWillMount(){
      // inject components in only this form
      this.props.form.inject([Input, DatePicker, Select]);

      this.props.form.setInitialValues({b: 'ccccc', a: 'componentWillMount', c: moment('2030-12-24')}, true);
   }
  onDateChange = (name, value)=>{
    console.log(value);
    this.props.form.setValues({b: value.format('YYYY-MM-DD hh:mm:ss')});
    return true;
  };
  render(){
    let {Input, DatePicker, Select} = this.props.form;
    return (
    <div>
      <Input name="a" style={{color: 'blue'}}/>
      <Input name="b"/>
      <Input name="b" style={{color: 'blue'}}/>
      <DatePicker name="c" onChange={this.onDateChange}/>
    </div>
    )
  }
}
```
