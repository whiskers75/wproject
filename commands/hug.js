module.exports.fn = function(global, victim) {
    var p = global.Q.defer();
    if (typeof global.slapped != 'undefined' && global.user.level < 10) {
        p.reject('only one hug or slap is allowed if your user level is under 10');
        return;
    }
    if (typeof victim.isPerson != 'boolean') {
        p.reject('You can\'t hug a ' + typeof victim + '! (try getUser(\'person\').then(hug)');
        return;
    }
    if (!victim.isPerson) {
        p.reject('You can\'t hug inanimate objects. (try getUser(\'person\').then(hug)');
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
    global.run('w.action("' + global.to + '", "hugs ' + String(victim.toString()) + ' <3")');
    p.resolve();
    return p.promise;
};
module.exports.level = 1;