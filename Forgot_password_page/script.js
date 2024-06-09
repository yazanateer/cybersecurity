function send_mail() {
    if(!false){ // we must add here to check if the mail not exist in the database so will sent a msg
        var status_msg = document.getElementById('sent_mail');
        status_msg.innerText = "error, the mail doesn't exist";
    }

}