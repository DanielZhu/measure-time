/**
 * @file Export Utility
 *
 * @author Daniel Zhu <enterzhu@gmail.com>
 */
var fse = require('fs-extra');
var path = require('path');
var etpl = require('etpl');

etpl.config({
    commandOpen: '{{',
    commandClose: '}}'
});

var writeToFile = function (filename, line) {
    fse.outputFileSync(filename, line, {encoding: 'utf8'});
};

var renderHtml = function (pageList, perfData) {
    var tplPath = path.join(__dirname, './tpl/report.html');

    var tplText = fse.readFileSync(tplPath, {encoding: 'utf8', autoClose: true});

    var render = etpl.compile(tplText);
    console.log(JSON.stringify(perfData));
    var compiled = render({pageList: pageList, perfList: perfData});
    writeToFile('report.' + new Date().getTime() + '.html', compiled);
};

module.exports.renderHtml = renderHtml;
