let url;
let API = '5943394794:AAGuoAZEaXhVLUpNu3mpm4SdyzRQSMsyMbI';
let chatId;
let confirmed_chatid = false;
let confirmed_api = false;
let lastMessageId = 0; 

function submitID() {
    chatId = document.getElementById("idfield").value;
    confirmed_chatid = true;
    alert('Chat ID saved.');
}

function scheduleMessage() {
    if (confirmed_chatid) {
        let text = document.getElementById('textMessage').value;
        let fullUrl = 'https://api.telegram.org/bot' + API + '/sendMessage' + '?chat_id=' + chatId + '&text=' + text ;
        fetch(fullUrl, {method: 'POST'});
        console.log('Message sent.');
        document.getElementById('textMessage').value = "";
    } else {
        alert('Please Confirm The ChatId.');
    }
}
function checkForMessages() {
    fetch('https://api.telegram.org/bot' + API + '/getUpdates')
        .then(response => response.json())
        .then(data => {
            if (data.result && data.result.length > 0) {
                data.result.forEach(message => {
                    const sentAt = new Date(message.message.date * 1000); 
                    const sentDate = sentAt.toLocaleDateString();
                    const sentTime = sentAt.toLocaleTimeString();

                    if (message.update_id > lastMessageId) {
                        lastMessageId = message.update_id;
                        if (message.message.photo) {
                            const photo = message.message.photo.pop(); // Get the last photo, which should be the largest one
                            receiveImage(photo.file_id, message.message.chat.id, sentDate, sentTime);
                        } else {
                            receiveMessage(message.message.text, message.message.chat.id, sentDate, sentTime);
                        }
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching messages:', error));
}

function receiveMessage(message, chatId, sentDate, sentTime) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    messageElement.innerText = '[' + chatId + '] ' + sentDate + ' | ' + sentTime  + ' - ' + message
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


function receiveImage(fileId, chatId, sentDate, sentTime) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerText = '[' + chatId + '] ' + sentDate + ' | ' + sentTime  + ' - Image';

    const imageElement = document.createElement('img');
    imageElement.classList.add('message');
    imageElement.src = 'https://api.telegram.org/file/bot' + API + '/' + getFilePath(fileId);

    chatContainer.appendChild(messageElement);
    chatContainer.appendChild(imageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function getFilePath(fileId) {
    return fetch('https://api.telegram.org/bot' + API + '/getFile?file_id=' + fileId)
        .then(response => response.json())
        .then(data => {
            return data.result.file_path;
        })
        .catch(error => {
            console.error('Error getting file path:', error);
            return '';
        });
}



function clearChat() {
    const params = {
        peer: { _: 'inputPeerChat', chat_id: chatId }, 
        min_date: 0, 
        max_date: Math.floor(Date.now() / 1000), 
        just_clear: true, 
    };

    fetch('https://api.telegram.org/bot' + API + '/messages.deleteHistory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })
    .then(response => response.json())
    .then(data => {
        if (data && data._ === 'messages.affectedHistory') {
            alert('Der Chatverlauf wurde erfolgreich gelöscht.');
        } else {
            alert('Fehler beim Löschen des Chatverlaufs.');
        }
    })
    .catch(error => console.error('Error deleting chat history:', error));
}


setInterval(checkForMessages, 1000);
