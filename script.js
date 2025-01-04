var i = 0;
var mediaRecorder;
var chunks = [];
var x;

function startClock() {
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    document.getElementById("hour").innerHTML = hours + ":";
    document.getElementById("minute").innerHTML = minutes + ":";
    document.getElementById("second").innerHTML = seconds;

    x = setInterval(function() {
        seconds += 1;
        if (seconds == 60) {
            seconds = 0;
            minutes += 1;
        }
        if (minutes == 60) {
            seconds = 0;
            minutes = 0;
            hours += 1;
        }
        document.getElementById("hour").innerHTML = hours + ":";
        document.getElementById("minute").innerHTML = minutes + ":";
        document.getElementById("second").innerHTML = seconds;
    }, 1000);
}

function stopClock() {
    clearInterval(x);
}

const decrypt = async (formData) => {
    const response = await fetch("encrypt.php", {
        method: "POST",
        body: formData,
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", response.headers);

    if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("text/plain") !== -1) {
            const errorMessage = await response.text();
            if (errorMessage.includes("An error occurred during the encryption/decryption process")) {
                alert("The password for this file is invalid! Please try again.");
            } else {
                document.getElementById("error").innerHTML = errorMessage;
            }
        } else {
            const decryptedBlob = await response.blob();
            const decryptedUrl = URL.createObjectURL(decryptedBlob);

            if (decryptedBlob.type == "text/plain") {
                const text = await response.text();
                if (text.includes("An error occurred")) {
                    alert("The password for this file is invalid! Please try again.");
                }
            } else {
                const link = document.createElement('a');
                link.href = decryptedUrl;
                link.download = 'decrypted_audio.opened_vault.wav';
                document.body.appendChild(link); 
                link.click(); 
                document.body.removeChild(link);
                URL.revokeObjectURL(decryptedUrl);
            }
        }
    } else {
        console.error("Failed to decrypt audio file.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file");

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const password = document.getElementById("passwd").value;

            if (password == "") {
                alert("Please enter a password.");
                return;
            } else {
                const formData = new FormData();
                formData.append("audio", file);
                formData.append("passwd", password);
                formData.append("type", "decrypt");

                decrypt(formData);
            }
        }
    });
});

const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            if (document.getElementById("passwd").value == "") {
                alert("Please enter a password and then re-record!");
            } else {
                const formData = new FormData();
                formData.append("audio", blob, "recording.wav");
                formData.append("passwd", document.getElementById("passwd").value);
                formData.append("type", "encrypt");

                const response = await fetch("encrypt.php", {
                    method: "POST",
                    body: formData,
                });

                console.log("Response Status:", response.status);
                console.log("Response Headers:", response.headers);

                if (response.ok) {
                    const encryptedBlob = await response.blob();
                    const encryptedUrl = URL.createObjectURL(encryptedBlob);
                    const link = document.createElement('a');
                    link.href = encryptedUrl;
                    link.download = 'encrypted_audio.vault';
                    document.body.appendChild(link); 
                    link.click(); 
                    document.body.removeChild(link);
                    URL.revokeObjectURL(encryptedUrl);
                } else {
                    console.error("Failed to encrypt audio file.");
                }
            }
        }

        console.log("Recording started...");
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
}

const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        console.log("Recording stopped...");
    }
}

function recording() {
    if (i == 0) {
        document.getElementById("record").classList.add("hidden");
        document.getElementById("stop_record").classList.remove("hidden");  
        document.getElementById('record1').classList.remove('hidden');
        document.getElementById('timer').classList.remove('hidden');
        startRecording();
        startClock();
        i = 1; 
    } else if (i == 1) {
        document.getElementById("stop_record").classList.add("hidden");
        document.getElementById("record").classList.remove("hidden");
        document.getElementById('record1').classList.add('hidden');
        document.getElementById('timer').classList.add('hidden');
        stopRecording();
        stopClock();
        i = 0;
    }
}