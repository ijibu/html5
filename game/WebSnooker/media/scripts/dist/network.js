function Sound() {
    var _84 = 0;
    var _85 = 0;
    var _86 = new Object();
    var _87 = false;
    this.loadSound = function(_88, _89) {
        _86[_88] = $("<audio><source src=\"" + _89 + ".ogg\" type=\"audio/ogg\"><source src=\"" + _89 + ".wav\" type=\"audio/wave\"></audio>")[0]
    };
    this.play = function(_8a) {
        try {
            var snd = _86[_8a];
            if (__0("sound") != "on") {
                return
            }
            if (!$.browser.opera) {
                snd.pause();
                snd.currentTime = 0;
                snd.play()
            }
        } catch(e) {}
    }
};
var network = new function() {
    this.max_turn_break = 0;
    this.commands = [],
    this.vars = [],
    this.frame_timer_handle = null,
    this.frame_timer = 0,
    this.shot_timer = 0,
    this.received_packets = 0,
    this.sent_packets = 0,
    this.last_ack = 0,
    this.interval = null,
    this.turn = false,
    this.pool = null,
    this.shoot_stack = [],
    this.pause = false,
    this.rules = {
        first_ball: null,
        required_ball: "red",
        last_pot: null,
        potted_balls: [],
        ball_positions: {
            "white": {
                x: 200,
                y: 317
            },
            "yellow": {
                x: 242,
                y: 357
            },
            "brown": {
                x: 242,
                y: 281
            },
            "green": {
                x: 242,
                y: 203
            },
            "blue": {
                x: 519,
                y: 281
            },
            "pink": {
                x: 694,
                y: 281
            },
            "black": {
                x: 870,
                y: 281
            }
        },
        ball_points: {
            "red": 1,
            "yellow": 2,
            "green": 3,
            "brown": 4,
            "blue": 5,
            "pink": 6,
            "black": 7,
            "white": 4
        }
    },
    this.can_shoot_timeout = true,
    this.break_points = 0,
    this.last_required = null,
    this.last_state = [],
    this.base_state = [],
    this.shottime = 60,
    this.frames = 1,
    this.rematch = false,
    this.client_rematch = false,
    this.can_chat = true,
    this.id = null,
    this.client_id = null,
    this.host_id = null,
    this.last_break_id = null,
    this.sound = new Sound();
    this.sound.loadSound("chat", "media/sounds/chat");
    this.set_title = function() {
        var _8b = this;
        if (typeof _8b.vars.practice != "undefined") {
            document.title = config.title + " - Practice"
        } else {
            document.title = config.title + " - " + (_8b.id == _8b.turn ? "[": "") + _8b.get_name(0) + (_8b.id == _8b.turn ? "]": "") + " vs " + (_8b.id != _8b.turn ? "[": "") + _8b.get_name(1) + (_8b.id != _8b.turn ? "]": "")
        }
    },
    this.is_paused = function() {
        var _8c = this;
        return _8c.pause
    };
    this.get_time = function() {
        var _8d = new Date();
        var h = _8d.getHours();
        h = (h < 10 ? "0" + h: h);
        var m = _8d.getMinutes();
        m = (m < 10 ? "0" + m: m);
        var s = _8d.getSeconds();
        s = (s < 10 ? "0" + s: s);
        return "[" + h + ":" + m + ":" + s + "]"
    },
    this.dump = function(arr, _8e) {
        var _8f = "";
        if (!_8e) {
            _8e = 0
        }
        var _90 = "";
        if (typeof(arr) == "object") {
            for (var _91 in arr) {
                var _92 = arr[_91];
                if (typeof(_92) == "object") {
                    _8f += _90 + "'" + _91 + "' ...\n";
                    _8f += dump(_92, _8e + 1)
                } else {
                    _8f += _90 + "'" + _91 + "' => \"" + _92 + "\",\n"
                }
            }
        } else {
            _8f = "===>" + arr + "<===(" + typeof(arr) + ")"
        }
        return _8f
    };
    this.log = function(_93, _94) {
        var _95 = this;
        if (typeof _94 == "undefined") {
            _94 = "info"
        }
        $log = $("#console ul.messages");
        $log.children("li").last().removeClass("last");
        $message = $("<li />").text(_95.get_time() + " " + _93);
        if (_94 != "") {
            $message.addClass(_94)
        }
        $message.addClass("last");
        $log.append($message);
        $("#console ul.messages").scrollTop($("#console ul.messages").attr("scrollHeight"))
    },
    this.popup = function(_96, _97, _98) {
        if (typeof _98 == "undefined") {
            _98 = "game-info"
        }
        if (_98 == "game-info") {
            $("div.game-info").fadeOut(500)
        }
        $popup = $("<div />");
        $popup.addClass(_98);
        if (_98 == "summary") {
            $popup.addClass("black-box")
        }
        $popup.html(_96);
        $popup.hide().fadeIn(1000);
        if (typeof _97 != "undefined" && _97 != null) {
            $popup.animate({
                "opacity": 1
            },
            _97,
            function() {
                $(this).fadeOut(500,
                function() {
                    $(this).remove()
                })
            })
        }
        if ($popup.find("button").length == 0) {
            $popup.click(function() {
                $(this).fadeOut(500,
                function() {
                    $(this).remove()
                })
            })
        }
        $("#dashboard").parents(".wrapper").after($popup)
    },
    this.init = function() {
        var _99 = this;
        if (typeof _99.vars.id != "undefined") {
            _99.id = _99.vars.id.split("-")[2]
        }
        if (typeof _99.vars.host == "undefined" && typeof _99.vars.practice == "undefined") {
            _99.pause = true;
            _99.pool.listenEvents(false)
        }
        $.ajaxSetup({
            error: function(x, e) {
                if (x.status == 0) {
                    network.log("Network connection is off.", "error")
                } else {
                    if (x.status == 404) {
                        network.log("URL not found.", "error")
                    } else {
                        if (x.status == 500) {
                            network.log("Server failed to response.", "error")
                        } else {
                            if (e == "parsererror") {
                                network.log("Parsing JSON failed.", "error")
                            } else {
                                if (e == "timeout") {
                                    network.log("Request timed out.", "error")
                                } else {
                                    network.log(x.responseText, "error")
                                }
                            }
                        }
                    }
                }
            }
        });
        _99.reset_score();
        _99.set_name(0, __0("player"), LANG.code);
        if (typeof _99.vars.practice != "undefined" || _99.client_id == null) {
            if (typeof _99.vars.practice != "undefined") {
                _99.id = true
            }
            _99.turn = _99.id;
            _99.setup_gamemode("snooker");
            _99.start_timer();
            _99.shottime = 0;
            _99.set_active_player(false, true)
        }
        if (typeof _99.vars.practice == "undefined") {
            _99.interval = setInterval(function() {
                _99.receive()
            },
            3500);
            _99.log("Waiting for opponent...")
        }
        if (config.debug) {
            _99.setup_gamemode("snooker");
            _99.start_timer()
        }
    },
    this.check_error = function(_9a) {
        var _9b = this;
        if (typeof _9a != "undefined" && typeof _9a.error != "undefined") {
            var _9c = "Error";
            if (_9a.message == "4") {
                _9b.rehost(true)
            }
            if (_9a.message == "1") {
                _9c = "Server timed out.";
                $.ajax({
                    url: "dashboard.php",
                    cache: false,
                    data: {
                        "playing": 0
                    },
                })
            } else {
                if (_9a.message == "2") {
                    _9c = "Server is full."
                } else {
                    if (_9a.message == "3") {
                        _9c = "Wrong password."
                    } else {
                        if (_9a.message == "4") {
                            if (_9b.client_id != null) {
                                var _9d = _9b.get_name(1);
                                if (_9d == "") {
                                    _9d = "Client"
                                }
                                _9c = _9d + " timed out.";
                                $.ajax({
                                    url: "dashboard.php",
                                    cache: false,
                                    data: {
                                        "playing": 0
                                    },
                                })
                            }
                        } else {
                            if (_9a.message == "5") {
                                _9c = "Invalid game key."
                            } else {
                                _9c = _9a.message
                            }
                        }
                    }
                }
            }
            if (_9a.message != "4") {
                _9b.popup(_9c, null, "server-info");
                _9b.log("Error: " + _9c, "error")
            }
            return true
        }
        return false
    },
    this.disconnect = function(_9e) {
        var _9f = this;
        if (typeof _9f.vars.id != "undefined") {
            if (typeof _9e == "undefined") {
                _9e = true
            }
            clearInterval(_9f.interval);
            if (_9e) {
                _9f.send({
                    "event": "disconnect"
                })
            }
        }
    },
    this.ajax = function(_a0, _a1, _a2) {
        var _a3 = this;
        if (typeof _a3.vars.practice == "undefined" || _a0 == "host" || _a0 == "join") {
            $.ajax({
                url: config.masterserver,
                cache: false,
                data: $.extend({
                    "query": _a0
                },
                _a1),
                success: function(_a4) {
                    if (typeof _a4 == "undefined") {
                        network.log("No server response.", "error")
                    }
                    if (!network.check_error(_a4)) {
                        if (typeof _a2 != "undefined") {
                            _a2(_a4)
                        }
                    }
                },
                error: function(x, e) {
                    if (x.status == 0) {
                        network.log("Network connection is off.", "error")
                    } else {
                        if (x.status == 404) {
                            network.log("URL not found.", "error")
                        } else {
                            if (x.status == 500) {
                                network.log("Server failed to response.", "error")
                            } else {
                                if (e == "parsererror") {
                                    network.log("Parsing JSON failed.", "error")
                                } else {
                                    if (e == "timeout") {
                                        network.log("Request timed out.", "error")
                                    } else {
                                        network.log(x.responseText, "error")
                                    }
                                }
                            }
                        }
                    }
                },
                async: true
            })
        }
    },
    this.get = function(_a5, _a6, _a7) {
        var _a8 = this;
        $.get(config.masterserver, $.extend({
            "query": _a5
        },
        _a6),
        function(_a9) {
            if (!_a8.check_error(_a9)) {
                if (typeof _a7 != "undefined") {
                    _a7(_a9)
                }
            }
        })
    },
    this.send = function(_aa, _ab) {
        var _ac = this;
        _ac.ajax("send", $.extend({
            "id": _ac.vars.id
        },
        _aa), _ab)
    },
    this.receive = function() {
        var _ad = this;
        if (typeof _ad.vars.practice == "undefined") {
            if (_ad.pool.isFrozen() && _ad.shoot_stack.length > 0) {
                _ad.state_save();
                var _ae = _ad.shoot_stack.pop();
                if (_ae.hash != _ad.gen_hash()) {
                    _ad.log(_ad.get_name(1) + " has been desynced! (hash)", "error")
                }
                _ad.pool.listenEvents(false);
                _ad.pool.shoot({
                    x: _ae.x,
                    y: _ae.y
                });
                _ad.pool.listenEvents(true)
            }
            _ad.ajax("receive", {
                "id": _ad.vars.id,
                "last_ack": _ad.last_ack
            },
            function(_af) {
                if (typeof _af.status == "undefined" || _af.status != 1) {
                    _ad.log("Network status update failed.", "error")
                }
                if (typeof _af.received != "undefined" && _af.received == 1) {
                    _ad.received_packets++;
                    var _b0 = 0;
                    for (var i = 0; i < _af.packets.length; i++) {
                        var _b1 = _af.packets[i].data;
                        if (parseInt(_af.packets[i].time) > _ad.last_ack) {
                            if (_b1.event == "init") {
                                _ad.pause = true;
                                $(".server-info, .game-info, .summary").fadeOut(500);
                                _ad.host_id = _b1.host_id;
                                _ad.last_break_id = _ad.host_id;
                                _ad.shottime = parseInt(_b1.shottime);
                                _ad.frames = parseInt(_b1.frames);
                                _ad.shot_timer = _ad.shottime;
                                _ad.setup_gamemode(_b1.gamemode);
                                _ad.set_name(1, _b1.client, _b1.client_lang);
                                _ad.client_id = _b1.client_id;
                                _ad.popup(_b1.client + " joined the game.", 1000, "server-info");
                                notify(_b1.client + " joined the game.");
                                _ad.log(_b1.client + " joined the game.");
                                _ad.start_timer();
                                _ad.set_frames(_ad.frames);
                                _ad.calculate_remaining_points();
                                _ad.reset_game(true);
                                _ad.pause = false
                            } else {
                                if (_b1.event == "shoot") {
                                    if (!_ad.own_turn()) {
                                        if (typeof _b1.x == "string") {
                                            _b1.x = parseFloat(_b1.x);
                                            _b1.y = parseFloat(_b1.y)
                                        }
                                        if (_ad.pool.isFrozen() && _ad.shoot_stack.length == 0) {
                                            _ad.state_save();
                                            if (_b1.hash != _ad.gen_hash()) {
                                                _ad.log(_ad.get_name(1) + " has been desynced! (hash)", "error")
                                            }
                                            _ad.pool.listenEvents(false);
                                            _ad.pool.shoot({
                                                x: _b1.x,
                                                y: _b1.y
                                            });
                                            _ad.pool.listenEvents(true);
                                            _b0++
                                        } else {
                                            _ad.shoot_stack.push({
                                                x: _b1.x,
                                                y: _b1.y,
                                                hash: _b1.hash
                                            })
                                        }
                                    }
                                } else {
                                    if (_b1.event == "replay") {
                                        if (!_ad.own_turn()) {
                                            _ad.popup(_ad.get_name(1) + " decided that you repeat your shot.", 3000);
                                            _ad.log(_ad.get_name(1) + " decided that you repeat your shot.");
                                            notify(_ad.get_name(1) + " decided that you repeat your shot.");
                                            _ad.state_load()
                                        }
                                    } else {
                                        if (_b1.event == "start") {
                                            _ad.popup(_ad.get_name(1) + " decided to start his turn.", 3000);
                                            _ad.log(_ad.get_name(1) + " decided to start his turn.");
                                            notify(_ad.get_name(1) + " decided to start his turn.")
                                        } else {
                                            if (_b1.event == "rematch") {
                                                if (_ad.rematch) {
                                                    _ad.reset_game()
                                                } else {
                                                    _ad.client_rematch = true
                                                }
                                            } else {
                                                if (_b1.event == "timeover") {} else {
                                                    if (_b1.event == "chat") {
                                                        _ad.sound.play("chat");
                                                        network.log("[" + network.get_name(1) + "]: " + _b1.message, "chat")
                                                    } else {
                                                        if (_b1.event == "disconnect") {
                                                            var _b2 = _ad.get_name(1) + " left the game.";
                                                            _ad.popup(_b2, null, "server-info");
                                                            _ad.log(_b2, "error");
                                                            _ad.client_id = null;
                                                            _ad.disconnect(false);
                                                            _ad.rehost()
                                                        } else {
                                                            if (_b1.event == "surrender") {
                                                                _ad.end_frame(true, 1)
                                                            } else {
                                                                if (_b1.event == "cuepos") {
                                                                    if (typeof _b1.x == "string") {
                                                                        _b1.x = parseFloat(_b1.x);
                                                                        _b1.y = parseFloat(_b1.y)
                                                                    }
                                                                    _ad.pool.listenEvents(false);
                                                                    _ad.pool.setCuePos({
                                                                        x: _b1.x,
                                                                        y: _b1.y
                                                                    });
                                                                    network.fix();
                                                                    _ad.pool.listenEvents(true)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (typeof _b1.turn != "undefined" && _b1.turn != null) {
                                _ad.turn = _b1.turn;
                                _ad.set_active_player((_b1.event == "init"), (_b1.event == "replay"))
                            }
                        }
                    }
                    if (_b0 > 1) {
                        _ad.log(_ad.get_name(1) + " has been desynced! (shoot > 1)", "error")
                    }
                    if (_af.packets.length > 0) {
                        _ad.last_ack = parseInt(_af.packets[_af.packets.length - 1].time)
                    }
                }
            })
        }
    },
    this.reset_score = function() {
        var _b3 = this;
        $("#players .p1 .score").text("0");
        $("#players .p2 .score").text("0");
        _b3.reset_break()
    },
    this.set_active_player = function(_b4, _b5) {
        var _b6 = this;
        if (typeof _b5 == "undefined") {
            _b5 = false
        }
        var _b7 = 0;
        if (_b6.turn == _b6.id) {
            _b7 = 0
        } else {
            _b7 = 1
        }
        if (typeof _b4 == "undefined") {
            _b4 = false
        }
        _b6.shot_timer = _b6.shottime + (_b6.turn != _b6.id ? 2 : 0);
        $("#players > div").removeClass("current");
        $("#players > div").eq(_b7).addClass("current");
        var _b8 = _b6.get_name(_b7) + (_b4 ? " to break.": " 's turn.");
        _b6.set_title();
        if (!_b5) {
            _b6.popup(_b8, 1000);
            notify(_b8);
            _b6.log(_b8)
        }
    },
    this.start_timer = function() {
        var _b9 = this;
        if (_b9.frame_timer_handle != null) {
            clearInterval(_b9.frame_timer_handle)
        }
        _b9.frame_timer_handle = setInterval(function() {
            network.frame_timer += 1;
            var m = parseInt(network.frame_timer / 60);
            var s = network.frame_timer - (m * 60);
            if (m < 10) {
                m = "0" + m
            }
            if (s < 10) {
                s = "0" + s
            }
            $("#frame-time").text("frame time: " + m + ":" + s);
            if (_b9.pool.isFrozen() && _b9.shottime > 0 && $("div.frame-summary").length == 0) {
                if (_b9.shot_timer > 0) {
                    _b9.shot_timer -= 1;
                    if (_b9.shot_timer == 0) {
                        _b9.time_over()
                    }
                    var _ba = (network.shot_timer - (_b9.turn != _b9.id ? 2 : 0));
                    if (_ba < 0 && _b9.turn != _b9.id) {
                        _ba = 0
                    }
                    m = parseInt(_ba / 60);
                    s = _ba - (m * 60);
                    if (m < 10) {
                        m = "0" + m
                    }
                    if (s < 10) {
                        s = "0" + s
                    }
                    $("#players > div.current div.time-left").text(m + ":" + s)
                }
            }
        },
        1000)
    },
    this.stop_timer = function() {
        var _bb = this;
        clearInterval(_bb.frame_timer_handle)
    },
    this.reset_timer = function() {
        var _bc = this;
        _bc.stop_timer();
        _bc.frame_timer = 0;
        $("#frame-time").text("frame time: 00:00")
    },
    this.set_name = function(_bd, _be, _bf) {
        if (typeof _bf == "undefined") {
            var _bf = "none"
        }
        $("#players .p" + (_bd + 1) + " .name").text(_be);
        $("#players .p" + (_bd + 1) + " > img").remove();
        $("#players .p" + (_bd + 1)).prepend($("<img />").attr("src", "media/images/flags/" + _bf + ".gif").addClass("lang"))
    },
    this.get_name = function(_c0) {
        return $("#players .p" + (_c0 + 1) + " .name").text()
    },
    this.get_break = function() {
        return parseInt($("#current-break").text().split(": ")[1])
    },
    this.reset_break = function() {
        var _c1 = this;
        _c1.max_turn_break = Math.max(_c1.max_turn_break, _c1.get_break());
        $("#current-break").text("break: 0");
        $("#players div.time-left").text("00:00")
    },
    this.add_break = function(_c2) {
        var _c3 = this;
        var _c4 = _c3.get_break();
        $("#current-break").text("break: " + (_c4 + _c2))
    },
    this.set_frames = function(_c5) {
        $("#frame-count strong").text(_c5)
    },
    this.reset_frames = function() {
        var _c6 = this;
        $("#frame-count").html("0(<strong>" + _c6.get_frames() + "</strong>)0")
    },
    this.get_frames = function(_c7) {
        var _c8 = this;
        if (typeof _c7 == "undefined") {
            return _c8.frames
        } else {
            if (_c7 == 0) {
                return parseInt($("#frame-count").text().split("(")[0])
            } else {
                if (_c7 == 1) {
                    return parseInt($("#frame-count").text().split(")")[1])
                }
            }
        }
    },
    this.add_frame = function(_c9) {
        var _ca = this;
        if (_c9 == 0) {
            $("#frame-count").html((_ca.get_frames(0) + 1) + "(<strong>" + _ca.get_frames() + "</strong>)" + _ca.get_frames(1))
        } else {
            if (_c9 == 1) {
                $("#frame-count").html(_ca.get_frames(0) + "(<strong>" + _ca.get_frames() + "</strong>)" + (_ca.get_frames(1) + 1))
            }
        }
    },
    this.add_score = function(_cb, _cc, _cd) {
        var _ce = this;
        if (_ce.turn != _ce.id) {
            if (_cb == 0) {
                _cb = 1
            } else {
                _cb = 0
            }
        }
        if (typeof _ce.vars.practice != "undefined" || _ce.client_id == null) {
            if (_cb == 1) {
                _ce.reset_break();
                return
            } else {
                if (_cc == 0) {
                    _ce.reset_break()
                }
            }
        }
        if (_cc > 0) {
            if (!_cd) {
                _ce.add_break(_cc)
            }
            if (_cb == 0) {} else {}
            current_score = _ce.get_score(_cb);
            $("#players .p" + (_cb + 1) + " .score").text(current_score + _cc)
        }
    },
    this.get_score = function(_cf) {
        return parseInt($("#players .p" + (_cf + 1) + " .score").text())
    },
    this.own_turn = function() {
        var _d0 = this;
        if (config.debug) {
            return true
        }
        if (_d0.pause) {
            return false
        }
        if ((_d0.turn == _d0.id || typeof _d0.vars.practice != "undefined" || _d0.client_id == null) && _d0.can_shoot_timeout && $("div.game-info").length == 0 && $("div.frame-summary").length == 0) {
            return true
        }
        return false
    },
    this.end_turn = function() {
        var _d1 = this;
        _d1.shot_timer = _d1.shottime + (_d1.turn != _d1.id ? 2 : 0)
    },
    this.end_frame = function(_d2, _d3) {
        var _d4 = this;
        if (typeof _d2 == "undefined") {
            _d2 = false
        }
        var _d5 = "";
        var _d6 = false;
        var _d7 = network.get_score(0);
        var _d8 = network.get_score(1);
        if (_d7 < _d8 || (_d2 && _d3 == 0)) {
            _d5 = "<strong>" + network.get_name(1) + " </strong>wins.";
            network.add_frame(1);
            if (network.get_frames() == 1 || network.get_frames(1) >= parseInt(_d4.get_frames() / 2) + 1) {
                _d6 = true
            }
        } else {
            if (_d7 > _d8 || (_d2 && _d3 == 1)) {
                _d5 = "<strong>You </strong>win.";
                network.add_frame(0);
                if (network.get_frames() == 1 || network.get_frames(0) >= parseInt(_d4.get_frames() / 2) + 1) {
                    _d6 = true
                }
            } else {
                _d5 = "It's a <strong>tie</strong>"
            }
        }
        $summary = $("<div class=\"result\">" + (_d2 ? (_d3 == 0 ? "<strong>You</strong>": "<strong>" + network.get_name(1) + "</strong>") + " surrendered the frame.<br>": "") + (_d6 ? "Match": "Frame") + " ended.<br> " + _d5 + "</div>" + "<p class=\"what-next\">What would you like to do next?</p>" + "<div class=\"actions\">" + "<ul>" + "<li><button name=\"disconnect\">Disconnect?</button></li>" + "<li><button name=\"rematch\"><strong>" + (_d6 ? "Rematch": "Next frame") + "?</strong></button></li>" + "</ul>" + "</div>");
        _d4.pool.listenEvents(false);
        $summary.find("button[name=disconnect]").click(function() {
            window.location.href = "index.php";
            return false
        });
        $summary.find("button[name=rematch]").click(function() {
            var _d9 = network.get_score(0);
            var _da = network.get_score(1);
            if (typeof network.vars.practice != "undefined" || network.client_id == null) {
                network.reset_game()
            } else {
                network.call_rematch();
                if (!network.client_rematch) {
                    network.popup("Waiting for opponent response...");
                    _d4.log("Waiting for opponent response...")
                } else {
                    network.reset_game()
                }
            }
            $(this).parents("div.summary").fadeOut(500,
            function() {
                $(this).remove()
            });
            return false
        });
        _d4.popup($summary, null, "summary");
        network.rules.required_ball = "red"
    },
    this.rehost = function(_db) {
        var _dc = this;
        if (typeof _db == "undefined") {
            var _db = false
        }
        if ($(".summary").length == 0) {
            $summary = $("<div class=\"result\"><strong>" + network.get_name(1) + "</strong> " + (_db ? " timed out": " disconnected") + ".<br>Match ended.</div>" + "<p class=\"what-next\">What would you like to do next?</p>" + "<div class=\"actions\">" + "<ul>" + "<li><button name=\"disconnect\">Disconnect?</button></li>" + "<li><button name=\"join\"><strong>Join game</strong></button></li>" + "<li><button name=\"host\"><strong>Host game</strong></button></li>" + "</ul>" + "</div>");
            $summary.find("button[name=disconnect]").click(function() {
                window.location.href = "index.php";
                return false
            });
            $summary.find("button[name=join]").click(function() {
                $("#dashboard").parents(".wrapper").removeClass("closed");
                $(this).parents("div.summary").fadeOut(500,
                function() {
                    $(this).remove()
                });
                return false
            });
            $summary.find("button[name=host]").click(function() {
                $("#dashboard").parents(".wrapper").removeClass("closed");
                $("#host-server").parent(".wrapper").removeClass("closed");
                $(this).parents("div.summary").fadeOut(500,
                function() {
                    $(this).remove()
                });
                return false
            });
            _dc.popup($summary, null, "summary")
        }
    },
    this.switch_turn = function(_dd, _de) {
        var _df = this;
        if (config.debug || typeof _df.vars.practice != "undefined" || _df.client_id == null) {
            return true
        }
        if (_df.turn == _df.id) {
            _df.turn = _df.client_id
        } else {
            _df.turn = _df.id
        }
        _df.set_active_player(false, (_dd || _de));
        if (_df.turn == _df.id) {
            if (!_dd && !_de) {} else {
                _df.pool.listenEvents(false);
                $choose_turn = $("<div>" + _df.get_name(1) + " fouls. You can choose to start your turn or order him to try again." + "<div class=\"actions\">" + "<ul>" + "<li><button name=\"my_turn\">Start your turn?</button></li>" + "<li><button name=\"opponent_replay\">Order to replay?</button></li>" + "</ul>" + "</div></div>");
                notify(_df.get_name(1) + " fouls. You can choose to start your turn or order him to try again.");
                $choose_turn.find("button[name=my_turn]").click(function() {
                    network.start();
                    network.pool.listenEvents(true);
                    $(this).parents("div.game-info").fadeOut(500,
                    function() {
                        $(this).remove()
                    });
                    return false
                });
                $choose_turn.find("button[name=opponent_replay]").click(function() {
                    if (!$(this).parents("div.game-info").is(":animated")) {
                        network.replay();
                        network.state_load();
                        network.pool.listenEvents(true);
                        $(this).parents("div.game-info").fadeOut(500,
                        function() {
                            $(this).remove()
                        })
                    }
                    return false
                });
                _df.popup($choose_turn)
            }
        } else {
            if (!_dd && !_de) {} else {
                _df.popup("You foul. Now it's for your opponent do decide if it's his turn or you repeat the same shot.", 3000)
            }
        }
        _df.shot_timer = _df.shottime + (_df.turn != _df.id ? 2 : 0);
        _df.reset_break()
    },
    this.replay = function() {
        var _e0 = this;
        _e0.send({
            "event": "replay",
            "turn": _e0.client_id
        });
        _e0.switch_turn(false, false)
    },
    this.start = function() {
        var _e1 = this;
        _e1.send({
            "event": "start"
        })
    },
    this.time_over = function() {
        var _e2 = this;
        if (_e2.id == _e2.turn) {
            $(".game-info").fadeOut(500);
            _e2.add_score(1, 4, true)
        } else {
            _e2.add_score(0, 4, true)
        }
        _e2.state_save();
        _e2.switch_turn(true, false)
    },
    this.call_rematch = function(_e3) {
        var _e4 = this;
        _e4.rematch = true;
        if (_e4.client_id != null) {
            _e4.send({
                "event": "rematch"
            })
        }
    },
    this.calculate_remaining_points = function() {
        var _e5 = this;
        var _e6 = 0;
        for (var i = 0; i < _e5.pool.getBallCount(); i++) {
            var _e7 = _e5.pool.getBall(i);
            if (_e7.type == "white") {
                continue
            }
            if (_e7.alive) {
                if (_e7.type == "red") {
                    _e6 += 8
                } else {
                    _e6 += _e5.rules.ball_points[_e7.type]
                }
            }
        }
        $("dt.points-remaining + dd > span").text(_e6)
    },
    this.reset_game = function(_e8) {
        if (typeof _e8 == "undefined") {
            _e8 = false
        }
        $(".game-info, .frame-summary").remove();
        var _e9 = this;
        var _ea = _e9.get_score(0);
        var _eb = _e9.get_score(1);
        var _ec = false;
        if (_ea < _eb) {
            if (network.get_frames() == 1 || network.get_frames(1) >= parseInt(_e9.get_frames() / 2) + 1) {
                _ec = true
            }
        } else {
            if (_ea > _eb) {
                if (network.get_frames() == 1 || network.get_frames(0) >= parseInt(_e9.get_frames() / 2) + 1) {
                    _ec = true
                }
            }
        }
        _e9.pool.listenEvents(false);
        _e9.rules.first_ball = null;
        _e9.rules.required_ball = "red";
        _e9.rules.last_pot = null;
        _e9.rules.potted_balls = [];
        _e9.max_turn_break = 0;
        if (!_e8) {
            if (_e9.last_break_id == _e9.id) {
                _e9.turn = _e9.client_id
            } else {
                _e9.turn = _e9.id
            }
            _e9.last_break_id = _e9.turn
        }
        _e9.reset_score();
        _e9.base_state_load();
        _e9.calculate_remaining_points();
        if (!_e8) {
            _e9.set_active_player(true)
        }
        _e9.rematch = false;
        _e9.client_rematch = false;
        _e9.reset_timer();
        _e9.start_timer();
        if (_ec) {
            _e9.reset_frames()
        }
        _e9.pool.listenEvents(true)
    },
    this.shoot = function(x, y) {
        var _ed = this;
        if (_ed.own_turn()) {
            if (_ed.client_id != null) {
                _ed.send({
                    "event": "shoot",
                    "x": x,
                    "y": y,
                    "player": _ed.id,
                    "hash": _ed.gen_hash()
                });
                _ed.can_shoot_timeout = false;
                setTimeout(function() {
                    network.can_shoot_timeout = true
                },
                2100)
            }
        }
    },
    this.fix = function() {
        var _ee = this;
        for (var i = 0; i < _ee.pool.getBallCount(); i++) {
            var pos = _ee.pool.getBall(i).pos;
            _ee.pool.setBall(i, {
                x: parseInt(pos.x),
                y: parseInt(pos.y)
            })
        }
    },
    this.gen_hash = function() {
        var _ef = this;
        var _f0 = "";
        for (var i = 0; i < _ef.pool.getBallCount(); i++) {
            pos = _ef.pool.getBall(i).pos;
            _f0 += hex_md5(_f0 + pos.x);
            _f0 += hex_md5(_f0 + pos.y)
        }
        _f0 = hex_md5(_f0);
        return _f0
    },
    this.state_save = function() {
        var _f1 = this;
        _f1.last_state = [];
        _f1.pool.listenEvents(false);
        for (var i = 0; i < _f1.pool.getBallCount(); i++) {
            ball = _f1.pool.getBall(i);
            _f1.last_state.push({
                x: ball.pos.x,
                y: ball.pos.y,
                alive: ball.alive
            })
        }
        _f1.last_required = _f1.rules.required_ball;
        _f1.pool.listenEvents(true)
    },
    this.state_load = function() {
        var _f2 = this;
        _f2.shot_timer = _f2.shottime + (_f2.turn != _f2.id ? 2 : 0);
        _f2.pool.listenEvents(false);
        for (var i = 0; i < _f2.pool.getBallCount(); i++) {
            var pos = {
                x: _f2.last_state[i].x,
                y: _f2.last_state[i].y
            };
            _f2.pool.setBall(i, pos);
            _f2.pool.setAlive(i, _f2.last_state[i].alive)
        }
        _f2.rules.required_ball = _f2.last_required;
        _f2.pool.isCueSetting = false;
        _f2.pool.listenEvents(true);
        _f2.calculate_remaining_points()
    },
    this.base_state_save = function() {
        var _f3 = this;
        _f3.base_state = [];
        _f3.pool.listenEvents(false);
        for (var i = 0; i < _f3.pool.getBallCount(); i++) {
            ball = _f3.pool.getBall(i);
            _f3.base_state.push({
                x: ball.pos.x,
                y: ball.pos.y,
                alive: ball.alive
            })
        }
        _f3.pool.listenEvents(true)
    },
    this.base_state_load = function() {
        var _f4 = this;
        _f4.pool.listenEvents(false);
        for (var i = 0; i < _f4.pool.getBallCount(); i++) {
            var pos = {
                x: _f4.base_state[i].x,
                y: _f4.base_state[i].y
            };
            _f4.pool.setBall(i, pos);
            _f4.pool.setAlive(i, _f4.base_state[i].alive)
        }
        _f4.pool.listenEvents(true);
        _f4.pool.setAlive(0, false);
        _f4.pool.isCueSetting = true
    },
    this.setup_gamemode = function(_f5) {
        var _f6 = this;
        if (typeof _f5 == "undefined" || _f5 == "") {
            _f5 = "snooker"
        }
        _f6.pool.listenEvents(false);
        _f6.pool.clearBalls();
        var _f7 = 19;
        var _f8 = _f6.pool.getR();
        _f6.pool.addBall(_f6.rules.ball_positions["white"], "white");
        _f6.pool.addBall(_f6.rules.ball_positions["yellow"], "yellow");
        _f6.pool.addBall(_f6.rules.ball_positions["brown"], "brown");
        _f6.pool.addBall(_f6.rules.ball_positions["green"], "green");
        _f6.pool.addBall(_f6.rules.ball_positions["blue"], "blue");
        _f6.pool.addBall(_f6.rules.ball_positions["pink"], "pink");
        _f6.pool.addBall(_f6.rules.ball_positions["black"], "black");
        _f6.pool.addBall({
            x: 716,
            y: 281
        },
        "red");
        _f6.pool.addBall({
            x: 716 + _f7 * 1,
            y: 281 - _f8
        },
        "red");
        _f6.pool.addBall({
            x: 716 + _f7 * 1,
            y: 281 + _f8
        },
        "red");
        if (_f5 == "snooker" || _f5 == "short-snooker") {
            _f6.pool.addBall({
                x: 716 + _f7 * 2,
                y: 281 - _f8 * 2
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 2,
                y: 281
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 2,
                y: 281 + _f8 * 2
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 3,
                y: 281 - _f8 * 1
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 3,
                y: 281 - _f8 * 3
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 3,
                y: 281 + _f8 * 1
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 3,
                y: 281 + _f8 * 3
            },
            "red")
        }
        if (_f5 == "snooker") {
            _f6.pool.addBall({
                x: 716 + _f7 * 4,
                y: 281 - _f8 * 4
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 4,
                y: 281 - _f8 * 2
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 4,
                y: 281
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 4,
                y: 281 + _f8 * 2
            },
            "red");
            _f6.pool.addBall({
                x: 716 + _f7 * 4,
                y: 281 + _f8 * 4
            },
            "red")
        }
        _f6.pool.setAlive(0, false);
        _f6.pool.isCueSetting = true;
        _f6.base_state_save();
        _f6.pool.listenEvents(true)
    },
    this.register_command = function(_f9) {
        var _fa = this;
        _fa.commands.push(_f9)
    },
    this.console = function(_fb) {
        var _fc = this;
        if (_fb.substring(0, 1) == "/") {
            _fc.log(_fb);
            for (var i = 0; i < _fc.commands.length; i++) {
                var _fd = _fb.split(" ");
                _fb = _fd.shift().substring(1);
                if (_fc.commands[i] == _fb) {
                    if (_fd.length == 0) {
                        eval(_fb + "();")
                    } else {
                        if (_fd.length == 1) {
                            _fd = _fd[0]
                        }
                        eval(_fb + "(args);")
                    }
                    return true
                }
            }
            _fc.log("Unknown command: " + _fb.substring(1), "error")
        } else {
            return _fc.say(_fb)
        }
    },
    this.say = function(_fe) {
        var _ff = this;
        if (_ff.can_chat && _fe != "" && typeof _ff.vars.id != "undefined") {
            _ff.log("[" + _ff.get_name(0) + "]: " + _fe, "chat");
            if (_ff.client_id != null) {
                network.send({
                    "event": "chat",
                    "message": _fe
                })
            }
            _ff.can_chat = false;
            setTimeout(function() {
                network.can_chat = true
            },
            500);
            return true
        }
        return false
    },
    this.surrender = function() {
        var self = this;
        if (typeof self.vars.id != "undefined") {
            if (self.turn == self.id) {
                if (self.client_id != null) {
                    network.send({
                        "event": "surrender"
                    })
                }
                self.end_frame(true, 0)
            }
        }
    },
    this.prepare = function() {
        var self = this;
        this.vars = [];
        if (window.location.href.indexOf("?") != -1) {
            var _100 = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
            for (var i = 0; i < _100.length; i++) {
                hash = _100[i].split("=");
                this.vars.push(hash[0]);
                this.vars[hash[0]] = hash[1]
            }
        }
        self.log("Loading websnooker...")
    }
};