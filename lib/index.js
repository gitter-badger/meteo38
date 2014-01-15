// Generated by CoffeeScript 1.6.3
(function() {
  var Buffer, WATCH_FILE_TIMEOUT, crypto, d02, fs, http, urand_fd, urandom, x;

  x = typeof exports !== "undefined" && exports !== null ? exports : this;

  crypto = require('crypto');

  fs = require('fs');

  http = require('http');

  Buffer = require('buffer').Buffer;

  urand_fd = fs.openSync("/dev/urandom", 'r');

  x.now = function() {
    return new Date().getTime();
  };

  x.urandom = urandom = function(n) {
    var buff;
    buff = new Buffer(n);
    fs.readSync(urand_fd, buff, 0, n, 0);
    return buff;
  };

  x.random_digits = function(n) {
    var a, i, s, _i, _len, _ref;
    if (n == null) {
      n = 6;
    }
    s = "";
    while (s.length < n) {
      a = 0;
      _ref = urandom(4);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        a = a * 256 + i;
      }
      s += a;
    }
    return s.slice(0, n);
  };

  x.sha256 = function(str) {
    return crypto.createHash('sha256').update(str, "utf-8").digest("hex");
  };

  x.int = function(s, def) {
    var i;
    if (def == null) {
      def = 0;
    }
    i = parseInt(s, 10);
    if (isNaN(i)) {
      return def;
    } else {
      return i;
    }
  };

  x.str = function(s) {
    if ((s == null) || (typeof s === "number" && isNaN(s))) {
      return "";
    } else {
      return "" + s;
    }
  };

  x.set_if = function(dict, key, val) {
    if (val != null) {
      return dict[key] = val;
    }
  };

  WATCH_FILE_TIMEOUT = 3000;

  x.watch_file = function(filename, cb) {
    var ts;
    if (cb == null) {
      cb = function() {
        console.log("exiting...");
        return process.exit(99);
      };
    }
    ts = null;
    return setInterval(function() {
      return fs.stat(filename, function(err, stat) {
        if (err) {
          return cb();
        }
        if (ts == null) {
          ts = stat.mtime;
        }
        if (stat.mtime > ts) {
          return cb();
        }
      });
    }, WATCH_FILE_TIMEOUT);
  };

  d02 = function(d) {
    if (d < 10) {
      return "0" + d;
    } else {
      return "" + d;
    }
  };

  x.ddmmyyyy = function(date) {
    if (!date) {
      return "??.??.????";
    }
    return d02(date.getDate()) + "." + d02(date.getMonth() + 1) + "." + date.getFullYear();
  };

  x.hhmm = function(date) {
    if (!date) {
      return "??:??";
    }
    return d02(date.getHours()) + ":" + d02(date.getMinutes());
  };

  x.hhmmss = function(date) {
    if (!date) {
      return "??:??:??";
    }
    return d02(date.getHours()) + ":" + d02(date.getMinutes()) + ":" + d02(date.getSeconds());
  };

  x.ddmmyyyy_hhmm = function(date) {
    return x.ddmmyyyy(date) + " " + x.hhmm(date);
  };

  x.ddmmyyyy_hhmmss = function(date) {
    return x.ddmmyyyy(date) + " " + x.hhmmss(date);
  };

}).call(this);