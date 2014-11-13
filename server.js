/********************
*
* SETUP
*
********************/

// Dependencies
var connect = require('connect'),
    express = require('express'),
    http = require('http'),
    crypto = require('crypto'),
    io = require('socket.io'),
    util = require('util'),
    port = (process.env.PORT || 8081),
    Person = require('./Person').Person,
    Question = require('./Question').Question,
    bodyParser = require('body-parser');

// Express
var app = express();
app.set('views', __dirname + '/views');
app.set('view options', { layout: false });
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));

app.use(function(err, req, res, next){
  console.error(err.stack);
  if (res.status(404)) {
      res.render('404.jade', { locals: {
                title : '404 - Not Found'
               ,description: ''
               ,author: ''
               ,analyticssiteid: 'UA-4609610-2'
              },status: 404 });
  } else {
      res.render('500.jade', { locals: {
                title : 'The Server Encountered an Error'
               ,description: ''
               ,author: ''
               ,analyticssiteid: 'UA-4609610-2'
               ,error: err
              },status: 500 });
  }
});

/********************
*
* ROUTES
*
********************/

app.get('/', function(req,res){
  res.render('index.jade', {
    locals : {
              title : 'Ask Matt'
             ,description: 'Ask Me Anything'
             ,author: 'Matthew Harrison-Jones'
             ,analyticssiteid: 'UA-4609610-2'
            }
  });
});

// Generate new hash
var current_date = (new Date()).valueOf().toString();
var random = Math.random().toString();
var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');

// Output hash to console
util.log("Admin: "+hash);

// A Route for the admin
app.get('/'+hash, function(req,res){
  res.render('admin.jade', {
    locals : {
              title : 'Ask Matt Admin'
             ,description: 'Ask Me Anything'
             ,author: 'Matthew Harrison-Jones'
             ,analyticssiteid: 'UA-4609610-2'
            }
  });
});

var server =  http.createServer(app);

// Socket.io
var io = io.listen(server);

server.listen(port);

// Variables
var people  = [];
var questions = [];

/********************
*
* EVENT HANDLERS
*
********************/

// Socket.IO
io.sockets.on("connection", onSocketConnection);

// New socket connection
function onSocketConnection(client) {

  util.log("New person has connected: "+client.id);

  // Listen for client disconnected
  client.on("disconnect", onClientDisconnect);

  // Listen for new person message
  client.on("newPerson", onNewPerson);

  // Listen for new question message
  client.on("new question", onNewQuestion);

  // Listen for new answer message
  client.on("new answer", onNewAnswer);

  // Listen for remove question message
  client.on("remove question", onRemoveQuestion);

  // Listen for set vote message
  client.on("set vote", onSetVote);
}

/********************
*
* FUNCTIONS
*
********************/

// Socket client has disconnected
function onClientDisconnect() {
  util.log("Person has disconnected: "+this.id);

  var removePerson = personById(this.id);

  // Person not found
  if (!removePerson) {
    util.log("Person not found: "+this.id);
    return;
  }

  // Remove person from people array
  people.splice(people.indexOf(removePerson), 1);

  // Broadcast removed person to connected socket clients
  this.broadcast.emit("remove person", {id: this.id});
}

// New person has joined
function onNewPerson(data) {
  // Create a new person
  var newPerson = new Person(data.name);
  newPerson.id = this.id;

  util.log("Person: "+data.name+" connected.");

  // Broadcast new person to connected socket clients
  this.broadcast.emit("newPerson", {id: newPerson.id, name: newPerson.getName()});

  // Send existing people to the new person
  var i, existingPerson;
  for (i = 0; i < people.length; i++) {
      existingPerson = people[i];
      this.emit("new person", {id: existingPerson.id, name: existingPerson.getName()});
  }

   // Send existing questions to the new person
   var i, existingQuestions;
   for (i = 0; i < questions.length; i++) {
       existingQuestions = questions[i];
       util.log("Question sent: "+existingQuestions.getQuestion());
       this.emit("new question", {id: existingQuestions.id, question: existingQuestions.getQuestion(), author: existingQuestions.getAuthor(), answer: existingQuestions.getAnswer(), votes: existingQuestions.getVotes()});
   }

  // Add new person to the people array
  people.push(newPerson);
}

// New question
function onNewQuestion(data) {
    // Create a new question
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    var hash = crypto.createHash('sha1').update(current_date + random).digest('hex');

    var author = personById(this.id);
    var newQuestion = new Question(data.question, author.getName());
    newQuestion.id = hash;
    newQuestion.votes(0);

    // Broadcast new question to connected socket clients
    this.broadcast.emit("new question", {id: newQuestion.id, question: newQuestion.getQuestion(), author: newQuestion.getAuthor(), votes: newQuestion.getVotes()});

    this.emit("new question", {id: newQuestion.id, question: newQuestion.getQuestion(), author: newQuestion.getAuthor(), votes: newQuestion.getVotes()});


    // Add new person to the people array
    questions.push(newQuestion);


}

// New Answer
function onNewAnswer(data) {
    util.log("Question answered: "+data.id);

    var selectedQuestion = QuestionById(data.id);

    // question not found
    if (!selectedQuestion) {
        util.log("Question not found: "+data.id);
        return;
    }

    selectedQuestion.setAnswer(data.answer);

    // Broadcast removed person to connected socket clients
    this.broadcast.emit("new answer", {id: data.id, answer: data.answer});

    this.emit("new answer", {id: data.id, answer: data.answer});
}

// Remove Question
function onRemoveQuestion(id) {
    util.log("Question removed: "+id);

    var removeQuestion =QuestionById(id);

    // person not found
    if (!removeQuestion) {
        util.log("Question not found: "+id);
        return;
    }

    // Remove person from people array
    questions.splice(questions.indexOf(removeQuestion), 1);

    // Broadcast removed person to connected socket clients
    this.broadcast.emit("remove question", {id: id});

    this.emit("remove question", {id: id});
}

// Vote Question
function onSetVote(data) {
    util.log("Question votes: "+data.id);

    var setQuestion = QuestionById(data.id);

    // person not found
    if (!setQuestion) {
        util.log("Question not found: "+data.id);
        // Broadcast removed person to connected socket clients
        this.broadcast.emit("remove question", {id: data.id});
        return;
    }

    setQuestion.setVotes();

    // Broadcast removed person to connected socket clients
    this.broadcast.emit("set vote", {id: data.id});

    this.emit("set vote", {id: data.id});
}

/********************
*
* HELPERS
*
********************/

// Find person by ID
function personById(id) {
    var i;
    for (i = 0; i < people.length; i++) {
        if (people[i].id == id) return people[i];
    }
    return false;
}

// Find person by ID
function QuestionById(id) {
    var i;
    for (i = 0; i < questions.length; i++) {
        if (questions[i].id == id) return questions[i];
    }
    return false;
}

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

/********************
*
* BOOM! ALL SYSTEMS GO.
*
********************/

console.log('Listening on http://0.0.0.0:' + port );
