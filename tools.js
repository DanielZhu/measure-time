/**
 * @file Export Utility
 *
 * @author Daniel Zhu <enterzhu@gmail.com>
 */
var fse = require('fs-extra');
var path = require('path');
var etpl = require('etpl');
var chalk = require('chalk');
var mkTable = require('markdown-table');

etpl.config({
    commandOpen: '{{',
    commandClose: '}}'
});

var writeToFile = function (filename, line) {
    fse.outputFileSync(filename, line, {encoding: 'utf8'});
};

/**
 * Get the length of a string, minus ANSI color
 * characters.
 *
 * @param {string} value The String
 * @return {string} Length
 */
function stringLength(value) {
    var length = chalk.stripColor(value).length;
    return length;
}

var printMarkdownTable = function (title, tableData) {
    var now = new Date().getTime();
    var data = [];
    var initedHeader = false;
    var tableHeader = [''];
    var tableRowAlign = ['l'];
    for (var indexItem in tableData) {
        if (tableData.hasOwnProperty(indexItem)) {
            var tableBodyRow = [];
            tableBodyRow.push(indexItem);
            for (var subIndexItem in tableData[indexItem]) {
                if (tableData[indexItem].hasOwnProperty(subIndexItem)) {
                    if (!initedHeader) {
                        tableHeader.push(subIndexItem);
                        tableRowAlign.push('c');
                    }
                    tableBodyRow.push(tableData[indexItem][subIndexItem]);
                }
            }
            if (!initedHeader) {
                initedHeader = true;
                data.push(tableHeader);
            }
            // console.log('table row: ' + JSON.stringify(tableBodyRow));
            data.push(tableBodyRow);
        }
    }
    console.log(this.timeDiff(now) + 'preparing the table data...');
    // console.log('table data: ' + JSON.stringify(data));
    console.log('');
    console.log(chalk.white('------- Performance Testing Results -------'));
    console.log('');
    console.log(chalk.yellow('Page : ' + title));
    console.log('');

    now = new Date().getTime();
    console.log(chalk.white(mkTable(data, {
        align: tableRowAlign,
        stringLength: stringLength
    })));

    console.log('');
    console.log('');
    console.log(this.timeDiff(now) + 'finish render data');
};

var renderHtml = function (pageList, perfData) {
    var tplPath = path.join(__dirname, './tpl/report.html');

    var tplText = fse.readFileSync(tplPath, {encoding: 'utf8', autoClose: true});

    var render = etpl.compile(tplText);
    console.log(JSON.stringify(perfData));
    var compiled = render({pageList: pageList, perfList: perfData});
    writeToFile('report.' + new Date().getTime() + '.html', compiled);
};

var timeDiff = function (previous) {
    return chalk.yellow(new Date().getTime() - previous + 'ms - ');
}
module.exports.timeDiff = timeDiff;
module.exports.printMarkdownTable = printMarkdownTable;
module.exports.renderHtml = renderHtml;
