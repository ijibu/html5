describe("Snooker Game", function() {
    describe("when starting game", function() {
        var table;

        beforeEach(function () {
            spyOn(snooker, "init");

            snooker.init();
        });

        xit("should create table", function () {
            expect(snooker.Table).toHaveBeenCalled();
        });

        xit("should create balls", function () {
            expect(snooker.Ball).toHaveBeenCalled();
        });

        xit("should create cues", function () {
            expect(snooker.Cue).toHaveBeenCalled();
        });

        it("create smaller balls than table", function () {
            expect(snooker.Ball.RADIUS).toBeLessThan(snooker.Table.WIDTH);
            expect(snooker.Ball.RADIUS).toBeLessThan(snooker.Table.HEIGHT);
        });

        it("create smaller cue than table", function () {
            expect(snooker.Cue.WIDTH).toBeLessThan(snooker.Table.WIDTH);
            expect(snooker.Cue.HEIGHT).toBeLessThan(snooker.Table.HEIGHT);
        });
    });
});
