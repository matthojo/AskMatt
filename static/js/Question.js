/**
 *
 * Question Class 
 *
 **/
var Question = function(question, author) {
    var question = question,
        author = author,
        answer,
        id;

    // Getters and setters
    var getQuestion = function() {
        return question;
    };

    var setQuestion = function(q) {
        question = q;
    };

    var getAuthor = function() {
        return author;
    };

    var setAnswer = function(a) {
        answer = a;
    };

    var getAnswer = function() {
        return answer;
    };

    // Make privates public.
    return {
        getQuestion: getQuestion,
        setQuestion: setQuestion,
        getAuthor: getAuthor,
        setAnswer: setAnswer,
        getAnswer: getAnswer,
        id: id
    }
};