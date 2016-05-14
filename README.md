# measure-time

A tool to collect time cost for requests, waiting for HTML back, rendering page and etc., also it can export performance testing reports to HTML & pdf easily.

## Installation

```sh
$ npm install measure-time
```

## API

```js
var express      = require('express')
var measureTime = require('measure-time')

var app = express()
app.use(measure-time([options]))
```

## Options

### domain

 [`String`, Required]
`mtKey` use this, it always be the host of your website.

### measureUrlPatterns

[`Array`, Required]
 Define the patterns, it can be regex expression as well. measure-time will check the patterns when the request come.

### logPath

[`String`, Required]
Define the path where measure-time middleware store the log files.

## Notice

### mtKey

The cookie which will be set to the client if the page's url was included in patterns above. And it will be removed finally when the current measuring session finish (means `done: 1` was recieved by measure-time collection api) or will be replaced by a new one.

## Example

```js
var express      = require('express')
var measureTime = require('measure-time')

var app = express()
app.use(measureTime({}))

app.get('/', function(req, res) {

})

app.listen(8080)

```

### [MIT Licensed](LICENSE)
