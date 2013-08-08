(function (global) {
    "use strict";

    var _ = global._;
    var snooker = (global.snooker = global.snooker || {});

    /**
     * @param {string} color
     * @constructor
     */
    snooker.Ball = function (color) {
        if (typeof color !== "string") {
            throw new Error("snooker.Ball should creating with *string*, not " + typeof color);
        }

        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = null;

        /**
         * @type {string}
         */
        this.color = color.toLowerCase();

        /**
         * Positions
         * @type {object}
         */
        this.position = {
            x: null,
            y: null
        };
    };

    snooker.Ball.RADIUS = null;

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} pos
     * @param {Object} pos.x
     * @param {Object} pos.y
     * @returns {Ball}
     */
    snooker.Ball.prototype.create = function (ctx, pos) {
        this.ctx = ctx;

        this.position = pos;

        this._addTexture();

        return this;
    };

    /**
     * @private
     */
    snooker.Ball.prototype._addTexture = function () {
        var self = this;
        var img = new Image();
        img.src = "textures/balls/" + this.color + ".png";

        utils.listener.add(img, "load", function () {
            self.ctx.drawImage(img, self.position.x, self.position.y, snooker.Ball.RADIUS * 2, snooker.Ball.RADIUS * 2);
        });
    };

}(this));
