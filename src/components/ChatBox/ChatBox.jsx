import React, { useEffect, useState, useContext, useRef } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/Appcontext";
import {
    insertMessage,
    getMessages,
    getSignature,
} from "../../../business/services";
import {
    encryptMessage,
    signMessage,
    decryptMessage,
    verifyMessage,
    encryptMessageWithAES,
    decryptMessageWithAES,
} from "../../utils/crypto";

const ChatBox = () => {
    const { user, activeChat } = useContext(AppContext);
    const [selectedImage, setSelectedImage] = useState(null);
    const [chatData, setChatData] = useState([]);
    const inputRef = useRef(null);
    const [showAESForm, setShowAESForm] = useState(false);
    const [aesKey, setAesKey] = useState("");
    const [symmetricDecrypt, setSymmetricDecrypt] = useState(false);
    const [msgIndexToDecrypt, setMsgIndexToDecrypt] = useState(null);

    // Fetch messages when chat changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!user || !activeChat) return;
            try {
                const data = await getMessages(user.id, activeChat.id);
                setChatData(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();
    }, [user, activeChat]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const message = inputRef.current.value.trim();
        if (!message && !selectedImage) return;

        const isSigned = document.getElementById("Sign").checked;
        const msgformData = new FormData();
        msgformData.append("uid", user.id);
        msgformData.append("rcv", activeChat.id);
        msgformData.append("isSigned", isSigned);
        if (selectedImage) msgformData.append("attachment", selectedImage);

        if (isSigned) {
            const encryptedMessage = await encryptMessage(
                message,
                activeChat.publicKey
            );
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".key,.pem";
            input.onchange = async (event) => {
                const privateKeyFile = event.target.files[0];
                if (!privateKeyFile) return;
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const privateKey = e.target.result;
                    const signature = await signMessage(message, privateKey);
                    msgformData.append("msg", encryptedMessage);
                    msgformData.append("signature", signature);
                    try {
                        await insertMessage(msgformData);
                        setSelectedImage(null);
                        inputRef.current.value = "";
                    } catch (error) {
                        console.error("Error sending message:", error);
                    }
                };
                reader.readAsText(privateKeyFile);
            };
            input.click();
        } else {
            setShowAESForm(true);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        document.getElementById("image").value = "";
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);
    };

    const handleDecrypt = async (e, msg, idx) => {
        e.preventDefault();
        if (msg.isSigned) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".key,.pem";
            input.onchange = async (event) => {
                const privateKeyFile = event.target.files[0];
                if (!privateKeyFile) return;
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const privateKey = e.target.result;
                    try {
                        const decryptedMessage = await decryptMessage(
                            msg.message,
                            privateKey
                        );
                        setChatData((prev) =>
                            prev.map((m, i) =>
                                i === idx ? { ...m, decryptedMsg: decryptedMessage } : m
                            )
                        );
                    } catch (error) {
                        console.error("Error decrypting message:", error);
                    }
                };
                reader.readAsText(privateKeyFile);
            };
            input.click();
        } else {
            setSymmetricDecrypt(true);
            setMsgIndexToDecrypt(idx);
            setShowAESForm(true);
        }
    };

    const handleVerify = (e, msg) => {
        e.preventDefault();
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".key,.pem";
        input.onchange = async (event) => {
            const publicKeyFile = event.target.files[0];
            if (!publicKeyFile) return;
            const reader = new FileReader();
            reader.onload = async (e) => {
                const publickey = e.target.result;
                const decryptedMessage = msg.decryptedMsg;
                const res = await getSignature(msg._id);
                const signatureData = res[0];
                if (signatureData._id === msg.signature) {
                    try {
                        const verified = await verifyMessage(
                            decryptedMessage,
                            signatureData.signature,
                            publickey
                        );
                        alert(verified ? "Signature valid" : "Signature invalid");
                    } catch (error) {
                        console.error("Error verifying message:", error);
                    }
                }
            };
            reader.readAsText(publicKeyFile);
        };
        input.click();
    };

    const handleAESSubmit = async (e) => {
        e.preventDefault();

        if (!symmetricDecrypt) {
            const message = inputRef.current.value.trim();
            if (!message || !aesKey) return;

            try {
                const encryptedMessage = await encryptMessageWithAES(message, aesKey);
                const msgformData = new FormData();
                msgformData.append("uid", user.id);
                msgformData.append("rcv", activeChat.id);
                msgformData.append("msg", encryptedMessage);
                msgformData.append("isSigned", false);
                msgformData.append("signature", null);
                if (selectedImage) msgformData.append("attachment", selectedImage);

                await insertMessage(msgformData);
                setSelectedImage(null);
                inputRef.current.value = "";
                setAesKey("");
                setShowAESForm(false);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        } else {
            try {
                const msgToDecrypt = chatData[msgIndexToDecrypt];
                if (!msgToDecrypt || !aesKey) return;
                const decryptedMessage = await decryptMessageWithAES(
                    msgToDecrypt.message,
                    aesKey
                );
                setChatData((prev) =>
                    prev.map((m, i) =>
                        i === msgIndexToDecrypt ? { ...m, decryptedMsg: decryptedMessage } : m
                    )
                );
                setAesKey("");
                setShowAESForm(false);
                setSymmetricDecrypt(false);
            } catch (error) {
                console.error("Error decrypting message:", error);
                alert("Decryption failed. Please check your AES key.");
            }
        }
    };

    if (!user || !activeChat) {
        return <div className="chat-box"></div>;
    }

    return (
        <div className="chat-box">
            <div className="chat-user">
                <img src={assets.profile_img} alt="" />
                <p>
                    {activeChat.username.length > 15
                        ? `${activeChat.username.slice(0, 15)}...`
                        : activeChat.username}
                    <img className="dot" src={assets.green_dot} alt="" />
                </p>
                <img src={assets.help_icon} className="help" alt="" />
            </div>
            <div className="chat-msg">
                {chatData.map((msg, index) => (
                    <div
                        className={msg.sender === user.id ? "s-msg" : "r-msg"}
                        key={index}
                    >
                        <div className="sub-menu">
                            <p onClick={(e) => handleDecrypt(e, msg, index)}>Decrypt</p>
                            <hr />
                            {msg.isSigned && (
                                <p onClick={(e) => handleVerify(e, msg)}>Verify</p>
                            )}
                        </div>
                        <p className="msg">
                            {msg.decryptedMsg ? msg.decryptedMsg : msg.message}
                        </p>
                        <div>
                            <img src={assets.profile_img} alt="" />
                        </div>
                    </div>
                ))}
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
                <input type="text" placeholder="Send a message" ref={inputRef} />
                <input
                    type="file"
                    id="image"
                    accept="image/png, image/gif, image/jpeg"
                    hidden
                    onChange={handleImageChange}
                />
                {selectedImage && (
                    <div className="selected-image">
                        <span>
                            {selectedImage.name.length > 12
                                ? selectedImage.name.slice(0, 12) + "..."
                                : selectedImage.name}
                            <button
                                className="remove-image-btn"
                                type="button"
                                onClick={handleRemoveImage}
                            >
                                x
                            </button>
                        </span>
                    </div>
                )}
                <label>
                    <input className="send-key-checkbox" type="checkbox" id="Sign" />
                    <span>Send key?</span>
                </label>
                <label htmlFor="image">
                    <img src={assets.gallery_icon} className="gallery" alt="" />
                </label>
                <button
                    type="submit"
                    style={{ background: "none", border: "none", padding: 0 }}
                >
                    <img src={assets.send_button} alt="" />
                </button>
            </form>

            {showAESForm && (
                <div className="aes-form-overlay">
                    <div className="aes-form">
                        <h4>
                            {symmetricDecrypt
                                ? "Enter AES Key to Decrypt"
                                : "Enter AES Key to Encrypt"}
                        </h4>
                        <form onSubmit={handleAESSubmit}>
                            <input
                                type="text"
                                placeholder="AES Key"
                                value={aesKey}
                                onChange={(e) => setAesKey(e.target.value)}
                                style={{
                                    WebkitTextSecurity: "disc",
                                    MozTextSecurity: "disc",
                                }}
                            />
                            <div style={{ marginTop: "10px" }}> 
                                <button type="submit">
                                    {symmetricDecrypt ? "Decrypt" : "Encrypt"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAESForm(false);
                                        setSymmetricDecrypt(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBox;
