var fs = require("fs");

exports.upload = function (link) {

    if (!link.files || !link.files.file) {
        return link.send(400, { error: "Invalid upload" });
    }

    if (!link.params || !link.params.uploadDir || !link.params.dsUpload) {
        return link.send(400, { error: "Missing params: uploadDir or dsUpload." });
    }

    var uploadDir = M.app.getPath() + "/" + link.params.uploadDir;
    var uploadedFilePath = M.app.getPath() + "/" + link.files.file.path;

    var fileExt = link.files.file.name;
    fileExt = fileExt.substring(fileExt.lastIndexOf(".")) || "";

    var generatedId = uploadedFilePath.substring(uploadedFilePath.lastIndexOf("/") + 1);
    var newFilePath = uploadDir + "/" + generatedId + fileExt;

    getCollection(link.params.dsUpload, function (err, collection) {

        console.log("got col");

        if (err) { return link.send(400, err); }

        var docToInsert = {
            fileName: link.files.file.name,
            extension: fileExt,
            filePath: newFilePath,
            id: generatedId
        };

        collection.insert(docToInsert, function (err, doc) {
            if (err) { return link.send(400, err); }

            doc = doc[0];
            fs.rename(uploadedFilePath, newFilePath, function (err) {
                if (err) { return link.send(400, err); }

                link.send(200, doc.id);
            });
        });
    });
};

// private functions
function getCollection (paramsDs, callback) {
    M.datasource.resolve(paramsDs, function(err, ds) {
        if (err) { return callback(400, err); }

        M.database.open(ds, function(err, db) {
            if (err) { return callback(400, err); }

            db.collection(ds.collection, function(err, collection) {
                if (err) { return callback(400, err); }

                callback(null, collection);
            });
        });
    });
}
