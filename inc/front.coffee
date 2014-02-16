#
#   meteo38.ru: inc/front
#

lib = window.util

$btn_stlist = $("#btn_stlist")

REFRESH_INTERVAL = 4*60*1000

# duplicated in main.coffe
#
TRENDS_INTERVAL = 60*60*1000
#
format_t = (last, trends) ->
    return "" if not last.t?
    t = Math.round(last.t)
    [cls,sign] = if t > 0 then ["pos","+"] else if t < 0 then ["neg","-"] else ["zer",""]
    t = -t if t < 0 
    
    tr = " &nbsp;"
    if trends?.t
        tts = new Date(trends.ts).getTime()
        if tts > lib.now() - TRENDS_INTERVAL
            tr = "&uarr;" if trends.t.last >= trends.t.avg + 1
            tr = "&darr;" if trends.t.last <= trends.t.avg - 1
        #
    #
    return " <span class='#{cls}'>#{sign}<i>#{t}</i></span>&deg;"+
            "<span class='arr #{cls}'>#{tr}</span>"
#-

refresh_data = (delay=REFRESH_INTERVAL) ->
    clearTimeout(window.refresh_tout) if window.refresh_tout
    window.refresh_tout = setTimeout(
        () ->
            $.getJSON( "/st_data", 
                {st_list:window.fav_ids.join(','),ts:lib.now()}
                (resp) ->
                    if not resp.ok
                        alert "Ошибка при обращении к серверу."
                        return
                    #
                    for d in resp.data
                        $("#favst_#{d._id} .data").html(
                            format_t(d.last, d.trends)                            
                        )
                    refresh_data()
                #-
            )
        #-
        delay
    )
#-

save_favs = (favs) ->
    #? update cookie locally
    window.util.post("/st_favs", {favs:favs}, (data) -> )
    refresh_data(500)
#-

favs_add = (st, title, addr) ->
    if st not in window.fav_ids
        window.fav_ids.push(st)

        # duplicated in main.jade
        $item = $("<div class='item'>").attr("id", "favst_"+st)
        $item.append( "<div class='data pull-right'>" )
        $item.append( $("<div class='text'>")
            .append( $("<div class='title'>").text(title) )
            .append( $("<div class='addr'>").text(addr) )
        )
        $("#fav_items").append($item)
        save_favs(window.fav_ids)
    #
#-

favs_remove = (st) ->
    $("#favst_#{st}").remove()
    window.fav_ids = (id for id in window.fav_ids when id isnt st)
    save_favs(window.fav_ids)
#-

star_click = (evt) ->
    $this = $(this)
    if $this.data("fav")
        $this.data("fav", 0)
        $this.children(".glyphicon")
            .removeClass("glyphicon-star").addClass("glyphicon-star-empty")
        favs_remove($this.data("st"))
    else
        $this.data("fav", 1)
        $this.children(".glyphicon")
            .removeClass("glyphicon-star-empty").addClass("glyphicon-star")
        favs_add($this.data("st"),$this.data("title"),$this.data("addr"))
    #
#-

load_stlist = () ->
    $btn_stlist.prop("disabled", 1)
    $.getJSON("/st_list", (data) ->
        return alert("Ошибка при загрузке данных!") if not data.st_list
        $("#stlist").html("")
        $.each( data.st_list, (i,v) ->
            item = $("<div class='item'>")  #.attr("id",v._id)
            $star = $("<div class='star'>").click(star_click)
                .data({st:v._id, title:v.title, addr:v.addr or v.descr})
            if v._id in window.fav_ids
                $star.data("fav",1).append(
                    "<span class='glyphicon glyphicon-star'></span>")
            else
               $star.data("fav",0).append(
                    "<span class='glyphicon glyphicon-star-empty'></span>")
            #
            item.append( $star )
            item.append( $("<div class='title'>").text(v.title) )
            item.append( $("<div class='addr'>").text(v.addr or v.descr) )
            $("#stlist").append(item)
        )
    ).always () -> $btn_stlist.removeProp("disabled")
#-

$btn_stlist.click(load_stlist)

$(refresh_data)

#.