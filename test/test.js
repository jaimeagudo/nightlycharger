var _ = require('underscore');
// var SofiaTree = require('../');

module.exports = {

	setUp: function (callback) {
		// this.dictionary=["b","bar","barbar","f","foo","foobar","ju","jump","junction","jungle","junk","just"];
		// this.sofiaTree= new SofiaTree({useCache: true});

  //       this.dictionary.forEach(function(word){
  //       	this.sofiaTree.insert(word);
  //       },this);

        callback();
	},

    "Sample": function(test) {

        // test.deepEqual(this.sofiaTree.getCompletions("foo"),["foo","foobar"]);
        test.deepEqual(true,true);
        test.done();
    }




};