var assert = require('assert');
var T = require('../test/topVisitFunc.js');
describe('URL Clean', function() {
    describe('Module T', function() {
        it('should have a barChartData method', function() {
            assert.equal(typeof T, 'object');
	    assert.equal(typeof T.barChartData, 'function');
        });
	it('barChartData(www.domain.com) should return domain.com', function() {
	    assert.equal(T.barChartData('www.domain.com'), 'domain.com');
	});
	it('barChartData(http://www.domain.com) should return domain.com', function() {
	    assert.equal(T.barChartData('http://www.domain.com'), 'domain.com');
	});
	it('barChartData(https://www.domain.com) should return domain.com', function() {
	    assert.equal(T.barChartData('https://www.domain.com'), 'domain.com');
	});
	it('barChartData(www.domainwww.com) should return domainwww.com', function() {
	    assert.equal(T.barChartData('www.domainwww.com'), 'domainwww.com');
	});
    });
});
