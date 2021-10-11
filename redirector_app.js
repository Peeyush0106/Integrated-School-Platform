// Database setup
var auth = firebase.auth();
var loading_show = false;
var writtenNoConnection = false;

checkConnection();
function checkConnection() {
    // Check if we are connected to the internet or not.
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function (snap) {
        connected = snap.val();
        if (connected) {
            if (auth.currentUser) location.href = "signed-in_index.html";
            else location.href = "sign-in_index.html";
            console.log("connected");
        }
        else {
            if (!writtenNoConnection) {
                document.write("Trying to connect..");
                writtenNoConnection = true;
            }
            loading_show = true;
            setTimeout(checkConnection, 500);
        }
    });
}