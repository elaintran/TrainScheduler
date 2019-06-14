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
var edit = false;

//when form is submitted, get values
$(".schedule-form").on("submit", function(event) {
    //prevent page from refreshing
    event.preventDefault();
    getValues("#train-name", "#destination", "#first-train-time", "#frequency", "#modal");
    //push new train into database
    database.ref().push(addTrain);
    //clear values on form
    $("#train-name").val("");
    $("#destination").val("");
    $("#first-train-time").val("");
    $("#frequency").val("");
})

//when object is added into the database
database.ref().on("child_added", function(snapshot) {
    //get key to select positions of the table to edit and remove
    refKey = snapshot.key;
    convertTime(snapshot);
    //append to table
    createTrain();
})

function createTrain() {
    //append the rows to table
    var rowElement = $("<div>").attr("data-key", refKey).addClass("train-row");
    //individual datacells containing information from form
    var trainIcon = $("<i>").addClass("fas fa-subway");
    var nameCell = $("<div>").addClass("train-item train-cell").text(newTrain);
    var destinationCell = $("<div>").addClass("train-item destination-cell").text(newDestination);
    var frequencyLabel = $("<div>").addClass("train-item frequency-label").text("Frequency (min)");
    var arrivalLabel = $("<div>").addClass("train-item arrival-label").text("Next Arrival");
    var minutesLabel = $("<div>").addClass("train-item minutes-label").text("Minutes Away");
    var frequencyCell = $("<div>").addClass("train-item frequency-cell").text(newFrequency);
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
    rowElement.append(trainIcon).append(nameCell).append(destinationCell).append(frequencyLabel).append(arrivalLabel).append(minutesLabel).append(frequencyCell).append(arrivalCell).append(minutesCell).append(actionCell);
    $(".schedule").append(rowElement);
}

//delete train from row
$(".schedule").on("click", ".delete-train", function() {
    //get the key for the current train from the data attribute
    key = $(this).parents(".train-row").attr("data-key");
    //console.log(key);
    //remove all of the elements before tbody
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
    var editDestination = $(this).parents(".action").siblings(".destination-cell").text();
    var editFrequency = $(this).parents(".action").siblings(".frequency-cell").text();
    var editTrainTime = $(this).parents(".action").siblings(".arrival-cell").attr("data-time");
    //use the text and place it as the edit value
    $("#edit-name").val(editName);
    $("#edit-destination").val(editDestination);
    $("#edit-frequency").val(editFrequency);
    $("#edit-train-time").val(editTrainTime);
})

$(".edit-form").on("submit", function(event) {
    event.preventDefault();
    getValues("#edit-name", "#edit-destination", "#edit-train-time", "#edit-frequency", "#edit-modal");
    database.ref(key).set(addTrain);
})

database.ref().on("child_changed", function(snapshot) {
    convertTime(snapshot);
    $(".train-row").each(function() {
        if($(this).attr("data-key") === key) {
            $(this).children(".train-cell").text(newTrain);
            $(this).children(".destination-cell").text(newDestination);
            $(this).children(".frequency-cell").text(newFrequency);
            $(this).children(".arrival-cell").attr("data-time", newTrainTime).text(trainArrival);
            $(this).children(".minutes-cell").text(minutesLeft);
        }
    })
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

//BUGS TO FIX
//change dropdown menu to round corners on select