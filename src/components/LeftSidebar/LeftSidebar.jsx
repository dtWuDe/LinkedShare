import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";
import { getUserDatabyEmail } from "../../../business/services";
import { AppContext } from "../../context/Appcontext";
import "./LeftSidebar.css";

const truncate = (str, n) => (str.length > n ? str.slice(0, n) + "..." : str);

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user, chatData, addChatUser } = useContext(AppContext);
    const [showSearch, setShowSearch] = useState(false);
    const [usersRef, setUsersRef] = useState(null);
    const debounceTimeout = useRef(null);

    if (!user) {
        navigate("/login");
        return null; // Ensure user is defined before rendering
    }

    const inputHandler = (e) => {
        const value = e.target.value;
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(async () => {
            try {
                if (!value) {
                    setUsersRef(null);
                    setShowSearch(false);
                    return;
                }
                setShowSearch(true);
                const result = await getUserDatabyEmail(value);
                if (result.user && result.user.id !== user.id) {
                    setUsersRef(result);
                } else {
                    setUsersRef(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }, 500);
    };

    const addChat = () => {
        if (usersRef?.user) {
            addChatUser(usersRef.user);
            setUsersRef(null);
            setShowSearch(false);
        }
    };

    const renderUser = (userObj, onClick, key) => (
        <div key={key} onClick={onClick} className="friends">
            <img src={assets.profile_img} alt="" />
            <div>
                <p>{truncate(userObj.username, 15)}</p>
                <span>{userObj.email}</span>
            </div>
        </div>
    );

    return (
        <div className="ls">
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className="logo" alt="Logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="Menu" />
                        <div className="sub-menu">
                            <p>Edit profile</p>
                            <hr />
                            <p>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="Search" />
                    <input onChange={inputHandler} type="text" placeholder="Search here.." />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && usersRef?.user
                    ? renderUser(usersRef.user, addChat)
                    : chatData.map((u, i) => renderUser(u, null, u.id || i))}
            </div>
        </div>
    );
};

export default LeftSidebar;
