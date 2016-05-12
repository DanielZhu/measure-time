/**
 * @file Measure time - Collect Time cost and Measure
 *
 * MIT Licensed
 * @author Daniel Zhu <enterzhu@gmail.com>
 */
var fse = require('fs-extra');
var path = require('path');
var md5 = require('md5');

exports = module.exports = function measureTime(opts) {
    return function measureTime(req, res, next) {
        var matchedMeasure = false;
        opts.measureUrlPatterns.forEach(function (item) {
            if (item.pattern.test(req.originalUrl)) {
                matchedMeasure = item;
            }
        });

        if (matchedMeasure) {
            req.pageStartTime = new Date().getTime();
            req.encryptedKey = md5(matchedMeasure.pageName + '-' + req.pageStartTime + '-' + randomNum());
            var costTimeStart = {
                pageSessionKey: req.encryptedKey,
                pageName: matchedMeasure.pageName,
                pageStart: req.pageStartTime
            };
            res.cookie(
                'mtKey',
                req.encryptedKey,
                {httpOnly: false, expires: new Date(Date.now() + 1800000),
                domain: '.hui.baidu.com'}
            );
            fse.outputJson(
                opts.logPath + '/measureTime.' + req.encryptedKey + '.json',
                costTimeStart,
                function (err) {

                }
            );
        }

        next();
    };
};

function randomNum() {
    return Math.random() * 10000;
}

function addTimeRecord(record, opts) {
    if (record.hasOwnProperty('encryptedKey')) {
        var logRelativeFilePath = '../../log/measureTime/measureTime.' + record.encryptedKey + '.json';
        var logFilePath = path.resolve(__dirname, logRelativeFilePath);
        fse.readJson(logFilePath, function (err, savedCostTime) {
            for (var key in record) {
                if (record.hasOwnProperty(key) && key !== 'encryptedKey') {
                    savedCostTime[key] = parseFloat(record[key]);
                }
            }

            fse.outputJson(logFilePath, savedCostTime, function (err) {
                opts.success && opts.success();
            });
        });
    }
    else {
        // No encryptedKey, skip this op
        opts.error && opts.error();
    }
}

exports.addTimeRecord = addTimeRecord;
