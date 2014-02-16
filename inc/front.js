// Generated by CoffeeScript 1.7.1
(function() {
  var $btn_stlist, favs_add, favs_remove, load_stlist, save_favs, star_click,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $btn_stlist = $("#btn_stlist");

  save_favs = function(favs) {
    return window.util.post("/st_favs", {
      favs: favs
    }, function(data) {});
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

  $btn_stlist.click(load_stlist);

}).call(this);
