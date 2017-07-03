/**
 * Created by Administrator on 2016/12/26.
 */
import React from 'react';

export default function Input({value='', onChange, ...others}){
  return <input value={value} onChange={(event)=>onChange(event.target.value)} {...others}/>;
}
Input.displayName = 'Input';
