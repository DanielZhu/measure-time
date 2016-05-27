/* eslint-disable no-console */
/**
 * @file Time Using Middleware - Collect Time cost and Measure
 *
 * MIT Licensed
 * @author Daniel Zhu <enterzhu@gmail.com>
 */
var fse = require('fs-extra');
var path = require('path');
var md5 = require('md5');
var chalk = require('chalk');
var cookieParser;
try {
    cookieParser = require('cookie-parser');
}
catch (e) {
    checkDeps(cookieParser);
}

var logPath = '';
var pageViewLogFilePath = '';
var logRelativeFilePath = '';

exports = module.exports = function timeUsingMiddleware(opts) {
    return function timeUsingMiddleware(req, res, next) {
        var matchedMeasure = false;
        logPath = opts.runtimePath + opts.logPath;
        pageViewLogFilePath = path.resolve(__dirname, logPath + '/page.%pageName%.log');
        logRelativeFilePath = path.resolve(__dirname, logPath + '/%key%.log');

        // console.log('logPath: ' + logPath);
        // console.log('pageViewLogFilePath: ' + pageViewLogFilePath);
        // console.log('logRelativeFilePath: ' + logRelativeFilePath);

        opts.measureUrlPatterns.forEach(function (item) {
            if (item.pattern.test(req.originalUrl)) {
                matchedMeasure = item;
            }
        });

        if (matchedMeasure) {
            var now = new Date();
            req.pageStartTime = now.getTime();
            var date = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate()
                + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
            var formatDate = dateformat(date, 'MMddhhmmss');
            req.mtKey = formatDate + '.'
                + md5(matchedMeasure.pageName + '-' + req.pageStartTime + '-' + randomNum());
            var costTimeStart = {
                mtKey: req.mtKey,
                pageName: matchedMeasure.pageName,
                pageStart: req.pageStartTime
            };
            res.cookie(
                'mtKey',
                req.mtKey,
                {httpOnly: false, expires: new Date(Date.now() + 1000 * 60 * 10)}
                // domain: opts.domain}
            );
            // console.log('===timeUsing=req.cookies.mtKey: ' + req.mtKey);
            // console.log('===timeUsing=logpath: ' + logPath + '/' + req.mtKey + '.log');
            fse.outputFile(
                logPath + '/' + req.mtKey + '.log',
                JSON.stringify(costTimeStart),
                function (err) {

                }
            );
        }
        else {
            // res.clearCookie('mtKey');
        }

        next();
    };
};

function checkDeps(target) {
    try {
        if (typeof target === 'undefined' || target === null) {
            console.log(chalk.bgRed('time-using-middleware does depends on cookie-parser middleware as it need to parse cookie and check it. Please check your deps.'));
        }
    } catch (e) {
        console.log(chalk.bgRed('Error'));
    }
}

function finishRecording(res, record, opts) {
    // res && res.clearCookie('mtKey');
    if (record.hasOwnProperty('mtKey')) {
        var logFilePath = logRelativeFilePath.replace(/%key%/, record.mtKey);
        // console.log('readFie: ' + logFilePath);
        fse.readFile(logFilePath, function (err, savedCostTime) {
            if (err) {
                opts.error && opts.error();
            }
            else {
                savedCostTime = JSON.parse(savedCostTime);
                var matched = savedCostTime.hasOwnProperty('mtKey')
                            && record.mtKey === savedCostTime.mtKey;
                if (matched) {
                    for (var key in savedCostTime) {
                        if (savedCostTime.hasOwnProperty(key)) {
                            record[key] = savedCostTime[key];
                        }
                    }

                    opts.success && opts.success();

                    delete record.mtKey;
                    collectForPage(record);
                    fse.remove(logFilePath, function (err) {
                        // if (err) return console.error(err)
                        // console.log('success!')
                    });
                }
                else {
                    opts.error && opts.error();
                }

            }
        });
    }
    else {
        // No mtKey, skip this op
        opts.error && opts.error();
    }
}

function addTimeRecord(record, opts) {
    if (record.hasOwnProperty('mtKey')) {
        var logFilePath = logRelativeFilePath.replace(/%key%/, record.mtKey);

        fse.readFile(logFilePath, function (err, savedCostTime) {
            if (err) {
                opts.error && opts.error();
            }
            else {
                savedCostTime = JSON.parse(savedCostTime);
                var matched = savedCostTime.hasOwnProperty('mtKey')
                            && record.mtKey === savedCostTime.mtKey;
                if (matched) {
                    for (var key in record) {
                        if (record.hasOwnProperty(key)) {
                            savedCostTime[key] = record[key];
                        }
                    }
                    fse.outputFile(logFilePath, JSON.stringify(savedCostTime), function (err) {
                        if (err) {
                            opts.error && opts.error();
                        }
                        else {
                            opts.success && opts.success();
                        }
                    });
                }
                else {
                    opts.error && opts.error();
                }
            }
        });
    }
    else {
        // No mtKey, skip this op
        opts.error && opts.error();
    }
}

function collectForPage(record) {
    var logFilePath = pageViewLogFilePath.replace(/%pageName%/, record.pageName);
    delete record.pageName;

    fse.ensureFileSync(logFilePath);
    fse.readFile(logFilePath, function (err, savedPageLogs) {
        try {
            if (savedPageLogs && savedPageLogs.length > 0) {
                savedPageLogs = JSON.parse(savedPageLogs);
            }
            else {
                savedPageLogs = [];
            }
            savedPageLogs.push(record);

            fse.outputFile(logFilePath, JSON.stringify(savedPageLogs), function (err) {});
        }
        catch (e) {
            console.log(e);
        }
    });
}

function randomNum() {
    return Math.random() * 10000;
}

function dateformat(date, format) {
    date = date.replace(/-/g, '/');
    format = format || 'yyyy-MM-dd';

    // switch (typeof date) {
        // case 'string':
            // date = parseInt(date, 10);
        // case 'number':
    date = new Date(date);
            // break;
    // }

    if (!date instanceof Date) {
        date = new Date();
    }

    var o = {
        'M+': date.getMonth() + 1, // month
        'd+': date.getDate(), // day
        'h+': date.getHours(), // hour
        'm+': date.getMinutes(), // minutes
        's+': date.getSeconds(), // second
        'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
        'S': date.getMilliseconds() // ms
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(
                RegExp.$1,
                (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))
            );
        }
    }

    return format;
}

exports.addTimeRecord = addTimeRecord;
exports.finishRecording = finishRecording;
/* eslint-enable no-console */
