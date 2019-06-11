//put into array
//append to table
//maybe check letter casing and rewrite in camelcase
//check if numbers are in the right format
//if not, give an error message
//store the information in firebase

//firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBw9TjCqqffgXP-TKUUFiNQlbSIoqf2drQ",
    authDomain: "minimal-train-scheduler.firebaseapp.com",
    databaseURL: "https://minimal-train-scheduler.firebaseio.com",
    projectId: "minimal-train-scheduler",
    storageBucket: "minimal-train-scheduler.appspot.com",
    messagingSenderId: "560193805039",
    appId: "1:560193805039:web:6b9344bb4c960f9f"
  };

//global variables
var nameList = [];
var destinationList = [];
var frequencyList = [];

//when form is submitted, get values
$(".schedule-form").on("submit", function(event) {
    event.preventDefault();
    var trainName = $("#train-name").val().trim();
    var destination = $("#destination").val().trim();
    var firstTrainTime = $("#first-train-time").val().trim();
    var frequency = $("#frequency").val().trim();
    var rowElement = $("<tr>");
    var nameCell = $("<td>").text(trainName);
    var destinationCell = $("<td>").text(destination);
    var frequencyCell = $("<td>").text(frequency);
    rowElement.append(nameCell).append(destinationCell).append(frequencyCell);
    $("tbody").append(rowElement);
    //if none of the form fields are empty
    if ($("#train-name").val() !== "" &&
        $("#destination").val() !== "" &&
        $("#first-train-time").val() !== "" &&
        $("#frequency").val() !== "") {
        //hide modal on submit
        $("#modal").modal("hide");
    }
})