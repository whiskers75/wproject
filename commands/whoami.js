module.exports.fn = function(global) {
    var p = global.Q.defer();
    global.reply('You are ' + global.user.name + ' (' + global.user._id + '), with a permission level of ' + global.user.level);
    if (global.user[global.to]) {
        global.reply('You have these permissions here: ' + global.user[global.to].join(', '));
    }
    p.resolve();
    return p.promise;
};
module.exports.level = 1;