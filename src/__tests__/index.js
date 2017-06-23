/**
 * Created by Administrator on 2017/6/23.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import {FormWithOptions, FORM_MODE, ITEM_MODE} from '../index';

@FormWithOptions({
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
    onSubmit = ()=>{
      let values = this.props.form.getValues();
        console.log('values:', values);
    };
    onReset = ()=>{
        this.props.form.removeValues(true);
    };
    componentDidUpdate(){
        console.log('componentDidUpdate', this.props.form.getValues());
    }
    render(){
        let {Input} = this.props.form;
        return (
            <div>
                <Input name="a"/>
                <Input name="b"/>
                <Input name="c"/>
                <button onClick={this.onSubmit}>submit</button>
                <button onClick={this.onReset}>reset</button>
            </div>
        );
    }
}

ReactDOM.render(<App/>, root);