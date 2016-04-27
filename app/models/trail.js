var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TrailSchema = new Schema({
	type: {type: String},
	properties: {
		name: {type: String},
		id: {type: Number},
		difficulty: {type: String},
		segment: {type: Number}
	},
	geometry: {
		type: {type: String},
		coordinates: {type: Array}
	}
})

module.exports = mongoose.model('Trail', TrailSchema);