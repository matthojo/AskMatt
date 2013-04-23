/**
 *
 * Person Class 
 *
 **/
var Person = function(name) {
    var name = name,
        last_submit = Date.now() - 10000,
        id;

    // Getters and setters
    var getName = function() {
        return name;
    };

    var setName = function(n) {
        name = n;
    };

    var updateTime = function(){
        last_submit = Date.now();
        console.log(last_submit);
    }

    var checkTime = function(){
        var end = Date.now();
        var elapsed = (end - last_submit) / 1000;

        return elapsed;
    }

    // Make privates public.
    return {
        getName: getName,
        setName: setName,
        updateTime: updateTime,
        checkTime: checkTime,
        id: id
    }
};