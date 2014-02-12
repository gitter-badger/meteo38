#
#   meteo38.ru: main
#

config = require './lib/config'

lib = require './lib'

# init logging and database
#
{debug, info, warn} = require './lib/logger'

{st_list_cleanup, fetch_sts} = require './app'

# db   = require './lib/db'
# sess = require './lib/sess'
# auth = require './app/auth'
# user = require './app/user'

#multipart = require 'connect-multiparty'
express = require 'express'

app = express()

app.configure ->
    app.set "views", __dirname      # +"/jade"
    app.set "view engine", 'jade'

    app.enable "trust proxy"

    # if node_env is "development"
    #   app.use express.favicon __dirname + '/inc/img/favicon.ico'
    app.use express.favicon()

    app.use express.compress()
    app.use express.cookieParser()
    # app.use sess.middleware()

    # app.use express.urlencoded()
    app.use express.json()

    # app.use auth.middleware()
    app.use app.router

    if config.env is "development"
        app.use '/inc', express.static __dirname+"/inc"
        app.use express.errorHandler {dumpExceptions: true, showStack: true}
        app.locals.pretty = true
        app.locals.cache = false
    else
        app.use '/inc', express.static __dirname+"/inc", {maxAge: 1*24*3600*1000}
        app.use express.errorHandler()
        app.locals.pretty = false
        app.locals.cache = true
    #
#-

ST_LIST_COOKIE = "st_list"
ST_LIST_DEFAULT = ["uiii","poml","olha","olha2"]

#ST_LIST_MAX    = 20

#
#   urls
#

app.get '/', (req, res) ->

    st_list = st_list_cleanup(req.cookies[ST_LIST_COOKIE])
    if not st_list.length
        st_list = ST_LIST_DEFAULT 
        res.cookie ST_LIST_COOKIE, st_list, {expires: new Date("2101-01-01"), httponly: false}
    #
    fetch_sts( st_list, (data) ->
        res.render "app/main", {
            title: "Погода в Иркутске и области"
            sts_data: data
            format_t: (t) ->
                t = Math.round(t)
                [cls,sign] = if t > 0 then ["pos","+"] else if t < 0 then ["neg","-"] else ["zer",""]
                t = -t if t < 0 
                "<span class='#{cls}'>#{sign}<i>#{t}</i></span>&deg;"
                # <span class="arr pos">&uarr;</span>"
        }
    )
#-

app.get '/st_list', (req, res) ->
    # st.find(pub:1) ?location
    #
    # 
    res.json {err:"nimp"}
#-

app.get '/st_data', (req, res) ->
    # req.query.st_list
    # ? req.query.ts
    #
    res.json {err:"nimp"}
#-

app.get '/st_graph', (req, res) ->
    # req.query.st
    # ? req.query.ts
    #
    # graph_data
    res.json {err:"nimp"}
#-


# app.all "/_trace", (req, res) ->
#     t = {ips: req.ips, ua: req.headers['user-agent'] or "?"}
#     if req.sess
#         lib.set_if t, 'sid', req.sess.sid
#         lib.set_if t, 'uid', req.sess.get("user_id")
#         lib.set_if t, 'login', req.sess.get("user_login")
#     #
#     lib.set_if t, 'param', req.body
#     info "trace", t
#     res.send 204, ""
#     t.ts = new Date()
#     db.trace(t)
# #-

info "Listen - "+config.server.host+":"+config.server.port
app.listen config.server.port, config.server.host

lib.watch_file __filename

#.   