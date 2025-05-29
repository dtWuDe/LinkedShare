import { useEffect } from "react";
import { createContext, useState } from "react";
import { getUserData,logoutUser } from "../../business/services";
export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState([]); 
    const [user, setUser] = useState(null);
    const [activeChat, setActiveChat] = useState(null);

    const addChatUser = (userObj) => {
        setChatData(prev => {
            const exists = prev.find(u => u.id === userObj.id);
            return exists ? prev : [...prev, userObj];
        });
        setActiveChat(userObj);
    };

    // Mimic onAuthStateChanged using localStorage/session
    useEffect(() => {
    const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (user) => {
        // console.log(userData);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = () => {
        logoutUser();
        setActiveChat(null);
        setUser(null);
        setChatData([]);
        localStorage.removeItem('user');
    };

    const loadUserData = async (uid) => {
        try {
            const userSnap = await getUserData(uid);
            console.log(userSnap);
        } catch (error) {
            console.error(error);
        }
    }
    const value = {
        userData,setUserData,
        chatData,setChatData,
        user, setUser,
        login, logout,
        loadUserData,
        activeChat, setActiveChat,
        addChatUser
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;