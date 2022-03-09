// Database setup
var database = firebase.database();
var profilePicRef = firebase.storage().ref("profile-pics");
var auth = firebase.auth();
var loading_show = false;
var connectingPAdded = false;
var connectingP = document.createElement("p");
connectingP.innerText = "Connecting to database...";
var loading_show = false;
var cancelClicked = false;
var noConnectionTimer = 0;
var choosingProfilePic = false;

function randomNo(min, max) { return Math.round(Math.random() * (max - min)); }

checkConnection();
function checkConnection() {
    setTimeout(function () {
        // Check if we are connected to the internet or not.
        var connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", function (snap) {
            connected = snap.val();
            if (connected) {
                noConnectionTimer = 0;
                loading_show = false;
                if (connectingPAdded) {
                    document.body.removeChild(connectingP);
                    connectingPAdded = false;
                }
            }
            else {
                if (noConnectionTimer >= 10) {
                    connectingP.innerHTML = "You have very low or no internet connection. Please check your internet speed. If this does not help, try refreshing the page or contacting the owner, <div style='color: red; background-color: blue;'> Peeyush </div>";
                    loading_show = false;
                    connectingP.style["background-color"] = "orange";
                    connectingP.style.color = "black";
                    connectingP.style.fontSize = "30px";
                    connectingP.style.textAlign = "center";
                }
                else {
                    noConnectionTimer += 1;
                    loading_show = true;
                    if (!connectingPAdded) {
                        document.body.appendChild(connectingP);
                        connectingPAdded = true;
                    }
                }
            }
        });
        checkConnection();
    }, 2000);
}

document.getElementById("initial-form").addEventListener("submit", (e) => {
    if (!cancelClicked) {
        console.log("submit");
        e.preventDefault();

        userName = document.getElementById("inpt-name").value;
        email = document.getElementById("inpt-eml").value;
        pwd = document.getElementById("inpt-pwd").value;

        if (auth.currentUser) login = false;
        if (validateEmail(email) && validateEmail(email)[0] === email && pwd !== "") {
            if (!auth.currentUser) {
                if (userName && !login) {
                    choosingProfilePic = true;
                    auth.createUserWithEmailAndPassword(email, pwd).then((data) => {
                        database.ref("Users/" + auth.currentUser.uid).update({
                            name: userName
                        }).then(() => {
                            chooseProfilePic(() => {
                                location.href = "signed-in_index.html";
                            });
                        });
                    }).catch(function (error) {
                        message = error.message;
                        alert(message);
                    });;
                }
                if (login) {
                    auth.signInWithEmailAndPassword(email, pwd).then(() => {
                        location.href = "signed-in_index.html";
                        console.log("Success!");
                    }).catch(function (error) {
                        message = error.message;
                        if (message === "There is no user record corresponding to this identifier. The user may have been deleted.") message = "Account does not exist. Sign up instead."
                        alert(message);
                    });
                }
            }
        }
        else if (!auth.currentUser) alert("Invalid email or password.");
        console.log(auth.currentUser);
    }
    cancelClicked = false;
});

function loginUser() {
    login = true;
    cancelBtnPressed = false;

    document.getElementById("initial-form").hidden = false;
    document.getElementById("start-form-your-name").style.display = "none";

    // Hiding the Login and Sign up button
    document.getElementById("login").style.display = "none";
    document.getElementById("login").hidden = true;
    document.getElementById("signup").style.display = "none";
    document.getElementById("signup").hidden = true;
    document.getElementById("profile-pic-elts").hidden = true;
}

function signupUser() {
    login = false;
    cancelBtnPressed = false;

    document.getElementById("initial-form").hidden = false;
    document.getElementById("start-form-your-name").style.display = "flex";

    // Hiding the Login and Sign up button
    document.getElementById("login").style.display = "none";
    document.getElementById("login").hidden = true;
    document.getElementById("signup").style.display = "none";
    document.getElementById("signup").hidden = true;
}

function cancelLoginOrSignup() {
    login = false;
    cancelBtnPressed = true;

    document.getElementById("initial-form").hidden = true;
    document.getElementById("start-form-your-name").style.display = "none";

    // Showing the Login and Sign up button
    document.getElementById("login").style.display = "block";
    document.getElementById("login").hidden = true;
    document.getElementById("signup").style.display = "block";
    document.getElementById("signup").hidden = true;
    document.getElementById("profile-pic-elts").hidden = true;
    cancelClicked = true;
}

function validateEmail(email) {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return (email.match(validRegex))
}

var cameraPhoto;
function takeSnapshot() {
    Webcam.snap(function (data_url) {
        document.getElementById("profile-pic").src = data_url;
        cancelSnapshot();
        cameraPhoto = data_url;
        setProfileImage(false, data_url);
        profilePictureBlank = false;
    });
}

function cancelSnapshot() {
    document.getElementById("elts-to-hide-at-events").hidden = false;
    document.getElementById("camera-elts").hidden = true;
}

function setCam() {
    document.getElementById("camera-elts").hidden = false;
    document.getElementById("elts-to-hide-at-events").hidden = true;
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'png'
    });
    Webcam.attach('#my_camera');
}

fileUpload = document.getElementById("file-upload");

uploadBtn = document.getElementById("imgFileUpload");
uploadBtn.onclick = function () {
    fileUpload.click();
};

document.getElementById("uploaded-img").onload = function () {
    if (document.getElementById("uploaded-img").width < 100) document.getElementById("uploaded-img").width = 100;
    if (document.getElementById("uploaded-img").width > window.screen.availWidth) document.getElementById("uploaded-img").width = window.screen.availWidth - 100;
};

function chooseProfilePic(functionAfterSuccess) {
    document.getElementById("profile-pic-elts").hidden = false;
    document.getElementById("initial-form").hidden = true;
    document.getElementById("saveBtn").onclick = function () {
        if (fileUpload.files[0]) {
            if (fileUpload.files[0].type.slice(0, 5) === "image") {
                fileRef = profilePicRef.child(fileUpload.files[0].name);
                fileRef.put(fileUpload.files[0]);
                document.getElementById("uploaded-img-elts").hidden = true;
                profilePictureBlank = false;
            }
            else alert("Only images allowed"); document.getElementById("file-upload-form").reset();
        }
        else if (profilePictureBlank) myProfilePicURL = "blank";

        database.ref("Users/" + auth.currentUser.uid).update({
            profilePicURL: myProfilePicURL
        }).then(() => {
            functionAfterSuccess();
        });
    };
}

fileUpload.onchange = function () {
    setProfileImage(fileUpload.files[0], false);
}

var myProfilePicURL;
var profilePictureBlank = true;

function setProfileImage(file, data_url) {
    if (file && !data_url) {
        document.getElementById("alert-info").hidden = false;
        document.getElementById("saveBtn").disabled = true;
        document.getElementById("saveBtn").style.color = "gray";
        fileRef = profilePicRef.child("temp_" + file.name);
        fileRef.put(file).then(() => {
            fileRef.getDownloadURL().then(url => {
                document.getElementById("profile-pic").src = url;
                document.getElementById("profile-pic").style.width = "170px";
                document.getElementById("alert-info").hidden = true;
                document.getElementById("saveBtn").disabled = false;
                document.getElementById("saveBtn").style.color = "black";
                myProfilePicURL = url;
            });
        });
    }
    if (!file && data_url) {
        myProfilePicURL = data_url;
    }
}

auth.onAuthStateChanged(function () {
    setInterval(function () {
        console.log("changed");
        if (auth.currentUser && !choosingProfilePic) {
            location.href = "redirector_index.html";
        }
    }, 1000);
});