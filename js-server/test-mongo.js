var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://foo:bar@localhost:27017/";

MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");
    var myquery = { address: "Valley 345" };
    var newvalues = { $set: { name: "Mickey", address: "Canyon 123" } };
    dbo.collection("customers").updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
    });

    var query = { name: "Company Inc" };
    const result = await dbo.collection("customers").findOne(query, { projection: { _id: 0 } });
    console.log(result);
    db.close();
});