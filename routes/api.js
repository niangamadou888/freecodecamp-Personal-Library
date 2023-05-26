/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const expect = require('chai').expect;
const mongoose = require('mongoose');
const objectId = mongoose.Types.ObjectId;

const bookSchema = new mongoose.Schema({
  title: String,
  comments: { type: [String], default: [] }
})

let book = mongoose.model('book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let project = {
        _id: 1,
        title: 1,
        commentcount: { $size: '$comments'}
      }
      book.aggregate([{ $match: {} }, { $project: project }], (err, books) => {
        if (err) {
          return res.send(err);
        } else {
          return res.json(books);
        }
      })
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.send('missing required field title');
      }
      let newBook = book({ title });
      newBook.save((err, book) => {
        if (err) {
          return res.send('could not save');
        } else {
          return res.json(book);
        }
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      book.deleteMany({}, (err, d) => {
        if (!err && d) {
          return res.json('complete delete successful');
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      book.findById(bookid, (err, book) => {
        if (!book) {
          res.send('no book exists');
        } 
        if (!err && book) {
          return res.json(book);
        }
      })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        return res.send('missing required field comment');
      }
      book.findOneAndUpdate({ _id: bookid }, { $push: { comments: comment} }, { new: true }, (err, book) => {
        if (!book) {
          return res.send('no book exists');
        } 
        if (!err && book) {
          return res.json(book);
        }
      })
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      book.findByIdAndRemove(bookid, (err, issue) => {
        if (!issue || err) {
          return res.send('no book exists');
        } else {
          return res.send('delete successful');
        }
      })
    });
  
};