/**
 * Created by Administrator on 2017/6/30.
 */
import React from 'react';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
export default class DatePicker extends React.Component{
  static displayName = 'DatePicker';
  state = {
    focused: false
  };
  render(){
    let {value, onChange, ...others} = this.props;
    return <SingleDatePicker
      date={value} // momentPropTypes.momentObj or null
      onDateChange={onChange} // PropTypes.func.isRequired
      focused={this.state.focused} // PropTypes.bool
      onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
    />;
  }
}
