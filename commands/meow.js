module.exports.fn = function(global, victim) {
    var p = global.Q.defer();
    var esc = require('js-string-escape');
    if (typeof global.slapped != 'undefined' && global.slapped > 2 && global.user.level < 10) {
        p.reject('pls2notspam');
        return p.promise;
    }
    if (typeof global.slapped == 'undefined') global.slapped = 0;
    global.slapped++;
    global.run('w.action("' + global.to + '", "meows at ' + esc(String(global.user.name).replace(/[\r\n\v\f\x85\u2028\u2029]/g, '')) + '!")');
    p.resolve();
    return p.promise;
};
module.exports.level = 1;