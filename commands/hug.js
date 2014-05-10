module.exports.fn = function(global, victim) {
    var p = global.Q.defer();
    var esc = global.require('js-string-escape');
    if (typeof global.slapped != 'undefined' && global.slapped > 2 && global.user.level < 10) {
        p.reject('pls2notspam');
        return p.promise;
    }
    if (typeof victim.isPerson != 'boolean') {
        p.reject('You can\'t hug a ' + typeof victim + '! (try getUser(\'person\').then(hug)');
        return p.promise;
    }
    if (!victim.isPerson) {
        p.reject('You can\'t hug inanimate objects. (try getUser(\'person\').then(hug)');
        return p.promise;
    }
    if (typeof victim.toString != 'function') {
        p.reject('wat?');
        return p.promise;
    }
    if (typeof global.slapped == 'undefined') global.slapped = 0;
    global.slapped++;
    global.run('w.action("' + global.to + '", "hugs ' + esc(String(victim.toString())).replace(/[\r\n\v\f\x85\u2028\u2029]/g, '') + ' <3")');
    if (global.userContext.enableChaining) {
        p.resolve(victim);
    }
    else {
        p.resolve();
    }
    return p.promise;
};
module.exports.level = 1;