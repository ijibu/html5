/**
 * 网络通信相关类
 * 		实现多人同时玩该游戏，就需要好好研究该类。
 */
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
		var _ef = this;
		if (typeof _ef.vars.practice != "undefined") {
			document.title = config.title + " - Practice"
		} else {
			document.title = config.title + " - " + (_ef.id == _ef.turn ? "[": "") + _ef.get_name(0) + (_ef.id == _ef.turn ? "]": "") + " vs " + (_ef.id != _ef.turn ? "[": "") + _ef.get_name(1) + (_ef.id != _ef.turn ? "]": "")
		}
	},
	this.is_paused = function() {
		var _f0 = this;
		return _f0.pause
	};
	this.get_time = function() {
		var _f1 = new Date();
		var h = _f1.getHours();
		h = (h < 10 ? "0" + h: h);
		var m = _f1.getMinutes();
		m = (m < 10 ? "0" + m: m);
		var s = _f1.getSeconds();
		s = (s < 10 ? "0" + s: s);
		return "[" + h + ":" + m + ":" + s + "]"
	},
	this.dump = function(arr, _f2) {
		var _f3 = "";
		if (!_f2) {
			_f2 = 0
		}
		var _f4 = "";
		if (typeof(arr) == "object") {
			for (var _f5 in arr) {
				var _f6 = arr[_f5];
				if (typeof(_f6) == "object") {
					_f3 += _f4 + "'" + _f5 + "' ...\n";
					_f3 += dump(_f6, _f2 + 1)
				} else {
					_f3 += _f4 + "'" + _f5 + "' => \"" + _f6 + "\",\n"
				}
			}
		} else {
			_f3 = "===>" + arr + "<===(" + typeof(arr) + ")"
		}
		return _f3
	};

	/**
	 * 在页面上显示网络日志信息
	 */
	this.log = function(_f7, _f8) {
		var _f9 = this;
		if (typeof _f8 == "undefined") {
			_f8 = "info"
		}
		$log = $("#console ul.messages");
		$log.children("li").last().removeClass("last");
		$message = $("<li />").text(_f9.get_time() + " " + _f7);
		if (_f8 != "") {
			$message.addClass(_f8)
		}
		$message.addClass("last");
		$log.append($message);
		$("#console ul.messages").scrollTop($("#console ul.messages").attr("scrollHeight"))
	},

	/**
	 * 在页面上弹出游戏信息显示
	 */
	this.popup = function(_fa, _fb, _fc) {
		if (typeof _fc == "undefined") {
			_fc = "game-info"
		}
		if (_fc == "game-info") {
			$("div.game-info").fadeOut(500)
		}
		$popup = $("<div />");
		$popup.addClass(_fc);
		if (_fc == "summary") {
			$popup.addClass("black-box")
		}
		$popup.html(_fa);
		$popup.hide().fadeIn(1000);
		if (typeof _fb != "undefined" && _fb != null) {
			$popup.animate({
				"opacity": 1
			},
			_fb,
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

	/**
	 * 网络通信初始化操作
	 */
	this.init = function() {
		var _fd = this;
		if (typeof _fd.vars.id != "undefined") {
			_fd.id = _fd.vars.id.split("-")[2]
		}
		if (typeof _fd.vars.host == "undefined" && typeof _fd.vars.practice == "undefined") {
			_fd.pause = true;
			_fd.pool.listenEvents(false)
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
		_fd.reset_score();
		_fd.set_name(0, __18("player"), LANG.code);
		if (typeof _fd.vars.practice != "undefined" || _fd.client_id == null) {
			if (typeof _fd.vars.practice != "undefined") {
				_fd.id = true
			}
			_fd.turn = _fd.id;
			_fd.setup_gamemode("snooker");
			_fd.start_timer();
			_fd.shottime = 0;
			_fd.set_active_player(false, true)
		}
		if (typeof _fd.vars.practice == "undefined") {
			_fd.interval = setInterval(function() {
				_fd.receive()
			},
			3500);
			_fd.log("Waiting for opponent...")
		}
		if (config.debug) {
			_fd.setup_gamemode("snooker");
			_fd.start_timer()
		}
	},

	/**
	 * 检查错误
	 */
	this.check_error = function(_fe) {
		var _ff = this;
		if (typeof _fe != "undefined" && typeof _fe.error != "undefined") {
			var _100 = "Error";
			if (_fe.message == "4") {
				_ff.rehost(true)
			}
			if (_fe.message == "1") {
				_100 = "Server timed out.";
				$.ajax({
					url: "dashboard.php",
					cache: false,
					data: {
						"playing": 0
					},
				})
			} else {
				if (_fe.message == "2") {
					_100 = "Server is full."
				} else {
					if (_fe.message == "3") {
						_100 = "Wrong password."
					} else {
						if (_fe.message == "4") {
							if (_ff.client_id != null) {
								var _101 = _ff.get_name(1);
								if (_101 == "") {
									_101 = "Client"
								}
								_100 = _101 + " timed out.";
								$.ajax({
									url: "dashboard.php",
									cache: false,
									data: {
										"playing": 0
									},
								})
							}
						} else {
							if (_fe.message == "5") {
								_100 = "Invalid game key."
							} else {
								_100 = _fe.message
							}
						}
					}
				}
			}
			if (_fe.message != "4") {
				_ff.popup(_100, null, "server-info");
				_ff.log("Error: " + _100, "error")
			}
			return true
		}
		return false
	},

	/**
	 * 断开游戏连接
	 */
	this.disconnect = function(_102) {
		var self = this;
		if (typeof self.vars.id != "undefined") {
			if (typeof _102 == "undefined") {
				_102 = true
			}
			clearInterval(self.interval);
			if (_102) {
				self.send({
					"event": "disconnect"
				})
			}
		}
	},

	/**
	 * 再次封装了ajax方法
	 * 
	 * @parm query	查询参数
	 * @parm query	查询参数
	 * @parm callBack	回调函数
	 */
	this.ajax = function(query, _104, _105) {
		var self = this;
		if (typeof self.vars.practice == "undefined" || query == "host" || query == "join") {
			$.ajax({
				url: config.masterserver,
				cache: false,
				data: $.extend({
					"query": query
				},
				_104),
				success: function(data) {
					if (typeof data == "undefined") {
						network.log("No server response.", "error")
					}
					if (!network.check_error(data)) {
						if (typeof callBack != "undefined") {
							callBack(data)
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

	/**
	 * get方法
	 */
	this.get = function(_106, _107, _108) {
		var self = this;
		$.get(config.masterserver, $.extend({
			"query": _106
		},
		_107),
		function(data) {
			if (!self.check_error(data)) {
				if (typeof _108 != "undefined") {
					_108(data)
				}
			}
		})
	},

	/**
	 * 向服务器发送信息
	 *  当我击球时会将我的信息发送到服务器上去
	 */
	this.send = function(_109, _10a) {
		var self = this;
		self.ajax("send", $.extend({
			"id": self.vars.id
		},
		_109), _10a)
	},

	/**
	 * 向服务器接受信息
	 *   接受对手击球等信息。
	 */
	this.receive = function() {
		var self = this;
		if (typeof self.vars.practice == "undefined") {
			if (self.pool.isFrozen() && self.shoot_stack.length > 0) {
				self.state_save();
				var _10b = self.shoot_stack.pop();
				if (_10b.hash != self.gen_hash()) {
					self.log(self.get_name(1) + " has been desynced! (hash)", "error")
				}
				self.pool.listenEvents(false);
				self.pool.shoot({
					x: _10b.x,
					y: _10b.y
				});
				self.pool.listenEvents(true)
			}
			self.ajax("receive", {
				"id": self.vars.id,
				"last_ack": self.last_ack
			},
			function(data) {
				/**
				var data = {
					'status': 1,
					'received': 1,
					'packets': [
						{
							'data': {
								'host_id': 1,
								'shottime': 0,
								'frames': 1,
								'gamemode': 'snooker',
								'client': 0,
								'client_lang': 0,
								'client_id': 1
							},
							'time': 0
						}
					]
				}
				*/
				data = $.parseJSON(data);
				if (typeof data.status == "undefined" || data.status != 1) {
					//alert(data.status);
					self.log("Network status update failed.", "error")
				}
				if (typeof data.received != "undefined" && data.received == 1) {
					self.received_packets++;
					var _10c = 0;
					for (var i = 0; i < data.packets.length; i++) {
						var _10d = data.packets[i].data;
						if (parseInt(data.packets[i].time) > self.last_ack) {
							if (_10d.event == "init") {
								self.pause = true;
								$(".server-info, .game-info, .summary").fadeOut(500);
								self.host_id = _10d.host_id;
								self.last_break_id = self.host_id;
								self.shottime = parseInt(_10d.shottime);
								self.frames = parseInt(_10d.frames);
								self.shot_timer = self.shottime;
								self.setup_gamemode(_10d.gamemode);
								self.set_name(1, _10d.client, _10d.client_lang);
								self.client_id = _10d.client_id;
								self.popup(_10d.client + " joined the game.", 1000, "server-info");
								notify(_10d.client + " joined the game.");
								self.log(_10d.client + " joined the game.");
								self.start_timer();
								self.set_frames(self.frames);
								self.calculate_remaining_points();
								self.reset_game(true);
								self.pause = false
							} else {
								if (_10d.event == "shoot") {
									if (!self.own_turn()) {
										if (typeof _10d.x == "string") {
											_10d.x = parseFloat(_10d.x);
											_10d.y = parseFloat(_10d.y)
										}
										if (self.pool.isFrozen() && self.shoot_stack.length == 0) {
											self.state_save();
											if (_10d.hash != self.gen_hash()) {
												self.log(self.get_name(1) + " has been desynced! (hash)", "error")
											}
											self.pool.listenEvents(false);
											self.pool.shoot({
												x: _10d.x,
												y: _10d.y
											});
											self.pool.listenEvents(true);
											_10c++
										} else {
											self.shoot_stack.push({
												x: _10d.x,
												y: _10d.y,
												hash: _10d.hash
											})
										}
									}
								} else {
									if (_10d.event == "replay") {
										if (!self.own_turn()) {
											self.popup(self.get_name(1) + " decided that you repeat your shot.", 3000);
											self.log(self.get_name(1) + " decided that you repeat your shot.");
											notify(self.get_name(1) + " decided that you repeat your shot.");
											self.state_load()
										}
									} else {
										if (_10d.event == "start") {
											self.popup(self.get_name(1) + " decided to start his turn.", 3000);
											self.log(self.get_name(1) + " decided to start his turn.");
											notify(self.get_name(1) + " decided to start his turn.")
										} else {
											if (_10d.event == "rematch") {
												if (self.rematch) {
													self.reset_game()
												} else {
													self.client_rematch = true
												}
											} else {
												if (_10d.event == "timeover") {} else {
													if (_10d.event == "chat") {
														self.sound.play("chat");
														network.log("[" + network.get_name(1) + "]: " + _10d.message, "chat")
													} else {
														if (_10d.event == "disconnect") {
															var _10e = self.get_name(1) + " left the game.";
															self.popup(_10e, null, "server-info");
															self.log(_10e, "error");
															self.client_id = null;
															self.disconnect(false);
															self.rehost()
														} else {
															if (_10d.event == "surrender") {
																self.end_frame(true, 1)
															} else {
																if (_10d.event == "cuepos") {
																	if (typeof _10d.x == "string") {
																		_10d.x = parseFloat(_10d.x);
																		_10d.y = parseFloat(_10d.y)
																	}
																	self.pool.listenEvents(false);
																	self.pool.setCuePos({
																		x: _10d.x,
																		y: _10d.y
																	});
																	network.fix();
																	self.pool.listenEvents(true)
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
							if (typeof _10d.turn != "undefined" && _10d.turn != null) {
								self.turn = _10d.turn;
								self.set_active_player((_10d.event == "init"), (_10d.event == "replay"))
							}
						}
					}
					if (_10c > 1) {
						self.log(self.get_name(1) + " has been desynced! (shoot > 1)", "error")
					}
					if (data.packets.length > 0) {
						self.last_ack = parseInt(data.packets[data.packets.length - 1].time)
					}
				}
			})
		}
	},
	this.reset_score = function() {
		var self = this;
		$("#players .p1 .score").text("0");
		$("#players .p2 .score").text("0");
		self.reset_break()
	},
	this.set_active_player = function(_10f, _110) {
		var self = this;
		if (typeof _110 == "undefined") {
			_110 = false
		}
		var _111 = 0;
		if (self.turn == self.id) {
			_111 = 0
		} else {
			_111 = 1
		}
		if (typeof _10f == "undefined") {
			_10f = false
		}
		self.shot_timer = self.shottime + (self.turn != self.id ? 2 : 0);
		$("#players > div").removeClass("current");
		$("#players > div").eq(_111).addClass("current");
		var _112 = self.get_name(_111) + (_10f ? " to break.": " 's turn.");
		self.set_title();
		if (!_110) {
			self.popup(_112, 1000);
			notify(_112);
			self.log(_112)
		}
	},
	this.start_timer = function() {
		var self = this;
		if (self.frame_timer_handle != null) {
			clearInterval(self.frame_timer_handle)
		}
		self.frame_timer_handle = setInterval(function() {
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
			if (self.pool.isFrozen() && self.shottime > 0 && $("div.frame-summary").length == 0) {
				if (self.shot_timer > 0) {
					self.shot_timer -= 1;
					if (self.shot_timer == 0) {
						self.time_over()
					}
					var time = (network.shot_timer - (self.turn != self.id ? 2 : 0));
					if (time < 0 && self.turn != self.id) {
						time = 0
					}
					m = parseInt(time / 60);
					s = time - (m * 60);
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
		var self = this;
		clearInterval(self.frame_timer_handle)
	},
	this.reset_timer = function() {
		var self = this;
		self.stop_timer();
		self.frame_timer = 0;
		$("#frame-time").text("frame time: 00:00")
	},
	this.set_name = function(_113, name, flag) {
		if (typeof flag == "undefined") {
			var flag = "none"
		}
		$("#players .p" + (_113 + 1) + " .name").text(name);
		$("#players .p" + (_113 + 1) + " > img").remove();
		$("#players .p" + (_113 + 1)).prepend($("<img />").attr("src", "media/images/flags/" + flag + ".gif").addClass("lang"))
	},
	this.get_name = function(_114) {
		return $("#players .p" + (_114 + 1) + " .name").text()
	},
	this.get_break = function() {
		return parseInt($("#current-break").text().split(": ")[1])
	},
	this.reset_break = function() {
		var self = this;
		self.max_turn_break = Math.max(self.max_turn_break, self.get_break());
		$("#current-break").text("break: 0");
		$("#players div.time-left").text("00:00")
	},
	this.add_break = function(_115) {
		var self = this;
		var _116 = self.get_break();
		$("#current-break").text("break: " + (_116 + _115))
	},
	this.set_frames = function(_117) {
		$("#frame-count strong").text(_117)
	},
	this.reset_frames = function() {
		var self = this;
		$("#frame-count").html("0(<strong>" + self.get_frames() + "</strong>)0")
	},
	this.get_frames = function(_118) {
		var self = this;
		if (typeof _118 == "undefined") {
			return self.frames
		} else {
			if (_118 == 0) {
				return parseInt($("#frame-count").text().split("(")[0])
			} else {
				if (_118 == 1) {
					return parseInt($("#frame-count").text().split(")")[1])
				}
			}
		}
	},
	this.add_frame = function(_119) {
		var self = this;
		if (_119 == 0) {
			$("#frame-count").html((self.get_frames(0) + 1) + "(<strong>" + self.get_frames() + "</strong>)" + self.get_frames(1))
		} else {
			if (_119 == 1) {
				$("#frame-count").html(self.get_frames(0) + "(<strong>" + self.get_frames() + "</strong>)" + (self.get_frames(1) + 1))
			}
		}
	},
	this.add_score = function(_11a, _11b, faul) {
		var self = this;
		if (self.turn != self.id) {
			if (_11a == 0) {
				_11a = 1
			} else {
				_11a = 0
			}
		}
		if (typeof self.vars.practice != "undefined" || self.client_id == null) {
			if (_11a == 1) {
				self.reset_break();
				return
			} else {
				if (_11b == 0) {
					self.reset_break()
				}
			}
		}
		if (_11b > 0) {
			if (!faul) {
				self.add_break(_11b)
			}
			if (_11a == 0) {} else {}
			current_score = self.get_score(_11a);
			$("#players .p" + (_11a + 1) + " .score").text(current_score + _11b)
		}
	},
	this.get_score = function(_11c) {
		return parseInt($("#players .p" + (_11c + 1) + " .score").text())
	},
	this.own_turn = function() {
		var self = this;
		if (config.debug) {
			return true
		}
		if (self.pause) {
			return false
		}
		if ((self.turn == self.id || typeof self.vars.practice != "undefined" || self.client_id == null) && self.can_shoot_timeout && $("div.game-info").length == 0 && $("div.frame-summary").length == 0) {
			return true
		}
		return false
	},
	this.end_turn = function() {
		var self = this;
		self.shot_timer = self.shottime + (self.turn != self.id ? 2 : 0)
	},
	this.end_frame = function(_11d, _11e) {
		var self = this;
		if (typeof _11d == "undefined") {
			_11d = false
		}
		var _11f = "";
		var _120 = false;
		var _121 = network.get_score(0);
		var _122 = network.get_score(1);
		if (_121 < _122 || (_11d && _11e == 0)) {
			_11f = "<strong>" + network.get_name(1) + " </strong>wins.";
			network.add_frame(1);
			if (network.get_frames() == 1 || network.get_frames(1) >= parseInt(self.get_frames() / 2) + 1) {
				_120 = true
			}
		} else {
			if (_121 > _122 || (_11d && _11e == 1)) {
				_11f = "<strong>You </strong>win.";
				network.add_frame(0);
				if (network.get_frames() == 1 || network.get_frames(0) >= parseInt(self.get_frames() / 2) + 1) {
					_120 = true
				}
			} else {
				_11f = "It's a <strong>tie</strong>"
			}
		}
		$summary = $("<div class=\"result\">" + (_11d ? (_11e == 0 ? "<strong>You</strong>": "<strong>" + network.get_name(1) + "</strong>") + " surrendered the frame.<br>": "") + (_120 ? "Match": "Frame") + " ended.<br> " + _11f + "</div>" + "<p class=\"what-next\">What would you like to do next?</p>" + "<div class=\"actions\">" + "<ul>" + "<li><button name=\"disconnect\">Disconnect?</button></li>" + "<li><button name=\"rematch\"><strong>" + (_120 ? "Rematch": "Next frame") + "?</strong></button></li>" + "</ul>" + "</div>");
		self.pool.listenEvents(false);
		$summary.find("button[name=disconnect]").click(function() {
			window.location.href = "index.php";
			return false
		});
		$summary.find("button[name=rematch]").click(function() {
			var _123 = network.get_score(0);
			var _124 = network.get_score(1);
			if (typeof network.vars.practice != "undefined" || network.client_id == null) {
				network.reset_game()
			} else {
				network.call_rematch();
				if (!network.client_rematch) {
					network.popup("Waiting for opponent response...");
					self.log("Waiting for opponent response...")
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
		self.popup($summary, null, "summary");
		network.rules.required_ball = "red"
	},
	this.rehost = function(_125) {
		var self = this;
		if (typeof _125 == "undefined") {
			var _125 = false
		}
		if ($(".summary").length == 0) {
			$summary = $("<div class=\"result\"><strong>" + network.get_name(1) + "</strong> " + (_125 ? " timed out": " disconnected") + ".<br>Match ended.</div>" + "<p class=\"what-next\">What would you like to do next?</p>" + "<div class=\"actions\">" + "<ul>" + "<li><button name=\"disconnect\">Disconnect?</button></li>" + "<li><button name=\"join\"><strong>Join game</strong></button></li>" + "<li><button name=\"host\"><strong>Host game</strong></button></li>" + "</ul>" + "</div>");
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
			self.popup($summary, null, "summary")
		}
	},
	this.switch_turn = function(faul, miss) {
		var self = this;
		if (config.debug || typeof self.vars.practice != "undefined" || self.client_id == null) {
			return true
		}
		if (self.turn == self.id) {
			self.turn = self.client_id
		} else {
			self.turn = self.id
		}
		self.set_active_player(false, (faul || miss));
		if (self.turn == self.id) {
			if (!faul && !miss) {} else {
				self.pool.listenEvents(false);
				$choose_turn = $("<div>" + self.get_name(1) + " fouls. You can choose to start your turn or order him to try again." + "<div class=\"actions\">" + "<ul>" + "<li><button name=\"my_turn\">Start your turn?</button></li>" + "<li><button name=\"opponent_replay\">Order to replay?</button></li>" + "</ul>" + "</div></div>");
				notify(self.get_name(1) + " fouls. You can choose to start your turn or order him to try again.");
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
				self.popup($choose_turn)
			}
		} else {
			if (!faul && !miss) {} else {
				self.popup("You foul. Now it's for your opponent do decide if it's his turn or you repeat the same shot.", 3000)
			}
		}
		self.shot_timer = self.shottime + (self.turn != self.id ? 2 : 0);
		self.reset_break()
	},
	this.replay = function() {
		var self = this;
		self.send({
			"event": "replay",
			"turn": self.client_id
		});
		self.switch_turn(false, false)
	},
	this.start = function() {
		var self = this;
		self.send({
			"event": "start"
		})
	},
	this.time_over = function() {
		var self = this;
		if (self.id == self.turn) {
			$(".game-info").fadeOut(500);
			self.add_score(1, 4, true)
		} else {
			self.add_score(0, 4, true)
		}
		self.state_save();
		self.switch_turn(true, false)
	},
	this.call_rematch = function(_126) {
		var self = this;
		self.rematch = true;
		if (self.client_id != null) {
			self.send({
				"event": "rematch"
			})
		}
	},
	this.calculate_remaining_points = function() {
		var self = this;
		var _127 = 0;
		for (var i = 0; i < self.pool.getBallCount(); i++) {
			var ball = self.pool.getBall(i);
			if (ball.type == "white") {
				continue
			}
			if (ball.alive) {
				if (ball.type == "red") {
					_127 += 8
				} else {
					_127 += self.rules.ball_points[ball.type]
				}
			}
		}
		$("dt.points-remaining + dd > span").text(_127)
	},
	this.reset_game = function(init) {
		if (typeof init == "undefined") {
			init = false
		}
		$(".game-info, .frame-summary").remove();
		var self = this;
		var _128 = self.get_score(0);
		var _129 = self.get_score(1);
		var _12a = false;
		if (_128 < _129) {
			if (network.get_frames() == 1 || network.get_frames(1) >= parseInt(self.get_frames() / 2) + 1) {
				_12a = true
			}
		} else {
			if (_128 > _129) {
				if (network.get_frames() == 1 || network.get_frames(0) >= parseInt(self.get_frames() / 2) + 1) {
					_12a = true
				}
			}
		}
		self.pool.listenEvents(false);
		self.rules.first_ball = null;
		self.rules.required_ball = "red";
		self.rules.last_pot = null;
		self.rules.potted_balls = [];
		self.max_turn_break = 0;
		if (!init) {
			if (self.last_break_id == self.id) {
				self.turn = self.client_id
			} else {
				self.turn = self.id
			}
			self.last_break_id = self.turn
		}
		self.reset_score();
		self.base_state_load();
		self.calculate_remaining_points();
		if (!init) {
			self.set_active_player(true)
		}
		self.rematch = false;
		self.client_rematch = false;
		self.reset_timer();
		self.start_timer();
		if (_12a) {
			self.reset_frames()
		}
		self.pool.listenEvents(true)
	},
	this.shoot = function(x, y) {
		var self = this;
		if (self.own_turn()) {
			if (self.client_id != null) {
				self.send({
					"event": "shoot",
					"x": x,
					"y": y,
					"player": self.id,
					"hash": self.gen_hash()
				});
				self.can_shoot_timeout = false;
				setTimeout(function() {
					network.can_shoot_timeout = true
				},
				2100)
			}
		}
	},
	this.fix = function() {
		var self = this;
		for (var i = 0; i < self.pool.getBallCount(); i++) {
			var pos = self.pool.getBall(i).pos;
			self.pool.setBall(i, {
				x: parseInt(pos.x),
				y: parseInt(pos.y)
			})
		}
	},
	this.gen_hash = function() {
		var self = this;
		var hash = "";
		for (var i = 0; i < self.pool.getBallCount(); i++) {
			pos = self.pool.getBall(i).pos;
			hash += hex_md5(hash + pos.x);
			hash += hex_md5(hash + pos.y)
		}
		hash = hex_md5(hash);
		return hash
	},
	this.state_save = function() {
		var self = this;
		self.last_state = [];
		self.pool.listenEvents(false);
		for (var i = 0; i < self.pool.getBallCount(); i++) {
			ball = self.pool.getBall(i);
			self.last_state.push({
				x: ball.pos.x,
				y: ball.pos.y,
				alive: ball.alive
			})
		}
		self.last_required = self.rules.required_ball;
		self.pool.listenEvents(true)
	},
	this.state_load = function() {
		var self = this;
		self.shot_timer = self.shottime + (self.turn != self.id ? 2 : 0);
		self.pool.listenEvents(false);
		for (var i = 0; i < self.pool.getBallCount(); i++) {
			var pos = {
				x: self.last_state[i].x,
				y: self.last_state[i].y
			};
			self.pool.setBall(i, pos);
			self.pool.setAlive(i, self.last_state[i].alive)
		}
		self.rules.required_ball = self.last_required;
		self.pool.isCueSetting = false;
		self.pool.listenEvents(true);
		self.calculate_remaining_points()
	},
	this.base_state_save = function() {
		var self = this;
		self.base_state = [];
		self.pool.listenEvents(false);
		for (var i = 0; i < self.pool.getBallCount(); i++) {
			ball = self.pool.getBall(i);
			self.base_state.push({
				x: ball.pos.x,
				y: ball.pos.y,
				alive: ball.alive
			})
		}
		self.pool.listenEvents(true)
	},
	this.base_state_load = function() {
		var self = this;
		self.pool.listenEvents(false);
		for (var i = 0; i < self.pool.getBallCount(); i++) {
			var pos = {
				x: self.base_state[i].x,
				y: self.base_state[i].y
			};
			self.pool.setBall(i, pos);
			self.pool.setAlive(i, self.base_state[i].alive)
		}
		self.pool.listenEvents(true);
		self.pool.setAlive(0, false);
		self.pool.isCueSetting = true
	},
	this.setup_gamemode = function(mode) {
		var self = this;
		if (typeof mode == "undefined" || mode == "") {
			mode = "snooker"
		}
		self.pool.listenEvents(false);
		self.pool.clearBalls();
		var _12b = 19;
		var _12c = self.pool.getR();
		self.pool.addBall(self.rules.ball_positions["white"], "white");
		self.pool.addBall(self.rules.ball_positions["yellow"], "yellow");
		self.pool.addBall(self.rules.ball_positions["brown"], "brown");
		self.pool.addBall(self.rules.ball_positions["green"], "green");
		self.pool.addBall(self.rules.ball_positions["blue"], "blue");
		self.pool.addBall(self.rules.ball_positions["pink"], "pink");
		self.pool.addBall(self.rules.ball_positions["black"], "black");
		self.pool.addBall({
			x: 716,
			y: 281
		},
		"red");
		self.pool.addBall({
			x: 716 + _12b * 1,
			y: 281 - _12c
		},
		"red");
		self.pool.addBall({
			x: 716 + _12b * 1,
			y: 281 + _12c
		},
		"red");
		if (mode == "snooker" || mode == "short-snooker") {
			self.pool.addBall({
				x: 716 + _12b * 2,
				y: 281 - _12c * 2
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 2,
				y: 281
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 2,
				y: 281 + _12c * 2
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 3,
				y: 281 - _12c * 1
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 3,
				y: 281 - _12c * 3
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 3,
				y: 281 + _12c * 1
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 3,
				y: 281 + _12c * 3
			},
			"red")
		}
		if (mode == "snooker") {
			self.pool.addBall({
				x: 716 + _12b * 4,
				y: 281 - _12c * 4
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 4,
				y: 281 - _12c * 2
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 4,
				y: 281
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 4,
				y: 281 + _12c * 2
			},
			"red");
			self.pool.addBall({
				x: 716 + _12b * 4,
				y: 281 + _12c * 4
			},
			"red")
		}
		self.pool.setAlive(0, false);
		self.pool.isCueSetting = true;
		self.base_state_save();
		self.pool.listenEvents(true)
	},
	this.register_command = function(_12d) {
		var self = this;
		self.commands.push(_12d)
	},
	this.console = function(_12e) {
		var self = this;
		if (_12e.substring(0, 1) == "/") {
			self.log(_12e);
			for (var i = 0; i < self.commands.length; i++) {
				var args = _12e.split(" ");
				_12e = args.shift().substring(1);
				if (self.commands[i] == _12e) {
					if (args.length == 0) {
						eval(_12e + "();")
					} else {
						if (args.length == 1) {
							args = args[0]
						}
						eval(_12e + "(args);")
					}
					return true
				}
			}
			self.log("Unknown command: " + _12e.substring(1), "error")
		} else {
			return self.say(_12e)
		}
	},
	this.say = function(_12f) {
		var self = this;
		if (self.can_chat && _12f != "" && typeof self.vars.id != "undefined") {
			self.log("[" + self.get_name(0) + "]: " + _12f, "chat");
			if (self.client_id != null) {
				network.send({
					"event": "chat",
					"message": _12f
				})
			}
			self.can_chat = false;
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
			var _130 = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
			for (var i = 0; i < _130.length; i++) {
				hash = _130[i].split("=");
				this.vars.push(hash[0]);
				this.vars[hash[0]] = hash[1]
			}
		}
		self.log("Loading websnooker...")
	}
};