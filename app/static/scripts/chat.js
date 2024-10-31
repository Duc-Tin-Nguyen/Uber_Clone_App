

var socket = io.connect('http://' + document.domain + ':' + location.port);

function displayMessage(messageData) {
            var chatHistory = document.getElementById('chat-history');
            var messageElement = document.createElement('p');
            var senderInfo = `${messageData.sender} (${messageData.role})`;
            
            messageElement.textContent = `${senderInfo}: ${messageData.message} (${messageData.timestamp})`;
            chatHistory.appendChild(messageElement);
        }


        function isDuplicateMessage(messageData) {
            var chatHistory = document.getElementById('chat-history');
            var messages = chatHistory.getElementsByTagName('p');

            for (var i = 0; i < messages.length; i++) {
                if (messages[i].textContent === `${messageData.sender}: ${messageData.message} (${messageData.timestamp})`) {
                    return true; 
                }
            }

            var messageInput = document.getElementById('message-input');
            var currentMessage = `${messageData.sender}: ${messageInput.value.trim()} (${messageData.timestamp})`;

            if (currentMessage === `${messageData.sender}: ${messageData.message} (${messageData.timestamp})`) {
                return true; 
            }

            return false; 
        }

        function sendMessage() {
            var messageInput = document.getElementById('message-input');
            var message = messageInput.value.trim();

            if (message !== '') {
                var messageData = {
                    sender: '{{ user.username }}',
                    role: '{{ user.role }}',  
                    receiver: 'driver', 
                    message: message,
                    timestamp: new Date().toLocaleString(),
                    ride_id: '{{ ride_id }}'
                };

                socket.emit('send_message', messageData);

                if (!isDuplicateMessage(messageData)) {
                    displayMessage(messageData);
                }

                messageInput.value = '';
            }
        }

        socket.on('receive_message', function (messageData) {
            if (!isDuplicateMessage(messageData)) {
                displayMessage(messageData);
            }
        });

        function redirectToPayment() {
            var urlParams = new URLSearchParams(window.location.search);
            var tripCost = urlParams.get('trip_cost');

            if (tripCost !== null) {
                window.location.href = '/payment?trip_cost=' + tripCost;
            } else {
                alert('Trip cost not available. Cannot proceed to payment.');
            }
        }
