# time-using-middleware

A tool to collect time cost for requests, waiting for HTML back, rendering page and etc., also it can export performance testing reports to HTML & pdf easily.

## Installation

```sh
$ npm install time-using-middleware --save
```

## API

```js
var express      = require('express')
var measureTime = require('time-using-middleware')

var app = express()
app.use(time-using-middleware([options]))
```

## Options

### domain

 [`String`, Required]
`mtKey` use this, it always be the host of your website.

### measureUrlPatterns

[`Array`, Required]
 Define the patterns, it can be regex expression as well. time-using-middleware will check the patterns when the request come.

### logPath

[`String`, Required]
Define the path where time-using-middleware middleware store the log files.

## Notice

### mtKey

The cookie which will be set to the client if the page's url was included in patterns above. And it will be removed finally when the current measuring session finish (means `done: 1` was recieved by time-using-middleware collection api) or will be replaced by a new one.

## Example

```js
var express      = require('express')
var measureTime = require('time-using-middleware')

var app = express()
app.use(measureTime({}))

app.get('/', function(req, res) {

})

app.listen(8080)

```

### [MIT Licensed](LICENSE)
