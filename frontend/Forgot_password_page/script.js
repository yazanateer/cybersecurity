function send_mail() {
    if(!false){ // we must add here to check if the mail not exist in the database so will sent a msg
        var status_msg = document.getElementById('sent_mail');
        status_msg.innerText = "error, the mail doesn't exist";
    }

    if(true) { //if the mail is exist in the database then goto the recover page
        window.open("http://127.0.0.1:3000/Forgot_password_page/recovery.html");
    }

}


window.open("http://127.0.0.1:3000/Forgot_password_page/recovery.html");