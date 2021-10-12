// Database setup
var database = firebase.database();
var storageRef = firebase.storage().ref("files");
var auth = firebase.auth();

var attach, fileUpload, messages, msgPos, msgVals, txtElt, img_selected, cancelledUpload, choosingFile;
// Connection indicators
var noConnectionTimer = 0;
var shownHelloGif = false;
var msgInQueue = [];
var connectingPAdded = false;
var connectingP = document.createElement("p");
connectingP.innerText = "Connecting to database...";
var loading_show = false;
var choosingFile = false;
var fileAboutToUploadState = false;
var allMessages = "initialization";
var directHelloShow = true;
var initMsgAnimShown = false;

cancelledUpload = false;

fileUpload = document.getElementById("file-upload");
filePath = document.getElementById("spnFilePath");

uploadLocallyBtn = document.getElementById("imgFileUpload");
uploadLocallyBtn.hidden = true;
uploadLocallyBtn.onclick = function () {
    fileUpload.click();
    cancelledUpload = false;
    choosingFile = true;
};
uploadToDatabaseBtn = document.getElementById("upload-btn");
uploadToDatabaseBtn.onclick = function () {
    loading_show = true;
    fileRef = storageRef.child(fileUpload.files[0].name);
    fileRef.put(fileUpload.files[0]).then(() => {
        getNoOfMessages(function (noOfMsg) {
            console.log(noOfMsg);
            uploadMessage(noOfMsg + 1);
        });
    });
    uploadedImgElts.hidden = true;
    imgFileUpload.src = "attachment.png";
    filePath.innerHTML = "";
    uploadLocallyBtn.hidden = false;
    document.getElementById("uploaded-img").src = "";
    document.getElementById("uploaded-img").alt = "";
    cancelledUpload = true;
    fileAboutToUploadState = false;
};

function getNoOfMessages(functionToCall) {
    database.ref("messages").get().then((data) => {
        var messages = 0;
        if (data.exists()) for (const i in data.val()) messages += 1;
        console.log(messages);
        functionToCall(messages);
    });
}

function uploadMessage(msgNo) {
    console.log(msgNo);
    var myName;
    database.ref(auth.currentUser.uid).get().then((data) => {
        myName = data.val();
    });
    storageRef.child(fileUpload.files[0].name).getDownloadURL().then(url => {
        database.ref("messages/" + msgNo).update({
            fileURL: url,
            fileName: fileUpload.files[0].name,
            sentBy: auth.currentUser.uid
        }).then(() => {
            loading_show = false;
            var succesDiv = document.createElement("div");
            succesDiv.innerHTML = `
                <div class="alert" style="font-size: 30px;">
                    <span class="closebtn"  style="font-size: 30px;" onclick="this.parentElement.style.display='none';">&times;</span>
                    File uploaded successfully
                </div>
            `;
            document.body.appendChild(succesDiv);
        });
    });
}

uploadedImgElts = document.getElementById("uploaded-img-elts");
document.getElementById("cncl-btn").onclick = function () {
    uploadedImgElts.hidden = true;
    imgFileUpload.src = "attachment.png";
    filePath.innerHTML = "";
    uploadLocallyBtn.hidden = false;
    document.getElementById("uploaded-img").src = "";
    document.getElementById("uploaded-img").alt = "";
    document.getElementById("file-upload-form").reset();
    cancelledUpload = true;
    fileAboutToUploadState = false;
};

auth.onAuthStateChanged(() => {
    if (!connectingPAdded) {
        connectingP.innerText = "Authenticating user.."
        document.body.appendChild(connectingP);
        connectingPAdded = true;
        setTimeout(() => {
            if (auth.currentUser) setInterval(function () {
                refreshMsgSet();
            }, 50);
            else {
                fileUpload.style.display = "none";
                filePath.style.display = "none";
                uploadLocallyBtn.style.display = "none";
                uploadToDatabaseBtn.style.display = "none";
                document.getElementById("msg-box").style.display = "none";
                document.getElementById("send-btn").style.display = "none";
                loading_show = true;
                setTimeout(() => {
                    location.href = "redirector_index.html";
                }, 2000);
            }
        }, 3000);
    }
});

function addMessage(addedMsg, msgNo) {
    console.log("updateChat");
    msgInQueue.push(addedMsg);
    document.getElementById("msg-box").value = "";
    var myName;
    database.ref("Users/" + auth.currentUser.uid + "/name").get().then((data) => {
        myName = data.val();
        console.log(myName);
        database.ref("messages/" + msgNo).update({
            msg: addedMsg,
            sentBy: auth.currentUser.uid
        }).then(() => {
            refreshMsgSet();
            // window.scrollTo(0, document.documentElement.scrollHeight);
        });
    });

}

var sentByName;
var firstLoad = true;

function refreshMsgSet() {
    if (auth.currentUser) {
        database.ref("messages").get().then((allMsgData) => {
            if (JSON.stringify(allMessages) !== JSON.stringify(allMsgData.val())) {
                if (allMessages !== "initialization" && JSON.stringify(allMessages) !== null && allMsgData.val() === null) location.reload();
                allMessages = allMsgData.val();
                document.getElementById("messages").innerHTML = "";
                msgData = allMsgData.val();
                for (const j in msgData) {
                    const msg = msgData[j];
                    var message;
                    if (msg.fileURL && msg.fileName) {
                        console.log(msg.sentBy);
                        var msgSenderId = msg.sentBy;
                        console.log(msgSenderId);
                        database.ref("Users/" + msgSenderId + "/name").get().then((data) => {
                            var userName = data.val();
                            console.log(userName);
                            if (userName.length > 15) sentByName = userName.slice(0, 15) + " ...";
                            else sentByName = userName;

                            message = document.createElement("a");
                            message.href = msg.fileURL;
                            if (msg.fileName.length > 15) fileName = msg.fileName.slice(0, 15) + " ...";
                            else fileName = msg.fileName;
                            message.innerHTML = sentByName + "<br> Open file: " + fileName;
                            message.target = "_blank";
                            document.getElementById("messages").appendChild(message);
                            message.className = "msg";

                            if (firstLoad) {
                                console.log("scroll", message);
                                window.scrollTo(0, document.documentElement.scrollHeight);
                                firstLoad = false;
                            }

                        });
                    }
                    else if (msg.msg) {
                        var msgSenderId = msg.sentBy;
                        console.log(msgSenderId);
                        database.ref("Users/" + msgSenderId + "/name").get().then((data) => {
                            var userName = data.val();
                            console.log(userName);
                            if (userName.length > 15) sentByName = userName.slice(0, 15) + " ...";
                            else sentByName = userName;
                            message = document.createElement("p");
                            message.innerHTML = `<div style="font-size: 50%">` + sentByName + ` </div> ` + msg.msg;
                            document.getElementById("messages").appendChild(message);
                            message.className = "increasing-size-msg";
                            message.className = "msg";

                            if (firstLoad) {
                                console.log("scroll");
                                window.scrollTo(0, document.documentElement.scrollHeight);
                                firstLoad = false;
                            }
                        });
                    }
                    if (parseInt(j) === msgData.length) for (var i = 0; i < 10; i++) document.getElementById("messages").appendChild(document.createElement("br"));
                }
            }
            if (!allMsgData.exists()) {
                setInterval(showHelloGif, 1000);
            }
        });
    }
}

function showHelloGif() {
    database.ref("messages").get().then((data) => {
        if (!data.exists() && !document.getElementById("no-msg-info")) {
            console.log("gif");
            var randomHelloGifNumber = randomNo(0, 3);
            var allHelloGifs = ["hello.gif", "hello-2.gif", "hello-3.webp", "hello-4.gif"];
            no_message_info = document.createElement("p");
            no_message_info.innerHTML = `
                    no messages yet.. <br>
                    Start chatiting by saying <br> <button onclick="sendHello();" id="helloBtn"> Hello </button> <br><br>
                    <img src=` + allHelloGifs[randomHelloGifNumber] + ` id="hello-gif" width=200 />
                `;
            no_message_info.id = "no-msg-info";
            document.body.appendChild(no_message_info);
        }
    });
}

function randomNo(min, max) { return Math.round(Math.random() * (max - min)); }

fileUpload.onchange = function () {
    if (fileUpload.files[0] && !cancelledUpload && choosingFile) {
        fileAboutToUploadState = true;
        var fileName = fileUpload.value.split('\\')[fileUpload.value.split('\\').length - 1];
        filePath.innerHTML = "<b> Selected File: </b>" + fileName;

        // showing an image if it is an image
        if (fileUpload.files[0].type.slice(0, 5) === "image") {
            document.getElementById("uploaded-img-txt-img").hidden = false;
            document.getElementById("uploaded-img").src = URL.createObjectURL(fileUpload.files[0]);
            document.getElementById("uploaded-img").alt = fileName;
        }
        uploadLocallyBtn.hidden = true;
        uploadedImgElts.hidden = false;
    }
}

document.getElementById("uploaded-img").onload = function () {
    if (document.getElementById("uploaded-img").width < 100) document.getElementById("uploaded-img").width = 100;
    if (document.getElementById("uploaded-img").width > window.screen.availWidth) document.getElementById("uploaded-img").width = window.screen.availWidth - 100;
};

checkConnection();
function checkConnection() {
    setTimeout(function () {
        // Check if we are connected to the internet or not.
        var connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", function (snap) {
            connected = snap.val();
            if (connected) {
                noConnectionTimer = 0;
                if (!fileAboutToUploadState) {
                    uploadLocallyBtn.hidden = false;
                }
                loading_show = false;
                if (connectingPAdded) {
                    document.body.removeChild(connectingP);
                    connectingPAdded = false;
                }
                if (fileAboutToUploadState) {
                    fileUpload.hidden = false;
                    filePath.hidden = false;
                    uploadToDatabaseBtn.hidden = false;
                    uploadedImgElts.hidden = false;
                    document.getElementById("cncl-btn").hidden = false;
                }
            }
            else {
                uploadLocallyBtn.hidden = true;
                fileUpload.hidden = true;
                filePath.hidden = true;
                uploadToDatabaseBtn.hidden = true;
                uploadedImgElts.hidden = true;
                document.getElementById("cncl-btn").hidden = true;

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

function sendMessage(event, directThrow) {
    if (document.getElementById("msg-box").value !== "") {
        if (!directThrow) {
            if ((event.keyCode === 13 && !event.shiftKey)) {
                event.preventDefault();
                console.log("msg sent");
                getNoOfMessages(function (noOfMsg) {
                    msgNo = noOfMsg + 1;
                    addMessage(document.getElementById("msg-box").value, msgNo);
                });
                if (document.getElementById("no-msg-info")) document.getElementById("no-msg-info").innerHTML = "";
            }
        }
        else {
            getNoOfMessages(function (noOfMsg) {
                msgNo = noOfMsg + 1;
                addMessage(document.getElementById("msg-box").value, msgNo);
            });
            if (document.getElementById("no-msg-info")) document.getElementById("no-msg-info").innerHTML = "";
        }
    }
    else {
        // show alert
    }
}

function sendHello() {
    console.log("helloSent");
    no_message_info.innerHTML = "";
    addMessage("Hello", 1, true);
}

window.onload = function () {
    var styling = document.createElement("style");
    styling.innerHTML = `
        #send-btn {
            transition: 1.2s;
            background-color: red;
            border: solid yellowgreen;
            border-radius: 50%;
            border-style: dashed;
            border-width: 5px;
            position: fixed;
            margin-left: 84%;
            bottom: 9%;
        }
        #logout-btn {
            transition: 2.3s;
            position: fixed;
            margin-left: 95%;
            top: 5%;
        }
    `;
    document.body.appendChild(styling);
}

function signOutMe() {
    auth.signOut().then(() => {
        alert("You successfully signed out of your account!");
        location.href = "redirector_index.html";
    });
}

auth.onAuthStateChanged(function () {
    setInterval(function () {
        console.log("changed");
        if (!auth.currentUser) {
            location.href = "redirector_index.html";
        }
    }, 1000);
});