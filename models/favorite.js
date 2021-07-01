var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var dishSchema = new Schema({
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }
})
var FavoriteSchema = new Schema({
    dishes: [dishSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

var Favorites = mongoose.model('Favorite', FavoriteSchema)
module.exports = Favorites;