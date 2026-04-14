const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');

let gfsBucket;

function initGridFS() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('MongoDB connection is not ready yet.');
  }

  gfsBucket = new GridFSBucket(db, {
    bucketName: 'pdfs',
  });

  return gfsBucket;
}

function getGridFSBucket() {
  if (!gfsBucket) {
    throw new Error('GridFS bucket has not been initialized.');
  }
  return gfsBucket;
}

module.exports = {
  initGridFS,
  getGridFSBucket,
  ObjectId,
};