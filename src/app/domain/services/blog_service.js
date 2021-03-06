var storage = require('../storage'),
    _ = require('underscore'),
    Post = require('../models/Post');

function Blog(){}

Blog.prototype.lastPost = function(){
    return this.store.posts.findOneAsync({}, {"sort": [
        ["postedOn", "desc"]
    ]});
};

Blog.prototype.postsCloseTo = function(position){
    return this.store.posts.find({ 'coordinates': { $near: [ position, 0]} }).limit(5).toArrayAsync();
};

Blog.prototype.getPostByShortTitle = function(shortTile){
    return this.store.posts.findOneAsync({ 'shortTitle': shortTile});
};

Blog.prototype.getPostsByPhrase = function(searchPhrase){
    var self = this;
    var parts = _.filter((searchPhrase|| '').split(' '), function(part){
        return part.trim() != '-' && part.trim().length > 0;
    });
    var query = [];
    parts.forEach(function(part){
      query.push({'title':{$regex: '.*' + part + '.*', $options:'i'}})
    });
    if(query.length > 0){
        return this.store.posts.find({ $or: query}, {"sort": [
            ["postedOn", "desc"]
        ]}).toArrayAsync();
    }else{
        return this.lastPost().then(function(post){
            return self.postsCloseTo(new Post(post).location());
        });
    }
};

Blog.prototype.store = storage;

module.exports = new Blog;