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
