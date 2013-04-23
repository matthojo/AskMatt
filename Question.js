/**
 *
 * Question Class 
 *
 **/
var Question = function(question, author) {
    var question = question,
        author = author,
        answer,
        votes = 0,
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

    var setVotes = function() {
        votes++;
    };

    var getVotes = function() {
        return votes;
    };

    var votes = function(v){
        votes = v;
    };


    // Make privates public.
    return {
        getQuestion: getQuestion,
        setQuestion: setQuestion,
        getAuthor: getAuthor,
        setAnswer: setAnswer,
        getAnswer: getAnswer,
        votes: votes,
        setVotes: setVotes,
        getVotes: getVotes,
        id: id
    }
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Question = Question;