import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

function Messages() {
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState([]);

  const [receiverId, setReceiverId] = useState("");
  const [listingId, setListingId] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [productName, setProductName] = useState("");

  const [text, setText] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [replyText, setReplyText] = useState("");

  /*
    Get current logged-in user's ID
    from JWT token.
  */
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return null;
      }

      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return Number(payload.sub);
    } catch (error) {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();


  /*
    Load all messages
  */
  const fetchMessages = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "https://sprint-1-hr8e.onrender.com/messages/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessages(response.data);

    } catch (error) {
      setError("Unable to load messages");
    }
  };


  /*
    If we came from ListingDetails,
    get receiver and product information
    automatically.
  */
  const loadListingInformation = async () => {
    const urlReceiverId =
      searchParams.get("receiver_id");

    const urlListingId =
      searchParams.get("listing_id");

    if (!urlReceiverId || !urlListingId) {
      return;
    }

    try {
      setReceiverId(urlReceiverId);
      setListingId(urlListingId);

      const response = await axios.get(
        `https://sprint-1-hr8e.onrender.com/listings/${urlListingId}`
      );

      const listing = response.data;

      setReceiverName(listing.seller);
      setProductName(listing.title);

    } catch (error) {
      setError("Unable to load product information");
    }
  };


  useEffect(() => {
    fetchMessages();
    loadListingInformation();
  }, []);


  /*
    Send NEW message
  */
  const sendMessage = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!receiverId || !listingId) {
      setError(
        "Please open a product and click Message Seller."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://sprint-1-hr8e.onrender.com/messages/",
        {
          receiver_id: Number(receiverId),
          listing_id: Number(listingId),
          messages: text
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setText("");

      setSuccess("Message sent successfully!");

      await fetchMessages();

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Unable to send message"
      );
    }
  };


  /*
    Group messages by:
    
    1. Listing
    2. Both users
    
    We sort the user IDs so that:

    User 5 -> User 2
    User 2 -> User 5

    become the SAME conversation.
  */
  const conversations = [];

  messages.forEach((message) => {

    const user1 = Math.min(
      message.sender_id,
      message.receiver_id
    );

    const user2 = Math.max(
      message.sender_id,
      message.receiver_id
    );

    const conversationId =
      `${user1}-${user2}-${message.listing_id}`;

    const existingConversation =
      conversations.find(
        (conversation) =>
          conversation.id === conversationId
      );

    if (existingConversation) {

      existingConversation.messages.push(message);

    } else {

      const otherUserId =
        message.sender_id === currentUserId
          ? message.receiver_id
          : message.sender_id;

      const otherUserName =
        message.sender_id === currentUserId
          ? message.receiver_name
          : message.sender_name;

      conversations.push({
        id: conversationId,

        otherUserId: otherUserId,

        otherUserName:
          otherUserName || "Student",

        listingId:
          message.listing_id,

        productName:
          message.listing_title ||
          `Listing #${message.listing_id}`,

        messages: [message]
      });
    }
  });


  /*
    Sort messages inside each conversation
    from oldest to newest.
  */
  conversations.forEach((conversation) => {
    conversation.messages.sort(
      (a, b) => a.id - b.id
    );
  });


  /*
    REPLY to existing conversation
  */
  const sendReply = async (conversation) => {

    if (!replyText.trim()) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://sprint-1-hr8e.onrender.com/messages/",
        {
          receiver_id: conversation.otherUserId,

          listing_id: conversation.listingId,

          messages: replyText
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReplyText("");

      setSuccess("Reply sent successfully!");

      await fetchMessages();

      /*
        Keep the conversation open.
      */
      setSelectedConversation(
        conversations.find(
          (item) =>
            item.id === conversation.id
        ) || conversation
      );

    } catch (error) {
      setError(
        error.response?.data?.detail ||
        "Unable to send reply"
      );
    }
  };


  return (
    <div className="messages-page">

      {/* HEADER */}

      <div className="messages-header">

        <div>

          <h1>
            Messages 💬
          </h1>

          <p>
            Chat with other students about listings.
          </p>

        </div>

      </div>


      {/* ERROR */}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      {/* SUCCESS */}

      {success && (
        <p className="success-message">
          {success}
        </p>
      )}


      {/* SEND NEW MESSAGE */}

      <div className="message-form">

        <h2>
          Send Message
        </h2>


        {receiverId && listingId ? (

          <>
            <p>
              <strong>
                Receiver:
              </strong>{" "}
              {receiverName || "Student"}
            </p>

            <p>
              <strong>
                Product:
              </strong>{" "}
              {productName || "Product"}
            </p>


            <form onSubmit={sendMessage}>

              <textarea
                placeholder="Write your message..."
                value={text}
                onChange={(e) =>
                  setText(e.target.value)
                }
                required
              />

              <button type="submit">
                Send Message
              </button>

            </form>
          </>

        ) : (

          <p>
            Open a product and click
            <strong> Message Seller </strong>
            to start a conversation.
          </p>

        )}

      </div>


      {/* CONVERSATIONS */}

      <div className="messages-list">

        <h2>
          Conversations
        </h2>


        {conversations.length === 0 ? (

          <p>
            No conversations yet.
          </p>

        ) : (

          conversations.map((conversation) => {

            const lastMessage =
              conversation.messages[
                conversation.messages.length - 1
              ];

            return (

              <div
                className="conversation-card"
                key={conversation.id}
                onClick={() =>
                  setSelectedConversation(
                    conversation
                  )
                }
              >

                <div>

                  <h3>
                    {conversation.otherUserName}
                  </h3>

                  <p>
                    Product:{" "}
                    {conversation.productName}
                  </p>

                  <p>
                    {lastMessage.messages}
                  </p>

                </div>

                <span>
                  💬
                </span>

              </div>

            );

          })

        )}

      </div>


      {/* OPEN CONVERSATION */}

      {selectedConversation && (

        <div className="conversation-window">

          {/* Conversation header */}

          <div className="conversation-header">

            <button
              onClick={() =>
                setSelectedConversation(null)
              }
            >
              ← Back
            </button>


            <div>

              <h2>
                {selectedConversation.otherUserName}
              </h2>

              <p>
                {selectedConversation.productName}
              </p>

            </div>

          </div>


          {/* Messages */}

          <div className="conversation-messages">

            {selectedConversation.messages.map(
              (message) => {

                const isMine =
                  message.sender_id ===
                  currentUserId;

                return (

                  <div
                    className={
                      isMine
                        ? "conversation-message mine"
                        : "conversation-message"
                    }
                    key={message.id}
                  >

                    <strong>
                      {isMine
                        ? "You"
                        : message.sender_name}
                    </strong>

                    <p>
                      {message.messages}
                    </p>

                  </div>

                );

              }
            )}

          </div>


          {/* REPLY */}

          <div className="reply-form">

            <textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) =>
                setReplyText(e.target.value)
              }
            />

            <button
              onClick={() =>
                sendReply(selectedConversation)
              }
            >
              Reply
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Messages;