describe("Snooker Cue", function () {
    describe("when creating", function () {
        var cue1, cue2;

        beforeEach(function () {
            cue1 = new snooker.Cue();
            cue2 = new snooker.Cue();
        });

        it("should create new object instance", function () {
            expect(cue1 === cue2).toBeFalsy();
        });

        it("should create the same Cue models", function () {
            expect(cue1).toEqual(cue2);
        });
    });
});