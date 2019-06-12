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
var newTrain;
var newDestination;
var newTrainTime;
var newFrequency;
var minutesLeft;
var trainArrival;
var refKey;

//when form is submitted, get values
$(".schedule-form").on("submit", function(event) {
    //prevent page from refreshing
    event.preventDefault();
    //get values from form fields and trim the white space
    var trainName = $("#train-name").val().trim();
    var destination = $("#destination").val().trim();
    var firstTrainTime = $("#first-train-time").val().trim();
    var frequency = $("#frequency").val().trim();
    //if none of the form fields are empty
    if (trainName !== "" && destination !== "" && firstTrainTime !== "" && frequency !== "") {
        //clear values on form
        $("#train-name").val("");
        $("#destination").val("");
        $("#first-train-time").val("");
        $("#frequency").val("");
        //hide modal on submit
        $("#modal").modal("hide");
    }
    //create train object
    var newTrain = {
        train: trainName,
        destination: destination,
        firstTrainTime: firstTrainTime,
        frequency: frequency
    }
    //push new train into database
    database.ref().push(newTrain);
})

//when object is added into the database
database.ref().on("child_added", function(snapshot) {
    //set snapshot values as variables
    newTrain = snapshot.val().train;
    newDestination = snapshot.val().destination;
    newTrainTime = snapshot.val().firstTrainTime;
    newFrequency = snapshot.val().frequency;
    refKey = snapshot.key;
    console.log(refKey);
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
    //append to table
    createTrain();
})

function createTrain() {
    //append the rows to table
    var rowElement = $("<tr>").attr("data-key", refKey);
    //individual datacells containing information from form
    var nameCell = $("<td>").addClass("train-name").text(newTrain);
    var destinationCell = $("<td>").text(newDestination);
    var frequencyCell = $("<td>").text(newFrequency);
    var arrivalCell = $("<td>").text(trainArrival);
    var minutesCell = $("<td>").text(minutesLeft);
    //ellipses icon toggle for dropdown
    var actionCell = $("<td>").addClass("dropdown");
    var actionIcon = $("<i>").addClass("fas fa-ellipsis-h").attr("data-toggle", "dropdown");
    //dropdown menu
    var dropdownContainer = $("<div>").addClass("dropdown-menu dropdown-menu-right").attr("aria-labelledby", "dropdownMenuButton");
    var dropdownItemOne = $("<div>").addClass("dropdown-item edit-train");
    var dropdownItemTwo = $("<div>").addClass("dropdown-item delete-train");
    //menu-items
    var editIcon = $("<i>").addClass("fas fa-pen");
    var trashIcon = $("<i>").addClass("fas fa-trash");
    dropdownItemOne.text(" Edit Train").prepend(editIcon);
    dropdownItemTwo.text(" Remove Train").prepend(trashIcon);
    dropdownContainer.append(dropdownItemOne).append(dropdownItemTwo);
    actionCell.append(actionIcon).append(dropdownContainer);
    rowElement.append(nameCell).append(destinationCell).append(frequencyCell).append(arrivalCell).append(minutesCell).append(actionCell);
    $("tbody").append(rowElement);
}

$("tbody").on("click", ".delete-train", function() {
    var key = $(this).parents("tr").attr("data-key");
    $(this).parentsUntil("tbody").remove();
    database.ref(key).remove();
})