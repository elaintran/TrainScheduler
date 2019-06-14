//firebase config
const config = {
    apiKey: "AIzaSyBw9TjCqqffgXP-TKUUFiNQlbSIoqf2drQ",
    authDomain: "minimal-train-scheduler.firebaseapp.com",
    databaseURL: "https://minimal-train-scheduler.firebaseio.com",
    projectId: "minimal-train-scheduler",
    storageBucket: "minimal-train-scheduler.appspot.com",
    messagingSenderId: "560193805039",
    appId: "1:560193805039:web:6b9344bb4c960f9f"
};

firebase.initializeApp(config);
var database = firebase.database();

//global variables
//initial variables
var train;
var destination;
var firstTrainTime;
var frequency;
var newTrain;
//snapshot variables
var newDestination;
var newTrainTime;
var newFrequency;
var minutesLeft;
var trainArrival;
//train object
var addTrain;
//snapshot key
var refKey;
var key;

//when the add train form is submitted, get values
$(".schedule-form").on("submit", function(event) {
    //prevent page from refreshing
    event.preventDefault();
    //get form values and use it to construct an train object
    getValues("#train-name", "#destination", "#first-train-time", "#frequency", "#modal");
    //push new train into database
    database.ref().push(addTrain);
    //clear values on add train form
    $("#train-name").val("");
    $("#destination").val("");
    $("#first-train-time").val("");
    $("#frequency").val("");
})

//delete train from row
$(".schedule").on("click", ".delete-train", function() {
    //get the key for the current train from the data attribute
    key = $(this).parents(".train-row").attr("data-key");
    //remove all of the elements before schedule
    $(this).parentsUntil(".schedule").remove();
    //use the key to remove from database
    database.ref(key).remove();
})

//edit train row
$(".schedule").on("click", ".edit-train", function() {
    //get key to change specific area of database
    key = $(this).parents(".train-row").attr("data-key");
    //get the current text of the train
    var editName = $(this).parents(".action").siblings(".train-cell").text();
    //console.log($(this).parents(".action").siblings(".destination-cell").ignore("span").text());
    var editDestination = $(this).parents(".action").siblings(".destination-container").children(".destination-cell").text();
    var editFrequency = $(this).parents(".action").siblings(".frequency-cell").text();
    var editTrainTime = $(this).parents(".action").siblings(".arrival-cell").attr("data-time");
    //use the text and place it as the edit value
    $("#edit-name").val(editName);
    $("#edit-destination").val(editDestination);
    $("#edit-frequency").val(editFrequency);
    $("#edit-train-time").val(editTrainTime);
})

//when row values are edited
$(".edit-form").on("submit", function(event) {
    //prevent from refresh
    event.preventDefault();
    //get new form values and place into object
    getValues("#edit-name", "#edit-destination", "#edit-train-time", "#edit-frequency", "#edit-modal");
    //place new object in form
    database.ref(key).set(addTrain);
})

function getValues(trainName, trainDestination, trainTime, trainFrequency, modal) {
    //get values from form fields and trim the white space
    train = $(trainName).val().trim();
    destination = $(trainDestination).val().trim();
    firstTrainTime = $(trainTime).val().trim();
    frequency = $(trainFrequency).val().trim();
    //if none of the form fields are empty
    if (train !== "" && destination !== "" && firstTrainTime !== "" && frequency !== "") {
        //hide modal on submit
        $(modal).modal("hide");
    }
    //create train object
    addTrain = {
        train: train,
        destination: destination,
        firstTrainTime: firstTrainTime,
        frequency: frequency
    }
}

function convertTime(snapshot) {
    //store snapshot values in variables
    newTrain = snapshot.val().train;
    newDestination = snapshot.val().destination;
    newTrainTime = snapshot.val().firstTrainTime;
    newFrequency = snapshot.val().frequency;
    //use database items to find arrival time and minutes away
    //initial train time, subtracted one year off so it comes before current time
    var trainTimeConverted = moment(newTrainTime, "hh:mm").subtract(1, "years");
    //subtract current time from first train time and return result in minutes
    var diffTime = moment().diff(moment(trainTimeConverted), "minutes");
    //use modulus to get the remainder, which is the number of minutes left 
    var timeRemainder = diffTime % newFrequency;
    //time from the frequency
    minutesLeft = newFrequency - timeRemainder;
    //add minutes left to current time and return result in minutes
    trainArrival = moment().add(minutesLeft, "minutes").format("hh:mm");
}

function createTrain() {
    //append the rows to table
    var rowElement = $("<div>").attr("data-key", refKey).addClass("train-row");
    //individual datacells containing information from form
    var nameCell = $("<div>").addClass("train-item train-cell").text(newTrain);
    var destinationFrom = $("<span>").text("Austin, TX");
    var arrow = $("<i>").addClass("fas fa-long-arrow-alt-right");
    destinationFrom.append(arrow);
    var destinationContainer = $("<div>").addClass("train-item destination-container");
    var destinationCell = $("<div>").addClass("destination-cell").text(newDestination);
    destinationContainer.append(destinationFrom).append(destinationCell);
    //labels for mobile view, but not visible on browser
    var frequencyLabel = $("<div>").addClass("train-item frequency-label").text("Frequency (min)");
    var arrivalLabel = $("<div>").addClass("train-item arrival-label").text("Next Arrival");
    var minutesLabel = $("<div>").addClass("train-item minutes-label").text("Minutes Away");
    var frequencyCell = $("<div>").addClass("train-item frequency-cell").text(newFrequency);
    //added newTrain time as a data attribute for future use when editing trains
    var arrivalCell = $("<div>").attr("data-time", newTrainTime).addClass("train-item arrival-cell").text(trainArrival);
    var minutesCell = $("<div>").addClass("train-item minutes-cell").text(minutesLeft);
    //ellipses icon toggle for dropdown
    var actionCell = $("<div>").addClass("action dropdown");
    var actionIcon = $("<i>").addClass("fas fa-ellipsis-h").attr("data-toggle", "dropdown");
    //dropdown menu
    var dropdownContainer = $("<div>").addClass("dropdown-menu dropdown-menu-right").attr("aria-labelledby", "dropdownMenuButton");
    var dropdownItemOne = $("<div>").addClass("dropdown-item edit-train")
    dropdownItemOne.attr({
        "data-toggle": "modal",
        "data-target": "#edit-modal"
    });
    var dropdownItemTwo = $("<div>").addClass("dropdown-item delete-train");
    //menu-items
    var editIcon = $("<i>").addClass("fas fa-pen");
    var trashIcon = $("<i>").addClass("fas fa-trash");
    dropdownItemOne.text(" Edit Train").prepend(editIcon);
    dropdownItemTwo.text(" Remove Train").prepend(trashIcon);
    dropdownContainer.append(dropdownItemOne).append(dropdownItemTwo);
    actionCell.append(actionIcon).append(dropdownContainer);
    rowElement.append(nameCell).append(destinationContainer).append(frequencyLabel).append(arrivalLabel).append(minutesLabel).append(frequencyCell).append(arrivalCell).append(minutesCell).append(actionCell);
    $(".schedule").append(rowElement);
}

//when object is added into the database
database.ref().on("child_added", function(snapshot) {
    //get key to select positions of the table to edit and remove
    refKey = snapshot.key;
    //convert first train time using moment to get values for arrival and minutes left
    convertTime(snapshot);
    //append to values to table
    createTrain();
})

//when object values are replaced in the database
database.ref().on("child_changed", function(snapshot) {
    //convert first train time using moment to get values for arrival and minutes left
    convertTime(snapshot);
    //find the train-row with the correct key
    $(".train-row").each(function() {
        if($(this).attr("data-key") === key) {
            //update html with new form values
            $(this).children(".train-cell").text(newTrain);
            $(this).children(".destination-container").children(".destination-cell").text(newDestination);
            $(this).children(".frequency-cell").text(newFrequency);
            $(this).children(".arrival-cell").attr("data-time", newTrainTime).text(trainArrival);
            $(this).children(".minutes-cell").text(minutesLeft);
        }
    })
})