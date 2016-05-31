/* eslint-disable no-console */
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
var markdown = require('markdown').markdown;

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

function getMarkdownTable(tableData) {
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

    return mkTable(data, {
        align: tableRowAlign || [],
        stringLength: stringLength
    });
}

var printMarkdownTable = function (title, tableData) {
    var now = new Date().getTime();

    var resultInMd = getMarkdownTable(tableData);

    console.log(this.timeDiff(now) + 'preparing the table data...');
    // console.log('table data: ' + JSON.stringify(data));
    console.log('');
    console.log(chalk.white('------- Performance Testing Results -------'));
    console.log('');
    console.log(chalk.yellow('Page : ' + title));
    console.log('');

    console.log(chalk.white(resultInMd));

    now = new Date().getTime();
    console.log('\n\n');
    console.log(this.timeDiff(now) + 'finish render data');
};

var exportFile = function (format, data) {
    var tplPath = path.join(__dirname, './tpl/report.html');

    var tplText = fse.readFileSync(tplPath, {encoding: 'utf8', autoClose: true});

    var render = etpl.compile(tplText);
    var compiled = render({perfList: data});
    writeToFile('report.' + new Date().getTime() + '.html', compiled);
};

var timeDiff = function (previous) {
    return chalk.yellow(new Date().getTime() - previous + 'ms - ');
};

module.exports.timeDiff = timeDiff;
module.exports.printMarkdownTable = printMarkdownTable;
module.exports.exportFile = exportFile;
