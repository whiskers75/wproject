var irc = require('fwilson-irc-fork');
var accounts = {}; // to store WHOX data
var util = require('util');
var vm = require('vm');
var cp = require('child_process');
var util = require('util');
var config = require('nconf');
var winston = require('winston');
var m = {};
var MongoClient = require('mongodb').MongoClient;
config.env();
config.file(__dirname + '/config.json');
config.defaults({
    nick: 'stupidb0t',
    username: 'stupidb0t',
    tagline: 'the most misconfigured bot ever',
    mongo: 'mongodb://localhost:27017/wbot',
    irc: 'chat.freenode.net',
    level: 'info',
    password: 'dummy',
    channels: ['#fluxbot'],
    prefix: 'meh',
    controlchan: false,
    admininvite: true
});
var log = new winston.Logger({
    transports: [
    new winston.transports.Console({
        colorize: true,
        label: 'core',
        level: config.get('level')
    })],
    exitOnError: false
});
log.info('Welcome to ^w, by whiskers75!');
log.info('I am become ' + config.get('nick') + ', ' + config.get('tagline') + '!');
log.info('Plugging everything in....');
MongoClient.connect(config.get('mongo'), function(err, db) {
    if (err) {
        log.error('Error connecting to MongoDB!');
        throw err;
    }
    log.info('Connected to MongoDB :)');
    m = db;
    var w = new irc.Client(config.get('irc'), config.get('nick'), {
        userName: config.get('username'),
        nick: config.get('nick'),
        realName: config.get('tagline'),
        password: config.get('password'),
        channels: config.get('channels'),
        sasl: true,
        floodProtection: true
    });
    w.on('registered', function() {
        w.conn.write('CAP REQ :account-notify\r\n');
    });
    if (config.get('controlchan')) {
        var IRCLogger = winston.transports.IRCLogger = function(opts) {
            this.name = IRCLogger;
            this.level = opts.level || 'warn';
        };
        util.inherits(IRCLogger, winston.Transport);
        IRCLogger.prototype.log = function(level, msg, meta, cb) {
            w.say(config.get('controlchan'), '[' + level + '] ' + msg);
            cb(null, true);
        };
        log.add(IRCLogger, {level: 'warn'});
    }
    w.on('raw', function(o) {
        if (o.command === '903') log.info('SASL: authentication successful. :D');
        if (o.command === '904') log.warn('SASL: authentication failed! D:');
        if (o.command === '437') log.error(o.args[1] + ': ' + o.args[2]);
        if (o.command === 'rpl_yourhost') log.info('IRC: ' + o.args[1]);
        if (o.command === 'rpl_endofmotd') {
            log.info('IRC: connected! :)');
            log.info('You should be able to find me in these channels: ' + config.get('channels').join(', '));
        }
        if (o.command === "354") {
            // WHOX %na
            if (o.args[2] === '0') {
                return delete accounts[o.args[1]];
            }
            accounts[o.args[1]] = o.args[2];
        }
        if (o.command === "ACCOUNT") {
            // account-notify CAP extension
            if (o.args[0] === '*') {
                return delete accounts[o.nick];
            }
            accounts[o.nick] = o.args[0];
        }
        log.debug(JSON.stringify(o));
    });
    w.on('error', function(err) {
        if (err.args && err.args[1] && err.args[1].indexOf('#') != -1) {
            return w.say(err.args[1], '\x0304[error]\x0F ' + err.command + ': ' + err.args[2]);
        }
        log.error(util.inspect(err).replace(/[\r\n\v\f\x85\u2028\u2029]/g, ''));
    });
    w.on('join', function(channel, nick) {
        if (nick === config.get('nick')) {
            w.conn.write('WHO ' + channel + ' %na\r\n');
        }
        else {
            w.conn.write('WHO ' + nick + ' %na\r\n');
        }
    });
    w.on('invite', function(chan, from, raw) {
        if (!accounts[from]) return w.notice(from, 'Please identify with NickServ to use this bot!');
        m.collection('users').find({
            account: accounts[from]
        }).toArray(function(err, results) {
            if (results.length === 0) {
                return w.notice(from, '[/invite ' + chan + '] I don\'t know you.');
            }
            if (results[0].level < 9000 && config.get('admininvite')) {
                return w.notice(from, '[/invite ' + chan + '] A level of 9000 or more is required.');
            }
            w.say(from, '[/invite ' + chan + '] I\'ll be right there.');
            w.join(chan);
        });
    });
    w.on('message', function(nick, to, text, raw) {
        text = String(text).split(' ');
        if (text[0] === config.get('nick') || text[0] === config.get('nick') + ',' || text[0] === config.get('nick') + ':' || text[0] === config.get('prefix')) {
            if (!accounts[nick]) return w.notice(nick, 'Please identify with NickServ to use this bot!');
            m.collection('users').find({
                account: accounts[nick]
            }).toArray(function(err, users) {
                if (err) return w.say(to, nick + ': ' + err);
                if (users.length === 0) {
                    m.collection('users').insert({
                        account: accounts[nick],
                        name: nick,
                        penalty: 0,
                        level: 1
                    }, function(err) {
                        if (err) return w.say(to, nick + ': ' + err);
                        w.say(to, nick + ': Sorry, didn\'t quite catch that! Mind repeating it for me? (user created: %' + accounts[nick] + ')');
                    });
                } else {
                    if (users[0].level < 0) {
                        return w.notice(nick, 'You are banned from using ^w. (permission level: ' + users[0].level + ')');
                    }
                    var c = cp.fork('./sandbox.js');
                    text.shift();
                    c.send({
                        code: text.join(' ')
                    });
                    log.info('User ' + users[0].name + ' (' + raw.user + '@' + raw.host + ', %' + accounts[nick] + ') is running: ' + text.join(' '));
                    c.send({
                        env: JSON.stringify({
                            nick: nick,
                            to: to,
                            text: text,
                            raw: raw,
                            mongo_url: config.get('mongo'),
                            account: accounts[nick],
                            mongo_id: users[0]._id
                        })
                    });
                    c.done = false;
                    c.acted = false; // did something happen?
                    c.on('message', function(msg) {
                        if (msg.connected) {
                            // We have connected to Mongo on the sandbox
                            setTimeout(function() {
                                if (!c.done) {
                                    c.kill('SIGKILL');
                                    m.collection('users').update({account: accounts[nick]}, {$inc: {penalty: 1}}, function() {
                                       w.say(to, nick + ': \x0304Timeout\x0F [1 penalty point]'); 
                                    });
                                    log.warn('User ' + users[0].name + ' (' + raw.user + '@' + raw.host + ', %' + accounts[nick] + ') caused a timeout!');
                                    c.acted = true;
                                }
                            }, 2000);
                        }
                        if (msg.run) {
                            try {
                                vm.runInNewContext(msg.run, {
                                    w: w
                                });
                                c.acted = true;
                            } catch (e) {
                                log.warn('User ' + users[0].name + ' (' + raw.user + '@' + raw.host + ', %' + accounts[nick] + ') caused: ' + e);
                                w.say(to, nick + ': \x02ಠ_ಠ\x02 (you broke it, or some plugin is doing something nasty)');
                                c.acted = true;
                            }
                        }
                        if (msg.reply) {
                            w.say(to, nick + ': ' + msg.reply);
                            c.acted = true;
                        }
                    });
                    c.on('exit', function() {
                        c.done = true;
                        if (!c.acted) {
                            log.debug('Nothing happened.');
                            w.say(to, nick + ': Some weird error happened.');
                        }
                    });
                }
            });
        }
    });
});
