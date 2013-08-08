describe("Snooker Ball", function () {
    describe("when creating", function () {
        var ball1, ball2;

        beforeEach(function () {
            ball1 = new snooker.Ball("");
            ball2 = new snooker.Ball("");
        });

        it("should throws errors when don't set color", function () {
            expect(snooker.Ball).toThrow();
        });

        it("should create new object instance", function () {
            expect(ball1 === ball2).toBeFalsy();
        });

        it("should the same Ball models", function () {
            expect(ball1).toEqual(ball2);
        });
    });
});