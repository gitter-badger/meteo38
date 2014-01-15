// Generated by CoffeeScript 1.6.3
(function() {
  var NOPIC_URL, config, db, debug, info, lib, warn, x, _ref;

  x = typeof exports !== "undefined" && exports !== null ? exports : this;

  config = require('../lib/config');

  db = require('../lib/db');

  lib = require('../lib');

  _ref = require('../lib/logger'), debug = _ref.debug, info = _ref.info, warn = _ref.warn;

  NOPIC_URL = "/inc/img/no_foto.png";

  x.groups = function(req, res) {
    return db.groups().find({
      type: req.params.type,
      ord: {
        $gte: 0
      }
    }).sort([['ord', 1], ['title', 1]]).toArray(function(err, data) {
      if (err) {
        warn("obj.groups", err);
        return res.json({
          err: "db",
          msg: "Ошибка базы данных!"
        });
      } else {
        return res.json({
          ok: 1,
          groups: data
        });
      }
    });
  };

  x.list = function(req, res) {
    return db.objs().find({
      grp: req.query.grp
    }).sort({
      title: 1
    }).limit(10000).toArray(function(err, data) {
      if (err) {
        warn("obj.list", err);
        return res.json({
          err: "db",
          msg: "Ошибка базы данных!"
        });
      } else {
        return res.json({
          ok: 1,
          objs: data
        });
      }
    });
  };

  x.pic = function(req, res) {
    var pic_id;
    pic_id = db.make_oid(req.query.pic_id);
    if (!pic_id) {
      return res.redirect(NOPIC_URL);
    }
    return db.pics_grid().get(pic_id, function(err, data) {
      if (err) {
        warn("obj/pic:", err);
      }
      if (!data) {
        return res.redirect(NOPIC_URL);
      }
      return res.set({
        "Content-Type": "image/jpeg",
        "Content-Length": data.length
      }).send(data);
    });
  };

}).call(this);