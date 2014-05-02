// Generated by CoffeeScript 1.7.1
(function() {
  var DAYNUM_MAX, HPA_MMHG, ST_LIST_COOKIE, ST_LIST_DEFAULT, TRENDS_INTERVAL, app, body_parser, compress, config, cookie_parser, db, debug, error_handler, exp, express, fetch_data, fetch_sts, get_stlist, info, lib, moment, serve_static, st_list_cleanup, warn, wind_nesw, _ref, _ref1,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  config = require('./lib/config');

  lib = require('./lib');

  db = require('./lib/db');

  TRENDS_INTERVAL = 60 * 60 * 1000;

  moment = require('moment');

  _ref = require('./lib/logger'), debug = _ref.debug, info = _ref.info, warn = _ref.warn;

  _ref1 = require('./app'), st_list_cleanup = _ref1.st_list_cleanup, fetch_sts = _ref1.fetch_sts, get_stlist = _ref1.get_stlist, fetch_data = _ref1.fetch_data;

  exp = require("./app/exp");

  body_parser = require('body-parser');

  compress = require('compression');

  cookie_parser = require('cookie-parser');

  error_handler = require('errorhandler');

  serve_static = require('serve-static');

  express = require('express');

  app = express();

  app.set("views", __dirname);

  app.set("view engine", 'jade');

  app.enable("trust proxy");

  app.use(compress());

  app.use(cookie_parser());

  app.use(body_parser({
    limit: 10 * 1024 * 1024
  }));

  if (config.env === "development") {
    app.use('/inc', serve_static(__dirname + "/inc"));
    app.use(error_handler({
      dumpExceptions: true,
      showStack: true
    }));
    app.locals.pretty = true;
    app.locals.cache = false;
  } else {
    app.use('/inc', serve_static(__dirname + "/inc", {
      maxAge: 1 * 24 * 3600 * 1000
    }));
    app.use(error_handler());
    app.locals.pretty = false;
    app.locals.cache = true;
  }

  ST_LIST_COOKIE = "st_list";

  ST_LIST_DEFAULT = ["irgp", "uiii", "rlux120", "iood", "sokr"];

  HPA_MMHG = 1.3332239;

  wind_nesw = function(b) {
    if (b >= 360 || b < 0) {
      return "";
    }
    return ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"][(Math.floor((b + 22) / 45)) % 8];
  };

  app.get('/', function(req, res) {
    var st_list;
    st_list = st_list_cleanup(req.cookies[ST_LIST_COOKIE]);
    if (!st_list.length) {
      st_list = ST_LIST_DEFAULT;
    }
    return fetch_sts(st_list, function(data) {
      return res.render("app/main", {
        title: "Погода в Иркутске и области",
        st_list: st_list,
        data: data,
        hhmm: lib.hhmm(new Date()),
        format_t: function(last, trends) {
          var acls, cls, sign, t, tr, tts, _ref2;
          if (last.t == null) {
            return "";
          }
          t = Math.round(last.t);
          _ref2 = t > 0 ? ["pos", "+"] : t < 0 ? ["neg", "-"] : ["zer", ""], cls = _ref2[0], sign = _ref2[1];
          if (t < 0) {
            t = -t;
          }
          tr = " &nbsp;";
          acls = "";
          if (trends != null ? trends.t : void 0) {
            tts = new Date(trends.ts).getTime();
            if (tts > lib.now() - TRENDS_INTERVAL) {
              if (trends.t.last >= trends.t.avg + 1) {
                tr = "&uarr;";
                acls = "pos";
              }
              if (trends.t.last <= trends.t.avg - 1) {
                tr = "&darr;";
                acls = "neg";
              }
            }
          }
          return (" <span class='" + cls + "'>" + sign + "<i>" + t + "</i></span>&deg;") + ("<span class='arr " + acls + "'>" + tr + "</span>");
        },
        format_p: function(last) {
          var h, p;
          p = (last.p != null ? Math.round(last.p / HPA_MMHG) + " мм" : void 0) || "";
          h = (last.h != null ? Math.round(last.h) + "%" : void 0) || "";
          if (p && h) {
            return p + ", " + h;
          } else {
            return p + h;
          }
        },
        format_w: function(last) {
          var d, s;
          if ((last.w != null) || (last.g != null)) {
            s = last.w != null ? "" + Math.round(last.w) : "";
            if ((last.g != null) && (Math.round(last.g) > Math.round(last.w))) {
              if (s) {
                s += "-";
              }
              s += Math.round(last.g);
            }
            if (s) {
              s += " м/с";
            }
            if ((last.b != null) && (Math.round(last.w) > 0)) {
              d = wind_nesw(Math.round(last.b));
              if (d) {
                s += ", " + d;
              }
            }
            return s;
          } else {
            return "";
          }
        }
      });
    });
  });

  app.get("/opts", function(req, res) {
    var fav_ids;
    fav_ids = st_list_cleanup(req.cookies[ST_LIST_COOKIE]);
    return get_stlist(function(data) {
      var st, st_f, st_n, _i, _len, _ref2;
      st_f = {};
      st_n = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        st = data[_i];
        if (_ref2 = st._id, __indexOf.call(fav_ids, _ref2) >= 0) {
          st_f[st._id] = st;
        } else {
          st_n.push(st);
        }
      }
      return res.render("app/opts", {
        fav_ids: fav_ids,
        st_f: st_f,
        st_n: st_n
      });
    });
  });

  app.get('/st_list', function(req, res) {
    var st_fav;
    st_fav = st_list_cleanup(req.cookies[ST_LIST_COOKIE]);
    return get_stlist(function(data) {
      return res.json({
        ok: 1,
        st_fav: st_fav,
        st_list: data
      });
    });
  });

  app.post('/st_favs', function(req, res) {
    var favs;
    favs = st_list_cleanup(req.body.favs);
    res.cookie(ST_LIST_COOKIE, favs, {
      expires: new Date("2101-01-01"),
      httponly: false
    });
    return res.json({
      ok: 1,
      fav_num: favs.length
    });
  });

  app.get('/st_data', function(req, res) {
    var st_list;
    st_list = st_list_cleanup((req.query.st_list || "").split(','));
    if (!st_list.length) {
      return res.json({
        err: "badreq"
      });
    }
    return fetch_data(st_list, function(data) {
      return res.json({
        ok: 1,
        data: data,
        hhmm: lib.hhmm(new Date())
      });
    });
  });

  DAYNUM_MAX = 10;

  app.get('/st_graph', function(req, res) {
    var n, st, t0, t1;
    st = lib.str(req.query.st);
    if (!st) {
      return res.json({
        err: "badreq",
        msg: "?d=0,n=3,st=..."
      });
    }
    t1 = moment().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
    t1.add("days", lib.int(req.query.d) + 1);
    n = lib.int(req.query.n);
    if (n > DAYNUM_MAX) {
      n = DAYNUM_MAX;
    }
    if (n < 1) {
      n = 1;
    }
    t0 = moment(t1).subtract("days", n);
    return db.coll_dat().aggregate([
      {
        $match: {
          st: st,
          ts: {
            $gte: t0.toDate(),
            $lt: t1.toDate()
          }
        }
      }, {
        $group: {
          _id: {
            y: {
              $year: "$ts"
            },
            m: {
              $month: "$ts"
            },
            d: {
              $dayOfMonth: "$ts"
            },
            h: {
              $hour: "$ts"
            }
          },
          ts0: {
            $min: "$ts"
          },
          t_m: {
            $min: "$t"
          },
          t_x: {
            $max: "$t"
          },
          t_a: {
            $avg: "$t"
          },
          p_m: {
            $min: "$p"
          },
          p_x: {
            $max: "$p"
          },
          p_a: {
            $avg: "$p"
          },
          h_m: {
            $min: "$h"
          },
          h_x: {
            $max: "$h"
          },
          h_a: {
            $avg: "$h"
          },
          w_m: {
            $min: "$w"
          },
          w_a: {
            $avg: "$w"
          },
          w_x: {
            $max: "$g"
          }
        }
      }, {
        $sort: {
          ts0: 1
        }
      }
    ], function(err, data) {
      var d, v, _i, _j, _len, _len1, _ref2;
      if (err) {
        warn("st_graph:", err);
        return res.json({
          err: "db"
        });
      }
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        d = data[_i];
        delete d._id;
        if (d.w_x === null) {
          delete d.w_x;
        }
        _ref2 = ['t', 'p', 'h', 'w'];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          v = _ref2[_j];
          if (d[v + '_m'] === null) {
            delete d[v + '_m'];
            delete d[v + '_x'];
            delete d[v + '_a'];
          }
        }
      }
      return res.json({
        ok: 1,
        st: st,
        data: data
      });
    });
  });

  app.get("/exp/t.js", exp.t_js);

  app.get("/exp/", function(req, res) {
    return get_stlist(function(data) {
      return res.render("app/exp", {
        title: "Как установить информер на свой сайт",
        st_list: data
      });
    });
  });

  app.get("/exp", function(req, res) {
    return res.redirect("/exp/");
  });

  app.get("/help", function(req, res) {
    return res.render("app/help", {
      title: "Вопросы и ответы"
    });
  });

  app.get('/favicon.ico', serve_static(__dirname + '/inc/img', {
    maxAge: 30 * 24 * 3600 * 1000
  }));

  app.get('/yandex_6f489466c2955c1a.txt', function(req, res) {
    return res.send("ok");
  });

  app.get('/google527c56f2996a48ae.html', function(req, res) {
    return res.send("google-site-verification: google527c56f2996a48ae.html");
  });

  info("Listen - " + config.server.host + ":" + config.server.port);

  app.listen(config.server.port, config.server.host);

  lib.watch_file(__filename);

}).call(this);
