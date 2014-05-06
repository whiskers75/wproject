var irc = require('fwilson-irc-fork');
var fs = require('fs');
var commands = {};
var util = require('util');
var vm = require('vm');
var cp = require('child_process');
var util = require('util');
var config = require('nconf');
util.inspect.colors = irc.colors.codes;
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
        if (o.command == '903') log.info('SASL: authentication successful. :D');
        if (o.command == '904') log.warn('SASL: authentication failed! D:');
        if (o.command == 'rpl_yourhost') log.info('IRC: ' + o.args[1]);
        if (o.command == 'rpl_endofmotd') {
            log.info('IRC: connected! :)');
            log.info('You should be able to find me in these channels: ' + config.get('channels').join(', '));
        }
        log.debug(JSON.stringify(o));
    });
    w.on('error', function(err) {
        log.error(util.inspect(err));
    });
    w.on('invite', function(chan, from, raw) {
        m.collection('users').find({
            host: raw.host,
            user: raw.user
        }).toArray(function(err, results) {
            if (results.length === 0) {
                return w.say(from, 'Who are you?');
            }
            if (results[0].level < 9000 && config.get('admininvite')) {
                return w.say(from, 'A level of 9000 or more is required.');
            }
            w.join(chan);
        });
    });
    w.on('message', function(nick, to, text, raw) {
        text = String(text).split(' ');
        if (text[0] == config.get('nick') || text[0] == config.get('nick') + ',' || text[0] == config.get('nick') + ':' || text[0] == config.get('prefix')) {
            m.collection('users').find({
                user: raw.user,
                host: raw.host
            }).toArray(function(err, users) {
                if (err) return w.say(to, nick + ': ' + err);
                if (users.length === 0) {
                    m.collection('users').insert({
                        user: raw.user,
                        host: raw.host,
                        name: nick,
                        level: 1
                    }, function(err) {
                        if (err) return w.say(to, nick + ': ' + err);
                        w.say(to, nick + ': Please repeat the command. (user created: ' + raw.user + '@' + raw.host + ')');
                    });
                } else {
                    var c = cp.fork('./sandbox.js');
                    text.shift();
                    c.send({
                        code: text.join(' ')
                    });
                    log.info('User ' + users[0].name + ' (' + raw.user + '@' + raw.host + ') is running: ' + text.join(' '));
                    c.send({
                        env: JSON.stringify({
                            nick: nick,
                            to: to,
                            text: text,
                            raw: raw,
                            mongo_url: config.get('mongo')
                        })
                    });
                    c.done = false;
                    c.acted = false; // did something happen?
                    c.on('message', function(m) {
                        if (m.connected) {
                            // We have connected to Mongo on the sandbox
                            setTimeout(function() {
                                if (!c.done) {
                                    c.kill('SIGKILL');
                                    w.say(to, nick + ': Timeout. (either you are trying to lock me up, or this is a bug)');
                                    log.warn('User ' + users[0].name + ' (' + raw.user + '@' + raw.host + ') caused a timeout!');
                                    c.acted = true;
                                }
                            }, 2000);
                        }
                        if (m.run) {
                            try {
                                vm.runInNewContext(m.run, {
                                    w: w
                                });
                                c.acted = true;
                            } catch (e) {
                                log.warn('User ' + users[0].name + ' (' + raw.user + '@' + raw.host + ') caused: ' + e);
                                w.say(to, nick + ': \x02ಠ_ಠ\x02 (you broke it, or some plugin is doing something nasty)');
                                c.acted = true;
                            }
                        }
                        if (m.reply) {
                            w.say(to, nick + ': ' + m.reply);
                            c.acted = true;
                        }
                    });
                    c.on('exit', function() {
                        c.done = true;
                        if (!c.acted) {
                            log.debug('Nothing happened.');
                            w.say(to, nick + ': but nothing happened! (nothing was returned, or process was killed)');
                        }
                    });
                }
            });
        }
    });
});