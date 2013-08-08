(function (global) {
    "use strict";

    var snooker = (global.snooker = global.snooker || {});

    /**
     * @constructor
     */
    snooker.Cue = function () {
        this.ctx = null;
    };
    
    snooker.Cue.WIDTH = 514;
    snooker.Cue.HEIGHT = 4;

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} position
     * @param {Object} position.x
     * @param {Object} position.y
     * @param {number} [angle] TODO: make rotation
     * @returns {Cue}
     */
    snooker.Cue.prototype.create = function (ctx, position, angle) {
        this.ctx = ctx;

        this.ctx.save();

        var x = position.x || 100;
        var y = position.y || 50;

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(x, y, 150, snooker.Cue.HEIGHT);
        this.ctx.strokeRect(x, y, 150, snooker.Cue.HEIGHT);

        this.ctx.fillStyle = "brown";
        this.ctx.fillRect(x + 150, y, 250, snooker.Cue.HEIGHT);
        this.ctx.strokeRect(x + 150, y, 250, snooker.Cue.HEIGHT);

        this.ctx.fillStyle = "black";
        this.ctx.fillRect(x + 400, y, 10, snooker.Cue.HEIGHT);
        this.ctx.strokeRect(x + 400, y, 10, snooker.Cue.HEIGHT);

        this.ctx.fillStyle = "white";
        this.ctx.fillRect(x + 410, y, 4, snooker.Cue.HEIGHT);
        this.ctx.strokeRect(x + 410, y, 4, snooker.Cue.HEIGHT);

        this.ctx.restore();

        return this;
    };

}(this));
