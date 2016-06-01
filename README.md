# time-using-middleware
 
 [![NPM version][npm-version-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![License][license-image]][npm-url] 

A tool to collect time cost for requests, waiting for HTML back, rendering page and etc., also it can export performance testing reports to HTML & pdf easily.

## Features

- Export Table Reports using Command Line window in Markdown format
- Recording the data of each page session
- Record pages by Regex Expression filters defined in Options
- Complete the page collect session until it recieve the COMPLETE signal by timeUsingMiddlewareCollectFinish
- Support those Pages which are consist of by both Nodejs side render and Front-end JS work. The cookie `mtKey` can tracking all of them
- All the time attributes are defined by Developers(You)

## Notice

This timing tool is under constructing right now, currenlty I'm using it to measure performance when calling APIs from nodejs, and support collect all the key-value pair data throung two public methods: `addTimeRecord` & `finishRecording`.

So, it need users(usually developers) to write some codes in their project to collect data and send back to this middleware. All the log files will stored in which you specified in the options.

**mtKey**

The cookie which will be set to the client if the page's url was included in patterns above. And it will be removed finally when the current measuring session finish (means `done: 1` was recieved by time-using-middleware collection api) or will be replaced by a new one.

## Installation

```sh
$ npm install time-using-middleware --save
```

## How to Use

  Usage: timeUsing [options] <dirs>

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -i, --input [path]       where the log files read from
    -o, --output [path]      where the report put to
    -c, --pageconfig [path]  all configs for each pages
    -f, --format <types>     the format of the exported file

### format `-f`

Specify which format of files you want to export, default to CL screen, otherwise, it should be in HTML and PDF.

``` sh
timeUsing -i ./log/timeUsing/ -c ./timeUsing.json -f html,pdf
```

### Command Line Report Preview

``` md
-------------------------------------------------
      Time Using Middleware by Staydan.com       

                                    v0.4.3     
-------------------------------------------------

30ms -  analyzing log data finished...
contain pages counts: 2
 Analyzing For [ timeUsingTestPage ]
validSampleCounts: 1156

42ms - assembling data...
samples counts for PAGE [ timeUsingTestPage ] : 1156 / 1156 (valid / sum)
 Analyzing For [ testDemoPage ]
validSampleCounts: 7159

109ms - assembling data...
samples counts for PAGE [ testDemoPage ] : 7159 / 7159 (valid / sum)
6ms - preparing the table data...

------- Performance Testing Results -------

Page : timeUsingTestPage

|                 | Sample Count | average(ms) | median(ms) | min(ms) | max(ms) |
| :-------------- | :----------: | :---------: | :--------: | :-----: | :-----: |
| Test API        |     1156     |    1026.1   |   1039.5   |    7    |   2489  |
| Node All API(n) |     1156     |    1026.4   |   1039.5   |    8    |   2502  |
| FirstScreen Dom |     1156     |    1060.3   |   1072.5   |    37   |   2585  |


0ms - finish render data
4ms - preparing the table data...

------- Performance Testing Results -------

Page : testDemoPage

|                 | Sample Count | average(ms) | median(ms) | min(ms) | max(ms) |
| :-------------- | :----------: | :---------: | :--------: | :-----: | :-----: |
| Test API        |     7159     |    992.2    |     985    |    2    |   2514  |
| Node All API(n) |     7159     |    992.3    |     986    |    2    |   2522  |
| FirstScreen Dom |     7159     |    1025.8   |    1011    |    20   |   2738  |


1ms - finish render data
Exporting file in HTML finished

-------------------------------------------------
       Time Using Middleware by Staydan.com      

   Collect Data & Analyze Logs & Export Reports  
-------------------------------------------------
```

## How to Integrate with your app(Examples)

**Node side js**

``` js
var express      = require('express')
var measureTime = require('time-using-middleware')

var app = express()

// Only the originalUrl match the pattern (Usually match the specified falg 'staydan-performance-testing'), this page visit will be tracked by this time-using-middleware
var measureUrlPatterns = [
    {
        pattern: /^\/detail\/content.*staydan-performance-testing$/,
        pageName: 'detailContent'
    },
    {
        pattern: /^\/announcement.*staydan-performance-testing$/,
        pageName: 'announcement'
    }
];

// All the log files will be stored under `/log/timeUsing/` on your server
app.use(timeUsingMiddleware({
    measureUrlPatterns: measureUrlPatterns,
    logPath: '/log/timeUsing/',
    runtimePath: path.resolve(__dirname, './')
}));

app.get('/detail/content', function(req, res) {
    res.render('/page/content', {data: data});
})

// Expose two Public APIs to your app
// It can collect data and finish a collect session
app.post('/tu/finish', timeUsingMiddlewareCollectFinish);
app.post('/tu/add', timeUsingMiddlewareCollectAdd);

function timeUsingMiddlewareCollectFinish(req, res, next) {
    var data = req.body;

    if (req.cookies.mtKey) {
        data.mtKey = req.cookies.mtKey;
        timeUsingMiddleware.finishRecording(res, data, {
            success: function () {
                res.send({code: 200});
            },
            error: function () {
                res.send({code: 0});
            }
        });
    }
    else {
        res.send({code: 0});
    }
}

function timeUsingMiddlewareCollectAdd(req, res, next) {
    var data = req.body;

    if (req.cookies.mtKey) {
        data.mtKey = req.cookies.mtKey;
        timeUsingMiddleware.addTimeRecord(data, {
            success: function () {
                res.send({code: 200});
            },
            error: function () {
                res.send({code: 0});
            }
        });
    }
    else {
        res.send({code: 0});
    }
}
app.listen(8080)

```

**Client side js**

``` js
// Time collected in front-end side
// widgetContentLoaded & DOMContentLoaded is timestamp format
// it need to be calculated carefully when exporting report
var timeCostCollected = {
    'allFeApiFinishTime': 186,
    '/staydan/v1/game/list': 170,
    '/staydan/v1/tool/list': 172,
    '/staydan/v1/extension/list': 174,
    '/staydan/v1/share': 181,
    'widgetContentLoaded': 1463713604103,
    'DOMContentLoaded': 1463713603376
}

// Send back the time data to middleware to be managed
util.post('/tu/finish', timeCostCollected)
    .then(function (tuResponse) {
        console.log(tuResponse);
    })
    .always(function () {
        window.location.reload();
    });
```

## Options

### domain (Deprecated)

 [`String`, Optional]
`mtKey` use this, it always be the host of your website.

### pageConfig (not supported)

 [`JSON`, Optional]
use this to calc the time attributes and export them to the reports.

``` js
/**
 * Definition how to calc all the attributes read from log file
 *
 * key                  The label of each Row within the reports
 * formula: <string>    Direclty use it to be calculated
 *          <array>     formula[0] - formula[1] - formula[2] -...
 *                      The final result will be used in report
 * 
 * @type {Array}
 */
```
``` json
[
    {
        "pageName": "timeUsingTestPage",
        "configs": [
            {
                "key": "Test API",
                "formula": "/test"
            },
            {
                "key": "Node All API(n)",
                "formula": "allNodeApiFinishTime"
            },
            {
                "key": "FirstScreen Dom",
                "formula": [
                    "DOMContentLoaded",
                    "pageStart"
                ]
            }
        ]
    },
    {
        "pageName": "testDemoPage",
        "configs": [
            {
                "key": "Test API",
                "formula": "/test"
            },
            {
                "key": "Node All API(n)",
                "formula": "allNodeApiFinishTime"
            },
            {
                "key": "FirstScreen Dom",
                "formula": [
                    "DOMContentLoaded",
                    "pageStart"
                ]
            }
        ]
    }
]
```

### measureUrlPatterns

[`Array`, Required]
 Define the patterns, it can be regex expression as well. time-using-middleware will check the patterns when the request come.

### logPath

[`String`, Required]
Define the path where time-using-middleware middleware store the log files.

### [MIT Licensed](LICENSE) [@staydan.com](http://staydan.com) 2016

[license-image]: https://img.shields.io/npm/l/time-using-middleware.svg?maxAge=2592000&style=flat-square
[downloads-image]: https://img.shields.io/npm/dm/time-using-middleware.svg?maxAge=2592000&style=flat-square
[npm-version-image]: http://img.shields.io/npm/v/time-using-middleware.svg?maxAge=2592000&style=flat-square
[npm-url]: https://www.npmjs.com/package/time-using-middleware
