// URL we start from, read as parameter --address=
var address = casper.cli.get("address");

// Record screenshots
var screenshot = 0;
casper.on("load.finished", function() {
    screenshot += 1;
    var name = "screenshots/" + screenshot +  ".png";
    this.capture(name);
    // console.log("screenshot: ", name, "url:", casper.getCurrentUrl());
});

// Tests in detail

casper.test.begin('Postcode lookup and constituency cookie', 13, function suite(test) {
    casper.start(address, function(result) {
        test.assertEquals(result.status, 200);
        test.assertTextExists('Before you vote, look at their CVs!');
        test.assertTextExists('Debug email enabled');

        this.fill('form[action="/set_postcode"]', { postcode: "zz99zz" }, true);
    });

    casper.waitForUrl(/candidates$/, function() {
        test.assertTextExists('Democracy Club Test Constituency');
        test.assertTextExists('View CVs of these candidates');
        test.assertTextExists('Sicnarf Gnivri');
        test.assertExists('a[href="/show_cv/7777777"]');
        test.assertTextExists('Ask these candidates to add their CV');
        test.assertTextExists('Notlits Esuom');
        test.assertExists('a[href="/upload_cv/7777778"]');
    });

    // make sure constituency remembered, and front page redirects back to constituency page
    casper.thenOpen(address, function() {
        test.assertTextExists('Democracy Club Test Constituency');
        test.assertTextExists('View CVs of these candidates');

        this.clickLabel("Change constituency");
    });

    // "Change constituency" clears the memory of constituency
    casper.then(function() {
        test.assertTextExists('Before you vote, look at their CVs!');
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin('Candidates list requires postcode', 3, function suite(test) {
    casper.start(address + "candidates", function(result) {
        test.assertEquals(result.status, 200);
        test.assertTextExists('Before you vote, look at their CVs!');
        test.assertTextExists('Debug email enabled');
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin('Bad postcode entered', 5, function suite(test) {
    casper.start(address + "candidates", function(result) {
        test.assertEquals(result.status, 200);
        test.assertTextExists('Before you vote, look at their CVs!');
        test.assertTextExists('Debug email enabled');

        this.fill('form[action="/set_postcode"]', { postcode: "moo" }, true);
    });


    casper.waitForUrl(/\/$/, function() {
        test.assertTextExists('Before you vote, look at their CVs!');
        test.assertTextExists("Postcode 'MOO' is not valid.");
    });

    casper.run(function() {
        test.done();
    });
});


