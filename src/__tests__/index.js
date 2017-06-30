/**
 * Created by Administrator on 2017/6/23.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import FormLite from '../index';
import DatePicker from '../DatePicker';
import Input from '../Input';
import moment from 'moment';
FormLite.inject([DatePicker, Input]);
@FormLite.create({
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
})
class App extends React.Component{
    // state = {
    //     focused: false
    // };
    onSubmit = ()=>{
      let values = this.props.form.getValues();
        console.log('values:', values);
    };
    onReset = ()=>{
        this.props.form.removeValues(true);
    };
    // componentDidUpdate(){
    //     console.log('componentDidUpdate', this.props.form.getValues());
    // }
    componentWillMount(){
        setTimeout(()=>{
            this.props.form.setInitialValues({c: 'ccccc', a: 'componentWillMount', d: moment('2030-12-24')}, true);
        }, 1000);
    }
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
                <Input name="c" style={{color: 'blue'}}/>
                <DatePicker name="d" onChange={this.onDateChange}/>
                <button onClick={this.onSubmit}>submit</button>
                <button onClick={this.onReset}>reset</button>
            </div>
        );
    }
}

ReactDOM.render(<App/>, root);