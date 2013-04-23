/**
 * Author: Matthew Harrison-Jones
 **/
var socket, localPerson;
var people  = [];
var questions = [];

function init(){

    $(".namerequest").hide();
    $(".hidden").show();
    $('#question').focus();


    socket = io.connect();
    var updated = false;

    var setEventHandlers = function() {
        // Keyboard
        $("#question").keypress(function(e) {
            if(e.which == 13) {
                if(localPerson.checkTime() >= 10 && $('#question').val() != ""){
                    socket.emit('new question', {question: $('#question').val()});
                    $('#question').val('');
                    localPerson.updateTime();
                }else{
                    $('.progress').stop(true).fadeOut(200).fadeIn(200);
                }
            }
        });

        setInterval(function() {updateProgress(); }, 1000 / 5);


        // Socket connection successful
        socket.on("connect", onSocketConnected);

        // Socket disconnection
        socket.on("disconnect", onSocketDisconnect);

        // New person message received
        socket.on("newPerson", onNewPerson);

        // New Question message received
        socket.on("new question", onNewQuestion);

        // New Answer message received
        socket.on("new answer", onNewAnswer);

        // person removed message received
        socket.on("remove person", onRemovePerson);

        socket.on("remove question", onRemoveQuestion);

        // Listen for set vote message
        socket.on("set vote", onSetVote);
    };

    setEventHandlers();

    // Socket connected
    function onSocketConnected() {
        console.log("Connected to socket server as "+localPerson.getName());

        // Send local person data to the game server
        socket.emit("newPerson", {name: localPerson.getName()});
    }

    // Socket disconnected
    function onSocketDisconnect() {
        console.log("Disconnected from socket server");
    }

    // New person
    function onNewPerson(data) {
        console.log("New person connected: "+data.id+" ("+data.name+")");

        // Initialise the new person
        var newPerson = new Person(data.name);
        newPerson.id = data.id;

        // Add new person to the remote people array
        people.push(newPerson);
    }

    // New question
    function onNewQuestion(data) {
        console.log("New question: "+data.id+" ("+data.question+")");

        // Initialise the new person
        var newQuestion = new Question(data.question, data.author);
        newQuestion.id = data.id;
        newQuestion.votes(data.votes);
        if(data.answer) newQuestion.setAnswer(data.answer);

        $('#receiver').prepend('<li class="item unset animated bounceIn" data-id="'+newQuestion.id+'" data-count="0"><small class="name">'+newQuestion.getAuthor()+': </small>' + newQuestion.getQuestion() + '</li>');
        newQuestion.dom = $('li.item[data-id="'+data.id+'"]');
        newQuestion.dom.attr("data-count", newQuestion.getVotes);


        if(newQuestion.getAnswer()){
            newQuestion.dom.removeClass('unset').addClass('set');
            newQuestion.dom.append("<strong class='ans'>Matt: "+data.answer+"</strong>");
        }

        // Add new question to the remote people array
        questions.push(newQuestion);
    }

    // New Answer
    function onNewAnswer(data) {
        console.log("Question answered: "+data.id);

        var selectedQuestion = QuestionById(data.id);

        // person not found
        if (!selectedQuestion) {
            util.log("Question not found: "+id);
            return;
        }

        selectedQuestion.setAnswer(data.answer);

       selectedQuestion.dom.removeClass('unset').addClass('set bounce').delay(1000).queue(function(next){
            $(this).removeClass('bounce');
            next();
        });;
       selectedQuestion.dom.append("<strong class='ans'>Matt: "+data.answer+"</strong>");
    }



    // Socket client has disconnected
    function onRemoveQuestion(data) {
        console.log("Question removed: "+data.id);

        var removeQuestion = QuestionById(data.id);

        // person not found
        if (!removeQuestion) {
            console.log("Question not found: "+data.id);
            return;
        }

        removeQuestion.dom.addClass('hinge').delay(1000).queue(function(next){
            $(this).remove();
            next();
        });

        // Remove person from people array
        questions.splice(questions.indexOf(removeQuestion), 1);

       

    }

    // Vote Question
    function onSetVote(data) {
        console.log("Question votes: "+data.id);

        var setQuestion = QuestionById(data.id);

        // person not found
        if (!setQuestion) {
            console.log("Question not found: "+data.id);
            return;
        }

        setQuestion.setVotes();

        setQuestion.dom.removeClass('bounceIn').addClass('pulse').delay(1000).queue(function(next){
            $(this).removeClass("pulse");
            next();
        });;
        setQuestion.dom.attr("data-count", setQuestion.getVotes);
    }

    // Remove person
    function onRemovePerson(data) {
        var removePerson = personById(data.id);

        // person not found
        if (!removePerson) {
            console.log("Person not found: "+data.id);
            return;
        }

        // Remove person from array
        people.splice(people.indexOf(removePerson), 1);
    }

    function updateProgress(){

        var current_time = localPerson.checkTime();

        var progress = (current_time / 10) * 100;

        if(progress <= 100) $('.progress').width(progress+"%");

    }

    $(document).on("mousedown", ".item", function(event) {
        switch (event.which) {
            case 1:
                if(!$(this).attr("data-voted")){
                    socket.emit('set vote', {id:$(this).data("id")});
                    $(this).attr('data-voted', 1).addClass('voted');
                }
                break;
            default:
                console.log("Invalid Mouse");
        }
    });
}
// Find person by ID
function personById(id) {
    var i;
    for (i = 0; i < people.length; i++) {
        if (people[i].id == id) return people[i];
    }
    return false;
}

// Find question by ID
function QuestionById(id) {
    var i;
    for (i = 0; i < questions.length; i++) {
        if (questions[i].id == id) return questions[i];
    }
    return false;
}

$(document).ready(function() {

    $("#name").fitText();

    $("#name").keypress(function(e) {
        if(e.which == 13) {
            if($("#name").val() == "") localPerson = new Person("default");
            else  localPerson = new Person($("#name").val());
            init();
        }
    });
});

