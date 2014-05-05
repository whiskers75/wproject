module.exports.fn = function(global) {
    var p = global.Q.defer();
    global.reply('Everything you send to this bot is JS. Have a poke around...');
    p.resolve();
    return p.promise;
};
module.exports.level = 1;