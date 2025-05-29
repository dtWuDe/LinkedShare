const BASE_URL = 'https://localhost:3001/api/';

const toJSON = (formData) => {
    const obj = {};
    formData.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${BASE_URL}auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return response.json();
};

export const logoutUser = async () => {
    const response = await fetch(`${BASE_URL}auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    return response.json();
}

export const registerUser = async (formData) => {
    const data = toJSON(formData);
    const file = formData.get('publicKey');
    if (file) {
        const fileContent = await file.text();
        data.publicKey = fileContent;
    }
    const response = await fetch(`${BASE_URL}auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getUserData = async (uid) => {
    const response = await fetch(`${BASE_URL}getdb/getUserData`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
    });
    return response.json();
};

export const getUserDatabyEmail = async (email) => {
    const response = await fetch(`${BASE_URL}getdb/getUserDatabyEmail`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        // Optionally, you can throw a more descriptive error
        const text = await response.text();
        throw new Error(text || `Error: ${response.status}`);
    }
    return response.json();
};

export const insertMessage = async (formData) => {
    const data = toJSON(formData);
    const response = await fetch(`${BASE_URL}getdb/insertMessage`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const insertMessagewithSignature = async (formData) => {
    const data = toJSON(formData);
    const file = formData.get('privateKeyFile');
    if (file) {
        const fileContent = await file.text();
        data.privateKeyFile = fileContent;
    }
    const response = await fetch(`${BASE_URL}getdb/inserMessagewithSignature`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getMessages = async (sender, receiver) => {
    const response = await fetch(
        `${BASE_URL}getdb/messages?sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}`,
        {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        }
    );
    return response.json();
};

export const getSignature = async (msgid) => {
    const response = await fetch(
        `${BASE_URL}getdb/signature?msgid=${encodeURIComponent(msgid)}`,
        {
            method: 'GET',
            // credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        }
    );
    return response.json();
};
