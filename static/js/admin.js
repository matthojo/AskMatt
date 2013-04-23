/* Author: YOUR NAME HERE
*/
$(document).ready(function() {
  localPerson = new Person("Matt");
  init();
});

var selected_question;

$(document).on("click", ".item", function() {
  selected_question = $(this).data("id");

  question = QuestionById(selected_question);

  // Person not found
  if (!question) {
    console.log("Question not found: "+id);
    return;
  }else{
    console.log("Selected:"+ question.getQuestion());
  }

  $("li.item.selected").removeClass('selected');
  question.dom.addClass('selected');
  $("#answer").removeClass('inactive');
});  

$(document).on("dblclick", ".item", function() {
  socket.emit('remove question', $(this).data("id"));
});

$("#answer").keypress(function(e) {
  if(e.which == 13) {
    if($("#answer").val() != "" && selected_question){
      socket.emit('new answer', {id: selected_question, answer: $("#answer").val()});
    }
  }
});