module.exports.fn = function(global, action) {
    var p = global.Q.defer();
    var esc = global.require('js-string-escape');
    if (global.slapped && global.user.level < 9000) {
        return p.reject('don\'t spam');
    }
    global.run('w.action("' + global.to + '", "' + esc(String(action.toString())) + '")');
    p.resolve();
    return p.promise;
};
module.exports.level = 1;