var natural = require('natural');

natural.BayesClassifier.load('classifier.json', null, function(err, classifier){
    if (err){
        console.log(err);
    } else {
        var testComment = "Yuri could not wait to go home";
        console.log(classifier.classify(testComment));
    }
});