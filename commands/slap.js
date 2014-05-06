module.exports.fn = function(global, victim) {
    var p = global.Q.defer();
    var esc = global.require('js-string-escape');
    global.m.collection('users').find({
        host: global.raw.host,
        user: global.raw.user
    }).toArray(function(err, results) {
        if (typeof global.slapped != 'undefined') {
            p.reject('only one hug or slap is allowed');
            return;
        }
        if (typeof victim.isPerson != 'boolean') {
            p.reject('You can\'t slap a ' + typeof victim + '! (try getUser(\'person\').then(slap)');
            return;
        }
        if (!victim.isPerson) {
            p.reject('You can\'t slap inanimate objects. (try getUser(\'person\').then(slap)');
            return;
        }
        if (typeof victim.toString != 'function') {
            p.reject('wat?');
            return;
        }
        if (victim.length > 20) {
            p.reject('ಠ_ಠ');
            return;
        }
        global.slapped = true;
        global.run('w.action("' + global.to + '", "slaps ' + esc(String(victim.toString())) + ' around a bit with a large trout!")');
        p.resolve();
    });
    return p.promise;
};
module.exports.level = 1;