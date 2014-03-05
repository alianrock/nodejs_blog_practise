var mongodb = require('./db');

function Ids(tablename, id) {
    this.id = id;
    this.tablename = tablename;
}
module.exports = Ids;
Ids.getId = function (tablename, callback) {
    mongodb.open(function (err, db) {
        db.collection('ids', function (err, collection) {
        collection.findAndModify({"tablename":tablename}, [], {$inc:{'id':1}}, {new:true, upsert:true}, function (err, doc) {
            mongodb.close();
                if(err){
                    return  callback(null,err);
                }else{
                    callback(doc.id,err);
                }
                
            });
        });
    });
}