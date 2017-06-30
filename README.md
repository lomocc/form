# formlite

## Options

属性|描述|可选值类型
-|:-:|-
label|标题|string
description|描述|string
required|是否必填|boolean
initialValue|初始值|any
validator|验证|function(value, callback){}
||[{pattern:/.{5,10}/, message: '长度必须是5到10位'}, ...]
