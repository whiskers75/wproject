module.exports.fn = function(global, thing) {
    var p = global.Q.defer();
    var request = global.require('request');
    var util = global.require('util');
    if (String(util.inspect(thing), {
        depth: 0
    }).length > 200) {
        var r = request.post('http://sprunge.us', function(err, res, body) {
            if (res.statusCode == 414 || res.statusCode == 413) {
                global.reply('Your reply of ' + util.inspect(thing, {
                    depth: 0
                }).length + ' characters long is too big for a pastebin. Just get out.');
                process.exit(1);
            }
            if (!body || err) {
                global.reply('Error uploading data.');
                process.exit(1);
            }
            global.reply(body);
            if (global.userContext.enableChaining) {
                p.resolve(body)
            } else {
                p.resolve();
            }
        });
        var form = r.form();
        form.append('sprunge', String(util.inspect(thing, {
            depth: 0
        })));
    } else {
        if (typeof global.slapped != 'undefined' && global.slapped > 2 && global.user.level < 10) {
            p.reject('pls2notspam');
            return;
        }
        if (typeof global.slapped == 'undefined') global.slapped = 0;
        global.slapped++;
        var inspected = String(util.inspect(thing, {
            depth: 0,
            colors: true
        }));
        inspected = inspected.replace(new RegExp('\u001b\\[39m', 'g'), '\u000f');
        inspected = inspected.replace(new RegExp('\u001b\\[36m', 'g'), '\x0311');
        inspected = inspected.replace(new RegExp('\u001b\\[1m', 'g'), '\x02');
        inspected = inspected.replace(new RegExp('\u001b\\[22m', 'g'), '\x02');
        inspected = inspected.replace(new RegExp('\u001b\\[32m', 'g'), '\x0303');
        inspected = inspected.replace(new RegExp('\u001b\\[35m', 'g'), '\x0306');
        inspected = inspected.replace(new RegExp('\u001b\\[33m', 'g'), '\x0308');
        inspected = inspected.replace(new RegExp('\u001b\\[90m', 'g'), '\x0314');
        inspected = inspected.replace(new RegExp('\u001b\\[31m', 'g'), '\x0304');
        inspected = inspected.replace(/[\r\n\v\f\x85\u2028\u2029]/g, '');
        if (inspected.length >= 200) {
            inspected = inspected.substr(0, 200) + '\u000f\u0016... (more)';
        }
        global.reply(inspected);
        p.resolve();
    }
    return p.promise;
};
module.exports.level = 1;