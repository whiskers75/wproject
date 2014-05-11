module.exports.fn = function(global, action) {
    var p = global.Q.defer();
    var esc = global.require('js-string-escape');
    if (typeof global.slapped != 'undefined' && global.slapped > 2 && global.user.level < 10) {
        p.reject('pls2notspam');
        return;
    }
    if (esc(String(action.toString())).length > 40) {
        p.reject('pls');
        return;
    }
    if (typeof global.slapped == 'undefined') global.slapped = 0;
    global.slapped++;
    global.run('w.action("' + global.to + '", "' + esc(String(action.toString()).replace(/[\r\n\v\f\x85\u2028\u2029]/g, '')) + '")');
    p.resolve();
    return p.promise;
};
module.exports.level = 1;
