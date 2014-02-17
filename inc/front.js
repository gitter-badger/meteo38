// Generated by CoffeeScript 1.7.1
(function() {
  var $btn_stlist, REFRESH_INTERVAL, TRENDS_INTERVAL, favs_add, favs_remove, format_t, lib, load_stlist, refresh_data, save_favs, star_click,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  lib = window.util;

  $btn_stlist = $("#btn_stlist");

  REFRESH_INTERVAL = 4 * 60 * 1000;

  TRENDS_INTERVAL = 60 * 60 * 1000;

  format_t = function(last, trends) {
    var acls, cls, sign, t, tr, tts, _ref;
    if (last.t == null) {
      return "";
    }
    t = Math.round(last.t);
    _ref = t > 0 ? ["pos", "+"] : t < 0 ? ["neg", "-"] : ["zer", ""], cls = _ref[0], sign = _ref[1];
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
  };

  refresh_data = function(delay) {
    if (window.refresh_tout) {
      clearTimeout(window.refresh_tout);
    }
    return window.refresh_tout = setTimeout(function() {
      var st_list;
      $("#btn_refresh").prop("disabled", 1);
      st_list = window.fav_ids;
      return $.getJSON("/st_data", {
        st_list: st_list.join(','),
        ts: lib.now()
      }, function(resp) {
        var d, s, _i, _len;
        if (!resp.ok) {
          alert("Ошибка при обращении к серверу.");
          return;
        }
        for (_i = 0, _len = st_list.length; _i < _len; _i++) {
          s = st_list[_i];
          d = resp.data[s];
          if (d) {
            $("#favst_" + d._id + " .data").html(format_t(d.last, d.trends));
          }
        }
        $("#btn_refresh").children(".hhmm").text(resp.hhmm || "??:??");
        $("#btn_refresh").removeProp("disabled");
        return refresh_data(REFRESH_INTERVAL);
      });
    }, delay);
  };

  save_favs = function(favs) {
    window.util.post("/st_favs", {
      favs: favs
    }, function(data) {});
    return refresh_data(500);
  };

  favs_add = function(st, title, addr) {
    var $item;
    if (__indexOf.call(window.fav_ids, st) < 0) {
      window.fav_ids.push(st);
      $item = $("<div class='item'>").attr("id", "favst_" + st);
      $item.append("<div class='data pull-right'>");
      $item.append($("<div class='text'>").append($("<div class='title'>").text(title)).append($("<div class='addr'>").text(addr)));
      $("#fav_items").append($item);
      return save_favs(window.fav_ids);
    }
  };

  favs_remove = function(st) {
    var id;
    $("#favst_" + st).remove();
    window.fav_ids = (function() {
      var _i, _len, _ref, _results;
      _ref = window.fav_ids;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        if (id !== st) {
          _results.push(id);
        }
      }
      return _results;
    })();
    return save_favs(window.fav_ids);
  };

  star_click = function(evt) {
    var $this;
    $this = $(this);
    if ($this.data("fav")) {
      $this.data("fav", 0);
      $this.children(".glyphicon").removeClass("glyphicon-star").addClass("glyphicon-star-empty");
      return favs_remove($this.data("st"));
    } else {
      $this.data("fav", 1);
      $this.children(".glyphicon").removeClass("glyphicon-star-empty").addClass("glyphicon-star");
      return favs_add($this.data("st"), $this.data("title"), $this.data("addr"));
    }
  };

  load_stlist = function() {
    $btn_stlist.prop("disabled", 1);
    return $.getJSON("/st_list", function(data) {
      if (!data.st_list) {
        return alert("Ошибка при загрузке данных!");
      }
      $("#stlist").html("");
      return $.each(data.st_list, function(i, v) {
        var $star, item, _ref;
        item = $("<div class='item'>");
        $star = $("<div class='star'>").click(star_click).data({
          st: v._id,
          title: v.title,
          addr: v.addr || v.descr
        });
        if (_ref = v._id, __indexOf.call(window.fav_ids, _ref) >= 0) {
          $star.data("fav", 1).append("<span class='glyphicon glyphicon-star'></span>");
        } else {
          $star.data("fav", 0).append("<span class='glyphicon glyphicon-star-empty'></span>");
        }
        item.append($star);
        item.append($("<div class='title'>").text(v.title));
        item.append($("<div class='addr'>").text(v.addr || v.descr));
        return $("#stlist").append(item);
      });
    }).always(function() {
      return $btn_stlist.removeProp("disabled");
    });
  };

  $("#btn_refresh").click(function() {
    return refresh_data(0);
  });

  $btn_stlist.click(function(evt) {
    var $b;
    $b = $(evt.target);
    if ($b.data("open")) {
      $b.data("open", 0);
      return $("#stlist").html("");
    } else {
      $b.data("open", 1);
      return load_stlist();
    }
  });

  $(function() {
    return refresh_data(REFRESH_INTERVAL);
  });

}).call(this);
