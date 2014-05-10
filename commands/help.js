module.exports.fn = function(global) {
    var p = global.Q.defer();
    var list = [];
    Object.keys(global.userContext.global).forEach(function(o) {
        if (o != 'this' && o != 'defer' && o != 'global' && o != 'me' && o != 'enableChaining') {
            list.push(o);
        }
    });
    global.reply('\x02Loaded commands:\x02 ' + list.join('(), '));
    p.resolve();
    return p.promise;
};
module.exports.level = 1;