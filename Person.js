/**
 *
 * Person Class 
 *
 **/
var Person = function(name) {
    var name = name,
        id;

    // Getters and Setters
    var getName = function() {
        return name;
    };

    var setName = function(n) {
        name = n;
    };

    // Make privates public.
    return {
        getName: getName,
        setName: setName,
        id: id
    }
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Person = Person;