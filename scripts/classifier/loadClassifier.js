var natural = require('natural');

natural.BayesClassifier.load('classifier.json', null, function(err, classifier){
    if (err){
        console.log(err);
    } else {
        var testComment = "With only two hours to spare, he took the pill";
        console.log(classifier.classify(testComment));
    }
});