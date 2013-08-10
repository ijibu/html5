/**
 * 游戏配置对象
 */
var config = {
    title: "Web Snooker",
    masterserver: "server.php",
    debug: false,
    skin_path: "media/skins/",
    skin: "default",
    sound: "on",
    shadows: "on",
    cue: "on",
    hints: "on",
    player: "Guest",
    scoreboard_pos: "bottom",
    background: "default",
    backgrounds: {
        "default": {
            "default": {
                "color": "#855926",
                "image": "media/images/floor/light-yellow.jpg"
            },
            "blue": {
                "color": "#072c80",
                "image": "media/images/floor/blue.jpg"
            },
            "red": {
                "color": "#480000",
                "image": "media/images/floor/red.jpg"
            },
            "darkred": {
                "color": "#090100",
                "image": "media/images/floor/dark-red.jpg"
            },
            "darkred2": {
                "color": "#480000",
                "image": "media/images/floor/dark-red-2.jpg"
            },
            "black": {
                "color": "#050607",
                "image": "media/images/floor/black.jpg"
            },
            "lightyellow": {
                "color": "#855926",
                "image": "media/images/floor/light-yellow.jpg"
            }
        },
        "satan": {
            "default": {
                "color": "#480000",
                "image": "media/images/floor/dark-red-2.jpg"
            },
            "blue": {
                "color": "#072c80",
                "image": "media/images/floor/blue.jpg"
            },
            "red": {
                "color": "#480000",
                "image": "media/images/floor/red.jpg"
            },
            "darkred": {
                "color": "#090100",
                "image": "media/images/floor/dark-red.jpg"
            },
            "darkred2": {
                "color": "#480000",
                "image": "media/images/floor/dark-red-2.jpg"
            },
            "black": {
                "color": "#050607",
                "image": "media/images/floor/black.jpg"
            },
            "lightyellow": {
                "color": "#855926",
                "image": "media/images/floor/light-yellow.jpg"
            }
        }
    },
    scoreboard_style: ($(window).height() <= 666 ? "compact": "extended"),
    server_name: "Snooker room",
    gamemodes: {
        "snooker": "Full Snooker",
        "short-snooker": "Short Snooker",
        "mini-snooker": "Mini Snooker"
    },
    shottime: {
        "0": "Unlimited",
        "300": "5min",
        "180": "3min",
        "60": "1min",
        "45": "45s",
        "30": "30s",
        "15": "15s"
    }
};

/**
 * 渲染部分
 */
Renderer = function() {
    var _21 = 0,
    _22 = 0;
    var ctx = document.getElementById("screen").getContext("2d");
    var _23 = {
        x: $("canvas").attr("width"),
        y: $("canvas").attr("height")
    };
    var _24 = document.getElementById("screen");
    var _25 = {
        a: {
            x: 0,
            y: 0
        },
        b: _23
    };
    this.WIREFRAME = 0;
    this.TEXTURED = 1;
    this.mode = this.TEXTURED;
    var _26 = new Object;
    var _27 = new Object;
    var _28 = $.browser.opera === true;
    this.clip = function(_29, end) {
        _25 = {
            a: _29,
            b: end
        };
        ctx.beginPath();
        ctx.moveTo(_29.x, _29.y);
        ctx.lineTo(end.x, _29.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(_29.x, end.y);
        ctx.lineTo(_29.x, _29.y);
        ctx.closePath();
        ctx.clip()
    };
    this.clear = function(_2a) {
        if (_2a != undefined) {
            ctx.fillStyle = _2a;
            ctx.fillRect(0, 0, _23.x, _23.y)
        } else {
            if (!_28) {
                ctx.clearRect(_25.a.x, _25.a.y, _25.b.x - _25.a.x, _25.b.y - _25.a.y)
            } else {
                _24.width = _24.width
            }
        }
    };
    this.loadTexture = function(_2b, _2c) {
        if (_26[_2b] != undefined) {
            return _26[_2b]
        }
        var img = document.createElement("img");
        img.setAttribute("src", _2c);
        img.setAttribute("alt", _2b);
        _21++;
        $(img).load(function() {
            _22++
        });
        _26[_2b] = img;
        return img
    };
    this.getImageLoadProgress = function() {
        return _22 / _21
    };
    this.ready = function() {
        return this.getImageLoadProgress() == 1
    };
    this.getSize = function() {
        return __3(_23)
    };
    this.getContext = function() {
        return ctx
    };
    this.getTexture = function(_2d) {
        return _26[_2d]
    };
    this.loadFont = function(_2e, _2f, _30, _31, _32) {
        _27[_2e] = _31 + " " + _32 + " " + _30 + "px " + _2f
    };
    this.triangle = function(pA, pB, pC, _33, _34) {
        ctx.strokeStyle = "white";
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.lineTo(pC.x, pC.y);
        ctx.closePath();
        ctx.clip();
        aPA = pA;
        if (_34) {
            aPB = pC;
            aPC = pB
        } else {
            aPB = pB;
            aPC = pC
        }
        if (this.mode != this.WIREFRAME) {
            var tex = _26[_33];
            var sw = aPC.x - aPA.x;
            var sh = aPB.y - aPA.y;
            var _35 = (aPB.x - aPA.x) / tex.width;
            var _36 = (aPC.y - aPA.y) / tex.height;
            var _37 = __0(aPA, aPB);
            var _38 = __1(aPA, aPC);
            ctx.transform(_35, isFinite(_37) ? _37 * _35: sh / tex.width, isFinite(_38) ? _38 * _36: sw / tex.height, _36, aPA.x, aPA.y);
            if (_34) {
                ctx.scale( - 1, -1);
                ctx.translate( - tex.width, -tex.height)
            }
            ctx.drawImage(tex, 0, 0)
        }
        ctx.restore();
        if (this.mode == this.WIREFRAME) {
            ctx.stroke()
        }
    };
    this.setAlpha = function(_39) {
        ctx.globalAlpha = _39
    };
    this.sprite = function(pos, _3a, _3b, _3c) {
        ctx.drawImage(_26[_3c], _3b.x, _3b.y, _3a.x, _3a.y, pos.x, pos.y, _3a.x, _3a.y)
    };
    this.line = function(_3d, end, _3e) {
        ctx.strokeStyle = _3e;
        ctx.beginPath();
        ctx.moveTo(_3d.x, _3d.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        ctx.stroke()
    };
    this.rect = function(_3f, end, _40) {
        ctx.fillStyle = _40;
        ctx.fillRect(_3f.x, _3f.y, end.x, end.y)
    };
    this.frame = function(_41, end, _42) {
        ctx.strokeStyle = _42;
        ctx.strokeRect(_41.x, _41.y, end.x, end.y)
    };
    this.circle = function(_43, _44, _45) {
        ctx.strokeStyle = _45;
        ctx.beginPath();
        ctx.arc(_43.x, _43.y, _44, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.stroke()
    };
    this.renderData = function(pos, _46, _47, _48) {
        ctx.putImageData(_48, 0, 0)
    };
    this.pushMatrix = function() {
        ctx.save()
    };
    this.popMatrix = function() {
        ctx.restore()
    };
    this.translate = function(_49) {
        ctx.translate(_49.x, _49.y)
    };
    this.rotate = function(_4a) {
        ctx.rotate(_4a)
    };
    this.scale = function(_4b) {
        ctx.scale(_4b.x, _4b.y)
    };
    this.textOut = function(_4c, pos, _4d, _4e) {
        ctx.font = _27[_4d];
        ctx.fillStyle = _4e;
        ctx.fillText(_4c, pos.x, pos.y)
    }
};

/**
 * 时间计时器部分
 */
Timer = function(_4f, _50, _51) {
    this.overrun = 2;
    this.ticks = 0;
    var _52 = 1;
    var _53 = _4f;
    var _54 = _50 == undefined ? 1000 / _53: _50;
    var _55 = 0,
    _56 = 0;
    var _57 = new Date().getTime();
    var _58 = _57;
    var _59 = false;
    var _5a = 0;
    var _5b = 0;
    if (_51 == undefined) {
        _51 = 2
    }
    this.run = function() {
        _57 = _58;
        _58 = new Date().getTime();
        _5a = 1000 / (_58 - _57);
        _52 += _53 / _5a;
        var _5c = Math.floor(_52);
        var fr = Math.min(this.overrun, _5c);
        for (; fr--;) {
            this.ticks++;
            this.process()
        }
        var _5d = new Date().getTime();
        this.render();
        _5b = new Date().getTime() - _5d;
        _52 -= _5c;
        _55 = (_56 * _55 + _5a) / (++_56);
        var _5e = this;
        var _5f = new Date().getTime() - _57;
        setTimeout(function() {
            _5e.run()
        },
        Math.max(_51, _54 - _5f))
    };
    this.getFrameRate = function() {
        return _5a
    };
    this.getFrameRenderTime = function() {
        return _5b
    };
    this.getAverageFrameRate = function() {
        return _55
    };
    this.start = function(_60, _61) {
        this.process = _60;
        this.render = _61;
        this.ticks = 0;
        this.resume()
    };
    this.stop = function() {
        window.clearInterval(intervalHandle);
        _59 = true
    };
    this.resume = function() {
        this.run();
        _59 = false
    }
};

/**
 * 台球规则类
 */
function Rules(pool, _143) {
    _143.loadSound("turn", "media/sounds/turn");
    _143.loadSound("applause", "media/sounds/applause");
    var _144 = 20;
    this.eventStart = function() {
        network.pool = pool;
        network.init()
    };
    this.eventShoot = function(_145) {
        network.state_save();
        network.shoot(_145.x, _145.y)
    };
    this.eventHole = function(_146) {
        if (!network.is_paused()) {
            network.rules.potted_balls.push(_146)
        }
    };
    this.eventStopped = function(_147) {};
    this.spawnBall = function(_148) {
        var pos = network.rules.ball_positions[pool.getBall(_148).type];
        if (pool.isPositionOccupied(pos)) {
            types = ["black", "pink", "blue", "brown", "green", "yellow"];
            pos = null;
            for (var i = 0; i < types.length; i++) {
                var _149 = network.rules.ball_positions[types[i]];
                if (!pool.isPositionOccupied(_149)) {
                    pos = _149;
                    break
                }
            }
        }
        if (pos == null) {
            pos = pool.getFreeCushionPos(network.rules.ball_positions[pool.getBall(_148).type], _148)
        }
        if (pos != null) {
            pool.setBall(_148, pos);
            pool.setAlive(_148, true)
        }
    };
    this.eventAllStopped = function() {
        if (!network.is_paused()) {
            network.fix();
            var _14a = 0;
            var faul = false;
            var _14b = false;
            var _14c = 0;
            var _14d = null;
            var _14e = false;
            var miss = false;
            for (var i = 0; i < pool.getBallCount(); i++) {
                var ball = pool.getBall(i);
                if (ball.alive) {
                    network.rules.alive_balls++
                }
            }
            for (var i = 0; i < pool.getBallCount(); i++) {
                var ball = pool.getBall(i);
                if (ball.type == "red" && ball.alive) {
                    _14c++
                }
            }
            for (var i = 0; i < network.rules.potted_balls.length; i++) {
                var ball = pool.getBall(network.rules.potted_balls[i]);
                if (network.rules.required_ball == "red") {
                    if (ball.type == "red" && !faul) {
                        _14a++
                    } else {
                        faul = true;
                        _14b = true
                    }
                } else {
                    if (network.rules.potted_balls.length == 1) {
                        if (network.rules.required_ball == ball.type) {
                            _14a = network.rules.ball_points[ball.type]
                        } else {
                            faul = true;
                            _14b = true
                        }
                    } else {
                        if (network.rules.potted_balls.length > 1) {
                            faul = true;
                            _14b = true
                        }
                    }
                }
                if (ball.type != "red") {
                    if (ball.type == "white") {
                        pool.isCueSetting = true
                    } else {
                        if (_14c > 0) {
                            this.spawnBall(network.rules.potted_balls[i])
                        } else {
                            if (faul || _14b) {
                                this.spawnBall(network.rules.potted_balls[i])
                            }
                            if (network.rules.potted_balls.length == 1 && _14c == 0 && network.rules.last_pot != null && network.rules.last_pot == "red") {
                                this.spawnBall(network.rules.potted_balls[i])
                            }
                        }
                    }
                }
            }
            if (!faul) {
                network.add_score(0, _14a, (faul || _14b || miss))
            }
            if (network.rules.potted_balls.length > 0) {
                network.rules.last_pot = pool.getBall(network.rules.potted_balls[0]).type
            } else {
                network.rules.last_pot = null
            }
            for (var i = 0; i < pool.getBallCount(); i++) {
                var ball = pool.getBall(i);
                if (ball.type != "white" && ball.alive) {
                    if (_14d == null || network.rules.ball_points[ball.type] < network.rules.ball_points[_14d]) {
                        _14d = ball.type
                    }
                }
            }
            if (faul || network.rules.frist_ball == null || pool.getBall(network.rules.first_ball).type != network.rules.required_ball) {
                var _14a = 0;
                if (_14b) {
                    if (network.rules.potted_balls.length > 0) {
                        for (var i = 0; i < network.rules.potted_balls.length; i++) {
                            var ball = pool.getBall(network.rules.potted_balls[i]);
                            if (ball.alive && network.rules.required_ball != ball.type && network.rules.ball_points[ball.type] > _14a) {
                                _14a = network.rules.ball_points[ball.type]
                            }
                        }
                        if (network.rules.ball_points[network.rules.required_ball] > _14a) {
                            _14a = network.rules.ball_points[network.rules.required_ball]
                        }
                        if (_14a < network.rules.ball_points["white"]) {
                            _14a = network.rules.ball_points["white"]
                        }
                        network.add_score(1, _14a, (faul || _14b || miss));
                        _14e = true;
                        faul = true
                    }
                } else {
                    if (network.rules.first_ball == null) {
                        miss = true;
                        network.add_score(1, network.rules.ball_points["white"], (faul || _14b || miss));
                        _14e = true;
                        faul = true
                    } else {
                        if (pool.getBall(network.rules.first_ball).type != network.rules.required_ball) {
                            miss = true;
                            var ball = pool.getBall(network.rules.first_ball);
                            if (network.rules.ball_points[ball.type] < network.rules.ball_points["white"]) {
                                _14a = network.rules.ball_points["white"]
                            } else {
                                _14a = network.rules.ball_points[ball.type]
                            }
                            network.add_score(1, _14a, (faul || _14b || miss));
                            faul = true
                        }
                        if (network.rules.potted_balls.length == 0 && !_14e) {
                            _14e = true
                        }
                    }
                }
            }
            if (network.rules.required_ball == "red") {
                network.rules.required_ball = "color";
                if ((faul || _14e || network.rules.potted_balls.length == 0) && _14c > 0) {
                    network.rules.required_ball = "red"
                }
            } else {
                if (_14c > 0 && (faul || network.rules.potted_balls.length == 0)) {
                    network.rules.required_ball = "red"
                } else {
                    network.rules.required_ball = _14d
                }
            }
            if (!faul && !_14b && network.rules.alive_balls == 1) {
                _143.play("applause");
                network.end_frame()
            } else {
                if (_14e) {
                    network.switch_turn(faul || _14b, miss);
                    var _14f = network.max_turn_break > _144 && !faul && !_14b;
                    if (_14f) {
                        _143.play("applause")
                    }
                    if (network.turn == network.id) {
                        if (!_14f) {
                            _143.play("turn")
                        }
                    }
                } else {
                    network.end_turn()
                }
            }
            network.max_turn_break = 0;
            network.calculate_remaining_points();
            if (network.rules.required_ball != null) {}
            network.rules.first_ball = null;
            network.rules.faul = false;
            network.rules.pot_faul = false;
            network.rules.potted_balls = [];
            network.rules.alive_balls = 0;
            pool.listenEvents(false);
            pool.process();
            pool.listenEvents(true)
        }
    };
    this.isBallLegal = function(b) {
        var type = network.rules.required_ball;
        if (typeof b != "undefined" && type == "color" && b.type != "red" || b.type == type) {
            return true
        } else {
            return false
        }
    };
    this.eventCollide = function(_150, _151) {
        if (!network.is_paused()) {
            var a = pool.getBall(_150);
            var b = pool.getBall(_151);
            if (typeof a != "undefined" && typeof b != "undefined") {
                if (network.rules.first_ball == null) {
                    if (a.type == "white" || b.type == "white") {
                        if (a.type == "white") {
                            network.rules.first_ball = _151;
                            if (network.rules.required_ball == "color" && b.type != "red") {
                                network.rules.required_ball = b.type
                            }
                        } else {
                            network.rules.first_ball = _150;
                            if (network.rules.required_ball == "color" && a.type != "red") {
                                network.rules.required_ball = a.type
                            }
                        }
                    }
                }
            }
        }
    };
    this.eventBand = function(_152) {};
    this.turn = function() {
        return network.own_turn()
    };
    this.eventSetCuePos = function(pos) {
        network.state_save();
        network.send({
            "event": "cuepos",
            "x": pos.x,
            "y": pos.y
        });
        network.fix()
    }
};

/**
 * 球类
 */
function Ball(_153, pos, vel, type) {
    var _154 = 1.2,
    _155 = 0.99985;
    var _156 = -0.0005;
    var _157 = 1;
    var _158 = 0.0003;
    var _159 = {
        x: 0,
        y: 0
    };
    this.oldPos = __3(pos);
    this.pos = pos;
    this.vel = vel;
    this.alive = true;
    this.type = type;
    var _15a = {
        x: 0,
        y: 0
    };
    var _15b = 0;
    var _15c = 60;
    this.diameter = 0;
    this.r = 0;
    this.setR = function(newR) {
        diameter = newR * 2;
        r = newR
    };
    this.shoot = function(_15d) {
        this.vel = __3(_15d);
        if (__10(this.vel) > _154) {
            this.vel = __8(__5(this.vel), _154)
        }
    };
    this.stopped = function() {
        return __10(this.vel) == 0 || !this.alive
    };
    this.process = function() {
        if (!this.alive) {
            return
        }
        if (_15b > 0) {
            var len = __10(this.vel);
            if (len < 0.1) {
                this.vel = {
                    x: 0.1,
                    y: 0
                };
                len = 0.1
            }
            var slow = Math.min(1, Math.max(0, ((2 * _15b - _15c) / _15c) / Math.sqrt(len / 0.1)));
            this.pos = __6(__8(this.pos, 0.9 + 0.0999 * slow), __8(_15a, 0.1 - 0.0999 * slow));
            _15b -= 0.6 - 0.5 * slow;
            if (_15b <= 0) {
                this.alive = false
            }
        } else {
            this.pos = __6(this.pos, this.vel);
            if (__10(this.vel) < 0.01) {
                this.vel.x = this.vel.y = 0
            } else {
                var vLen = __10(this.vel);
                var _15e = Math.pow(vLen / _154, _158);
                this.vel = __8(this.vel, _155 * _15e)
            }
        }
    };
    this.renderShadow = function(_15f) {
        if (!this.alive) {
            return
        }
        var shR = r + 2;
        var _160 = shR * 2;
        _159 = __4(this.pos, _15f);
        var len = __10(_159);
        var _161 = __8(_159, 0.02);
        var _162 = 1 - len / 500;
        if (_162 < 0) {
            return
        }
        _153.pushMatrix();
        _153.translate(__7(this.pos, _161));
        _153.setAlpha(_162);
        _153.sprite({
            x: -shR,
            y: -shR
        },
        {
            x: _160,
            y: _160
        },
        {
            x: 0,
            y: 0
        },
        "shadow");
        _153.popMatrix()
    };
    this.render = function() {
        if (!this.alive) {
            return
        }
        _153.pushMatrix();
        _153.translate(this.pos);
        if (_15b > 0) {
            var _163 = _15b / _15c;
            _153.setAlpha(_163);
            _163 = Math.sqrt(_163);
            _153.scale({
                x: 0.2 * _163 + 0.8,
                y: 0.2 * _163 + 0.8
            })
        }
        _153.rotate(__2(_159) + Math.PI / 4);
        _153.sprite({
            x: -r,
            y: -r
        },
        {
            x: diameter,
            y: diameter
        },
        {
            x: 0,
            y: 0
        },
        type);
        _153.popMatrix()
    };
    this.bandCollide = function(band) {
        if (!this.alive) {
            return false
        }
        if (this.pos.x < band.min.x - r || this.pos.x > band.max.x + r || this.pos.y < band.min.y - r || this.pos.y > band.max.y + r) {
            return false
        }
        var hit = __12(band, this.pos);
        if (hit.dist < r) {
            var side = __14(this.vel, hit.normal);
            var _164 = __8(hit.normal, side > 0 ? side: -side);
            this.pos = __7(this.pos, _164);
            this.vel = __7(this.vel, __8(_164, 2));
            this.vel.x *= 0.9;
            this.vel.y *= 0.9;
            return true
        }
        return false
    };
    this.holeCollide = function(_165, _166, _167) {
        if (!this.alive || _15b != 0) {
            return false
        }
        if (Math.abs(this.pos.x - _165.x) >= _167 || Math.abs(this.pos.y - _165.y) >= _167) {
            return false
        }
        var _168 = __4(_165, this.pos);
        var dist = __10(_168);
        if (dist < _167) {
            var _169 = __5(_168);
            this.vel = __6(this.vel, __8(_169, _156))
        }
        if (dist < _166) {
            _15a = __3(_165);
            _15b = _15c;
            return true
        }
        return false
    };
    this.canCollide = function(pos) {
        if (Math.abs(this.pos.x - pos.x) >= diameter || Math.abs(this.pos.y - pos.y) >= diameter || _15b != 0) {
            return false
        }
        var bVec = __4(this.pos, pos);
        var _16a = __10(bVec);
        if (_16a >= diameter) {
            return false
        }
        return true
    };
    this.collide = function(_16b) {
        if (Math.abs(this.pos.x - _16b.pos.x) >= diameter || Math.abs(this.pos.y - _16b.pos.y) >= diameter || _15b != 0) {
            return 0
        }
        var bVec = __4(this.pos, _16b.pos);
        var _16c = __10(bVec);
        if (_16c >= diameter) {
            return 0
        } else {
            if (_16c == 0) {
                bVec = {
                    x: 0,
                    y: 1
                };
                _16c = 1
            }
        }
        var dir = __5(bVec);
        var vel1 = __5(this.vel);
        var vel2 = __5(_16b.vel);
        var rVel = __8(dir, __14(dir, vel1) * __10(this.vel) - __14(dir, vel2) * __10(_16b.vel));
        var diff = r - _16c / 2;
        if (diff > 0 && __14(dir, rVel) >= 0) {
            this.vel = __7(this.vel, rVel);
            _16b.vel = __6(_16b.vel, rVel);
            this.pos = __7(this.pos, __8(dir, diff));
            _16b.pos = __6(_16b.pos, __8(dir, diff))
        } else {
            return 0
        }
        return diff
    };
    this.set = function(pos, _16d) {
        this.pos = __3(pos);
        _15b = 0;
        this.vel = {
            x: 0,
            y: 0
        }
    }
};

function Pool(_16e, _16f, _170, _171) {
    this.sound = _16f;
    var _172 = new Rules(this, _16f);
    var _173 = true;
    var _174 = false;
    var _175 = true;
    var _176 = true;
    var _177 = [];
    var _178 = 10;
    var _179 = 10;
    var _17a = 0;
    var self = this;
    var _17b = false;
    _16f.loadSound("chat", "media/sounds/chat");
    var _17c = [{
        a: {
            x: 48,
            y: 77
        },
        b: {
            x: 48,
            y: 483
        }
    },
    {
        a: {
            x: 991,
            y: 77
        },
        b: {
            x: 991,
            y: 483
        }
    },
    {
        a: {
            x: 549,
            y: 515
        },
        b: {
            x: 960,
            y: 515
        }
    },
    {
        a: {
            x: 549,
            y: 45
        },
        b: {
            x: 960,
            y: 45
        }
    },
    {
        a: {
            x: 78,
            y: 515
        },
        b: {
            x: 489,
            y: 515
        }
    },
    {
        a: {
            x: 78,
            y: 45
        },
        b: {
            x: 489,
            y: 45
        }
    },
    {
        a: {
            x: 78,
            y: 45
        },
        b: {
            x: 52,
            y: 28
        }
    },
    {
        a: {
            x: 48,
            y: 77
        },
        b: {
            x: 32,
            y: 52
        }
    },
    {
        a: {
            x: 49,
            y: 534
        },
        b: {
            x: 78,
            y: 515
        }
    },
    {
        a: {
            x: 48,
            y: 483
        },
        b: {
            x: 29,
            y: 512
        }
    },
    {
        a: {
            x: 960,
            y: 45
        },
        b: {
            x: 984,
            y: 29
        }
    },
    {
        a: {
            x: 991,
            y: 77
        },
        b: {
            x: 1007,
            y: 52
        }
    },
    {
        a: {
            x: 991,
            y: 483
        },
        b: {
            x: 1007,
            y: 510
        }
    },
    {
        a: {
            x: 960,
            y: 515
        },
        b: {
            x: 984,
            y: 530
        }
    },
    {
        a: {
            x: 489,
            y: 45
        },
        b: {
            x: 505,
            y: 28
        }
    },
    {
        a: {
            x: 549,
            y: 45
        },
        b: {
            x: 533,
            y: 28
        }
    },
    {
        a: {
            x: 489,
            y: 515
        },
        b: {
            x: 505,
            y: 536
        }
    },
    {
        a: {
            x: 549,
            y: 515
        },
        b: {
            x: 533,
            y: 536
        }
    }];
    var _17d = 46,
    _17e = 990;
    var _17f = 16,
    _180 = 17;
    var _181 = {
        a: {
            x: 59,
            y: 58
        },
        b: {
            x: 978,
            y: 503
        }
    };
    var _182 = [{
        x: 43,
        y: 41
    },
    {
        x: 519,
        y: 31
    },
    {
        x: 996,
        y: 41
    },
    {
        x: 43,
        y: 519
    },
    {
        x: 519,
        y: 529
    },
    {
        x: 996,
        y: 519
    }];
    var _183 = {
        x: 162,
        y: 198
    };
    var _184 = _17c.length,
    _185 = _182.length;
    var _186 = 0;
    var _187 = {
        x: 519,
        y: 281
    };
    $.each(_17c,
    function(i, band) {
        band = __13(band)
    });
    _16e.loadTexture("white", config.skin_path + config.skin + "/images/pool-assets/balls/white.png");
    _16e.loadTexture("red", config.skin_path + config.skin + "/images/pool-assets/balls/red.png");
    _16e.loadTexture("pink", config.skin_path + config.skin + "/images/pool-assets/balls/pink.png");
    _16e.loadTexture("yellow", config.skin_path + config.skin + "/images/pool-assets/balls/yellow.png");
    _16e.loadTexture("blue", config.skin_path + config.skin + "/images/pool-assets/balls/blue.png");
    _16e.loadTexture("green", config.skin_path + config.skin + "/images/pool-assets/balls/green.png");
    _16e.loadTexture("brown", config.skin_path + config.skin + "/images/pool-assets/balls/brown.png");
    _16e.loadTexture("black", config.skin_path + config.skin + "/images/pool-assets/balls/black.png");
    _16e.loadTexture("shadow", config.skin_path + config.skin + "/images/ball-shadow.png");
    _16e.loadTexture("legal", config.skin_path + config.skin + "/images/legal.png");
    _16e.loadTexture("dzone", config.skin_path + config.skin + "/images/dzone.png");
    this.getR = function() {
        return _178
    };
    this.canPlaceCue = function(pos) {
        if (__11(pos, {
            x: 241,
            y: 281
        }) > 82 || pos.x > 241) {
            return false
        }
        for (var i = 1; i < _186; i++) {
            if (_177[i].canCollide(pos)) {
                return false
            }
        }
        return true
    };
    this.hintsEnable = function(h) {
        _17b = h
    };
    this.setCuePos = function(pos) {
        if (!this.canPlaceCue(pos) && this.isCueSetting) {
            return
        }
        this.isCueSetting = false;
        _177[0].pos = __3(pos);
        _177[0].alive = true;
        if (_173) {
            _172.eventSetCuePos(pos)
        }
    };
    this.addBall = function(pos, type) {
        var ball = new Ball(_16e, pos, {
            x: 0,
            y: 0
        },
        type);
        ball.setR(_178);
        _177.push(ball);
        _186++
    };
    this.clearBalls = function() {
        _177 = [];
        _186 = 0;
        _175 = true;
        _174 = true
    };
    this.getBallCount = function() {
        return _186
    };
    this.getBall = function(_188) {
        return _177[_188]
    };
    this.isBallLegal = function(_189) {
        return _172.isBallLegal(this.getBall(_189))
    };
    this.turn = function() {
        return _172.turn()
    };
    this.listenEvents = function(_18a) {
        _173 = _18a
    };
    this.shoot = function(_18b) {
        if (_186 == 0) {
            return
        }
        _177[0].shoot(_18b);
        _175 = false;
        if (_173) {
            _172.eventShoot(_18b)
        }
    };
    this.isFrozen = function() {
        return _175
    };
    this.getCuePos = function() {
        if (_177.length == 0) {
            return {
                x: 0,
                y: 0
            }
        }
        return __3(_177[0].pos)
    };
    this.setBall = function(_18c, pos) {
        _177[_18c].set(pos)
    };
    this.setAlive = function(_18d, _18e) {
        _177[_18d].alive = _18e
    };
    this.isPositionOccupied = function(pos) {
        for (var i = _186; i--;) {
            if (_177[i].alive && __10(__4(pos, _177[i].pos)) < 2 * _178) {
                return true
            }
        }
        return false
    };
    var _18f = function(_190, dir) {
        var col = null;
        var _191 = -1;
        for (var i = _186; i--;) {
            if (!_177[i].alive) {
                continue
            }
            var _192 = null;
            if ((_192 = __16(_177[i].pos, _178 + 1, {
                a: {
                    x: _190.x + 10000 * dir,
                    y: _190.y
                },
                b: {
                    x: _190.x,
                    y: _190.y
                }
            })) != null) {
                var _193 = __11(_190, _192.pos);
                if (_193 < _191 || _191 < 0) {
                    if (dir > 0) {
                        if (_192.pos.x > _17e - _178) {
                            continue
                        }
                    } else {
                        if (_192.pos.x < _17d + _178) {
                            continue
                        }
                    }
                    if (self.isPositionOccupied(_192.pos)) {
                        cols.push({
                            c: _192,
                            d: _193,
                            dupa: true
                        });
                        continue
                    }
                    col = _192;
                    _191 = _193
                }
            }
        }
        return col
    };
    this.getFreeCushionPos = function(_194) {
        var cos = null;
        if ((cos = _18f(_194, 1)) != null) {
            return cos.pos
        }
        if ((cos = _18f(_194, -1)) != null) {
            return cos.pos
        }
        return null
    };
    this.process = function() {
        if ((!_17b || !_175) && _17a > 0) {
            _17a--
        }
        if (_17b && _175 && _17a < _179) {
            _17a++
        }
        if (_175) {
            return
        }
        for (var pp = _170; pp--;) {
            for (var i = _186; i--;) {
                if (!_177[i].alive) {
                    continue
                }
                if (_177[i].pos.x < _181.a.x || _177[i].pos.y < _181.a.y || _177[i].pos.x > _181.b.x || _177[i].pos.y > _181.b.y) {
                    for (var j = _185; j--;) {
                        if (_177[i].holeCollide(_182[j], _17f, _180)) {
                            if (_173) {
                                _172.eventHole(i)
                            }
                        }
                    }
                    for (var j = _184; j--;) {
                        if (_177[i].bandCollide(_17c[j])) {
                            if (_173) {
                                _172.eventBand(i)
                            }
                            break
                        }
                    }
                }
                for (var j = i; j--;) {
                    if (!_177[j].alive) {
                        continue
                    }
                    var f = 0;
                    if ((f = _177[i].collide(_177[j])) > 0) {
                        if (_173) {
                            _172.eventCollide(i, j)
                        }
                    }
                }
            }
            var _195 = 0;
            for (var j = _186; j--;) {
                if (!_177[j].alive) {
                    continue
                }
                var _196 = _177[j].stopped();
                _177[j].process();
                if (!_177[j].stopped()) {
                    _195++
                }
                if (!_196 && _177[j].stopped() && _173) {
                    _172.eventStopped(j)
                }
            }
            if (_195 == 0) {
                if (!_175 && _173) {
                    _172.eventAllStopped()
                }
                _175 = true
            }
        }
    };
    this.render = function(_197) {
        if (_197) {
            for (var i = _186; i--;) {
                _177[i].renderShadow(_187)
            }
        }
        for (var i = _186; i--;) {
            _177[i].render()
        }
        if (_17a) {
            _16e.pushMatrix();
            _16e.setAlpha(0.3 * _17a / _179);
            if (!this.isCueSetting) {
                for (var i = _186; i--;) {
                    if (!_177[i].alive) {
                        continue
                    }
                    if (_177[i].type != "white" && _172.isBallLegal(_177[i])) {
                        _16e.sprite({
                            x: _177[i].pos.x - 12,
                            y: _177[i].pos.y - 12
                        },
                        {
                            x: 24,
                            y: 24
                        },
                        {
                            x: 0,
                            y: 0
                        },
                        "legal")
                    }
                }
            } else {
                _16e.sprite(_183, {
                    x: 82,
                    y: 164
                },
                {
                    x: 0,
                    y: 0
                },
                "dzone")
            }
            _16e.popMatrix()
        }
    };
    _172.eventStart()
};

/**
 * 游戏类
 */
function Game(_198, _199, _19a, _19b) {
    var _19c = true;
    var _19d = {
        x: 0,
        y: 0
    };
    var _19e = {
        x: 0,
        y: 0
    };
    var _19f = 15;
    var pool = new Pool(_199, _19a, _19f, _198);
    var _1a0 = false;
    var _1a1 = null;
    var _1a2 = null;
    var _1a3 = 0;
    var _1a4 = null;
    var _1a5 = false;
    var _1a6 = {
        x: 0,
        y: 0
    };
    var _1a7 = 0;
    var _1a8 = {
        x: 0,
        y: 0
    };
    var _1a9 = false;
    var _1aa = 0;
    var _1ab = {
        x: 0,
        y: 0
    };
    var _1ac = __18("shadows") == "on";
    pool.hintsEnable(__18("hints") == "on");
    this.initialize = function() {
        _199.loadTexture("crosshair", config.skin_path + config.skin + "/images/crosshair.png");
        _199.loadTexture("cursor", config.skin_path + config.skin + "/images/cursor.png");
        _199.loadTexture("cursor-blocked", config.skin_path + config.skin + "/images/cursor-blocked.png");
        _199.loadTexture("illegal", config.skin_path + config.skin + "/images/illegal.png");
        _199.loadFont("normal", "sans", 12, "normal", "normal");
        _199.loadFont("fucking huge", "sans", 72, "normal", "bold");
        $cue = $("<img />").attr("id", "cue").attr("src", "media/images/cue/default-1.png");
        $cue.css({
            "position": "absolute",
            "z-index": 150
        });
        $cue.hide();
        $("#pool").after($cue)
    };
    var _1ad = function(pos, _1ae) {
        _199.pushMatrix();
        _199.translate(pos);
        _199.sprite({
            x: -10,
            y: -10
        },
        {
            x: 20,
            y: 20
        },
        {
            x: 0,
            y: 0
        },
        "cursor" + (!_1ae ? "": "-blocked"));
        _199.popMatrix()
    };
    this.renderEnable = function(r) {
        _19c = r
    };
    this.shadowsEnable = function(s) {
        _1ac = s
    };
    this.areShadowsEnabled = function() {
        return shadow
    };
    this.hintsEnable = function(h) {
        pool.hintsEnable(h)
    };
    this.process = function() {
        if (__18("cue") == "on") {
            var $cue = $("#cue");
            var _1af = $("canvas");
            //球禁止被击
            if (pool.isFrozen()) {
                if (!pool.isCueSetting && !_1a5 && pool.turn()) {
                    $cue.show();
                    _1a5 = true
                } else {
                    if (_1a5 && (!pool.turn() || pool.isCueSetting)) {
                        $cue.hide();
                        _1a5 = false
                    }
                }
                if (!_1a9) {
                    _1aa = $("#power-meter").height() / $("#power-bar").height() * 60;
                    _1a6 = _19b.mousePos();
                    _1a7 = _1aa + 11
                }
                _1a8 = pool.getCuePos()
            }
            var _1b0 = $cue.width();
            var _1b1 = $cue.height();
            var _1b2 = {
                x: _1af.position().left,
                y: _1af.position().top
            };
            var _1b3 = -Math.atan2(_1a6.x - _1a8.x + _1b2.x, _1a6.y - _1a8.y + _1b2.y) - (Math.PI / 2);
            var _1b4 = _1b3 / Math.PI * 180;
            var len = __10({
                x: _1b0 / 2,
                y: _1b1 / 2
            }) + _1a7;
            var left = _1a8.x + Math.cos(_1b3) * len;
            var top = _1a8.y + Math.sin(_1b3) * len;
            $cue.css({
                "left": _1b2.x - _1b0 / 2 + left,
                "top": _1b2.y - _1b1 / 2 + top
            });
            if ($cue.data("angle") != _1b4) {
                $cue.css("transform", "rotate(" + _1b4 + "deg)");
                $cue.css("-moz-transform", "rotate(" + _1b4 + "deg)");
                $cue.css("-webkit-transform", "rotate(" + _1b4 + "deg)");
                $cue.css("-o-transform", "rotate(" + _1b4 + "deg)");
                $cue.data("angle", _1b4)
            }
            if (_1a9) {
                _1a7 -= _1aa / (100 - (90 * $("#power-meter").height() / $("#power-bar").height())) * 17
            }
        }
        if (!_199.ready()) {
            return
        }
        _19b.update();
        pool.process();
        if (pool.turn()) {
            if (pool.isCueSetting) {
                if (_19b.isMouseUp(0) && pool.canPlaceCue(_19b.mousePos())) {
                    pool.setCuePos(_19b.mousePos())
                }
            } else {
                if (pool.isFrozen() && !_1a9) {
                    _19d = pool.getCuePos();
                    _19e = _19b.mousePos();
                    var _1b5 = $("#power-meter").height() / $("#power-bar").height();
                    var _1b6 = 1;
                    //能量的速度
                    power_speed = 1;
                    if (_1b5 > 0.5) {
                        _1b6 = _1b5 + 0.3;
                        power_speed = _1b5 * 0.35 + 1
                    }
                    var _1b7 = 0.002 * _1b6 * Math.sin(_198.ticks / 10 * power_speed);
                    _1ab = __5(__4(_19d, _19e));
                    _1ab = __17(_1ab, _1b7);
                    if (_19b.isMouseUp(0)) {
                        var dir = __8(_1ab, _1b5 * 1.2);
                        _1a9 = true;
                        setTimeout(function() {
                            _1a9 = false;
                            //击球操作
                            pool.shoot(dir);
                            _1a7 -= _1aa / (100 - (90 * $("#power-meter").height() / $("#power-bar").height())) * 17
                        },
                        (__18("cue") == "on" ? 100 - (90 * _1b5) : 5));
                        _1a0 = false
                    }
                    _1a1 = null;
                    var _1b8 = 0;
                    var line = __6(_19d, __8(_1ab, 1000));
                    for (var i = 0; i < pool.getBallCount(); i++) {
                        var ball = pool.getBall(i);
                        if (!ball.alive || ball.type == "white") {
                            continue
                        }
                        var _1b9 = {
                            a: _19d,
                            b: __6(_19d, __8(_1ab, 1000))
                        };
                        var _1ba = __16(ball.pos, pool.getR(), _1b9);
                        var _1bb = _1ba == null ? 0 : __11(_1ba.pos, _19d);
                        var _1bc = (_1bb == 0) ? true: __14(__4(_19d, ball.pos), _1ab) < 0;
                        if (_1ba != null && (_1bb < _1b8 || _1b8 == 0) && !_1bc) {
                            _1b8 = _1bb;
                            _1a1 = _1ba.normal;
                            _1a4 = _1ba.pos;
                            _1a2 = ball.pos;
                            _1a3 = i
                        }
                    }
                    if (_19b.isMousePressed(0)) {
                        _1a0 = true
                    }
                }
            }
        }
    };
    this.render = function() {
        var _1bd = {
            a: {
                x: 0,
                y: 0
            },
            b: _199.getSize()
        };
        if (!_19c) {
            return
        }
        _199.clip(_1bd.a, _1bd.b);
        if (!_199.ready()) {
            return
        } else {
            _199.clear()
        }
        pool.render(_1ac);
        if (pool.turn()) {
            if (pool.isCueSetting) {
                var pos = _19b.mousePos();
                if (pos.x < _1bd.a.x + pool.getR()) {
                    pos.x = _1bd.a.x + pool.getR()
                }
                if (pos.x > _1bd.b.x - pool.getR()) {
                    pos.x = _1bd.b.x - pool.getR()
                }
                if (pos.y < _1bd.a.y + pool.getR()) {
                    pos.y = _1bd.a.y + pool.getR()
                }
                if (pos.y > _1bd.b.y - pool.getR()) {
                    pos.y = _1bd.b.y - pool.getR()
                }
                _1ad(pos, !pool.canPlaceCue(_19b.mousePos()));
                _1ad(pos, !pool.canPlaceCue(_19b.mousePos()))
            } else {
                if (pool.isFrozen()) {
                    _199.pushMatrix();
                    _199.translate(_19d);
                    _199.sprite({
                        x: -13,
                        y: -13
                    },
                    {
                        x: 26,
                        y: 26
                    },
                    {
                        x: 0,
                        y: 0
                    },
                    "crosshair");
                    _199.popMatrix();
                    if (_1a1 != null) {
                        _1ad(_1a4);
                        var d = __11(_19d, _1a2);
                        var len = 150 / (d / 150);
                        var _1be = 1;
                        if (len > 150) {
                            len = 150
                        }
                        var vel = __8(_1a1, len * _1be);
                        var _1bf = __15(__5(_1ab), __5(vel));
                        _1bf = Math.sqrt(Math.abs(_1bf)) * (_1bf > 0 ? 1 : (_1bf == 0 ? 0 : -1));
                        _199.line(_1a4, __6(_1a4, {
                            x: vel.y * _1bf,
                            y: -vel.x * _1bf
                        }), "rgba(255, 255, 0, 0.2)");
                        _199.line(_1a4, _1a2, "rgba(255, 255, 0, 0.8)");
                        if (!pool.isBallLegal(_1a3)) {
                            _199.pushMatrix();
                            _199.setAlpha(0.7);
                            _199.translate(_1a2);
                            _199.sprite({
                                x: -10,
                                y: -10
                            },
                            {
                                x: 20,
                                y: 20
                            },
                            {
                                x: 0,
                                y: 0
                            },
                            "illegal");
                            _199.popMatrix()
                        }
                        if (d < 110) {
                            _199.line(_19d, _1a4, "rgba(255, 255, 255, 0.2)")
                        } else {
                            _199.line(_19d, __6(_19d, __8(_1ab, 110)), "rgba(255, 255, 255, 0.2)")
                        }
                    } else {
                        _199.line(_19d, __6(_19d, __8(_1ab, 110)), "rgba(255, 255, 255, 0.2)")
                    }
                }
            }
        }
    }
};