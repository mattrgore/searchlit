var natural = require('natural');
var fs = require('fs');
//var classifier = new natural.LogisticRegressionClassifier();
var classifier = new natural.BayesClassifier();
const mongoose = require('mongoose');
const excerpt = require('../../app/models/excerpt.js');
const Excerpt = mongoose.model('Excerpt');

mongoose.connect('mongodb://localhost/searchlit_dev');

// fs.readFile('training_data.json', 'utf-8', function(err, data){
//     if (err){
//         console.log(err);
//     } else {
//         var trainingData = JSON.parse(data);
//         train(trainingData);
//     }
// });

Excerpt.find(function (err, excerpts) {
        if (err) return console.error(err);
        train(excerpts);
});

function train(trainingData){
    console.log("Training");
    trainingData.forEach(function(item){
        console.log(item.body + '\n' + item.tags);
        classifier.addDocument(item.body.toString("utf8"), item.tags.toString("utf8"));
    });
    var startTime = new Date();
    classifier.train();
    var endTime = new Date();
    var trainingTime = (endTime-startTime)/1000.0;
    console.log("Training time:", trainingTime, "seconds");
    loadTestData();
    console.log("I'm here");
}

// function loadDBTestData(){
//     console.log("Loading test data from database");
//     Excerpt.find(function (err, excerpts) {
//         if (err) return console.error(err);
//         excerpts.forEach(function(item){
//             console.log(item.body);
//         })
//     })
// }

function loadTestData(){
    console.log("Loading test data");
    fs.readFile('test_data.json', 'utf-8', function(err, data){
        if (err){
            console.log(err);
        } else {
            var testData = JSON.parse(data);
            testClassifier(testData);
        }
    });
}

function testClassifier(testData){
    console.log("Testing classifier");
    var numCorrect = 0;
    testData.forEach(function(item){
        var labelGuess = classifier.classify(item.text);
        if (labelGuess === item.label){
            numCorrect++;
        }
    });
    console.log("Correct %:", numCorrect/testData.length);
    saveClassifier(classifier);
}

function saveClassifier(classifier){
    classifier.save('classifier.json', function(err, classifier){
        if (err){
            console.log(err);
        } else {
            console.log("Classifier saved!");
        }
    });
}