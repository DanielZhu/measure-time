# time-using-middleware

A tool to collect time cost for requests, waiting for HTML back, rendering page and etc., also it can export performance testing reports to HTML & pdf easily.

## Notice

This timing tool is under constructing right now, currenlty I'm using it to measure performance when calling APIs from nodejs, and support collect all the key-value pair data throung two public methods: `addTimeRecord` & `finishRecording`.

So, it need users(usually developers) to write some codes in their project to collect data and send back to this middleware. All the log files will stored in which you specified in the options.

**mtKey**

The cookie which will be set to the client if the page's url was included in patterns above. And it will be removed finally when the current measuring session finish (means `done: 1` was recieved by time-using-middleware collection api) or will be replaced by a new one.

## Installation

```sh
$ npm install time-using-middleware --save
```

## How to Export Report

``` sh
timeUsing -i ./log/timeUsing
```

Currently output path is not supported

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

**options.pageConfig (local JSON file)**
> veresion <= v0.4.1: It's been hard coded in the tool, I will expose it soon

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
{
    'pageName': 'detailContent',
    'configs': [
        {
            'key': 'Combined Front-end API',
            'formula': 'allFeApiFinishTime'
        },
        {
            'key': 'Game API',
            'formula': '/staydan/v1/game/list'
        },
        {
            'key': 'Tool API',
            'formula': '/staydan/v1/tool/list'
        },
        {
            'key': 'Extension API',
            'formula': '/staydan/v1/extension/list'
        },
        {
            'key': 'Share API',
            'formula': '/staydan/v1/share'
        },
        {
            'key': 'Comment API(n)',
            'formula': '/staydan/blog/comment/list'
        },
        {
            'key': 'PostList API(n)',
            'formula': '/staydan/blog/post/list'
        },
        {
            'key': 'Node All API(n)',
            'formula': 'allNodeApiFinishTime'
        },
        {
            'key': 'FirstScreen Dom Loaded',
            'formula': [
                'DOMContentLoaded',
                'pageStart'
            ]
        },
        {
            'key': 'All Page Dom Loaded',
            'formula': [
                'widgetContentLoaded',
                'pageStart'
            ]
        }
    ]
}
```

## Options

### domain (not supported)

 [`String`, Optional]
`mtKey` use this, it always be the host of your website.

### pageConfig (not supported)

 [`JSON`, Optional]
use this to calc the time attributes and export them to the reports.

### measureUrlPatterns

[`Array`, Required]
 Define the patterns, it can be regex expression as well. time-using-middleware will check the patterns when the request come.

### logPath

[`String`, Required]
Define the path where time-using-middleware middleware store the log files.

### [MIT Licensed](LICENSE) @staydan.com 2016
