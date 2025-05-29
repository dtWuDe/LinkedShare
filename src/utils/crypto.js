function pemToArrayBuffer(pem) {
    const base64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '');   
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function encryptMessage(message, pem) {
    const publicKeyBuffer = pemToArrayBuffer(pem);
    const key = await crypto.subtle.importKey(
        'spki',                     
        publicKeyBuffer,
        {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
        },
        false,
        ['encrypt']
    );

    const encoded = new TextEncoder().encode(message);
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        key,
        encoded
    );

    return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
}

export async function signMessage(message, pem) {
    const privateKeyBuffer = pemToArrayBuffer(pem);
    
    const key = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        false,
        ['sign']
    );

    const encoded = new TextEncoder().encode(message);

    const signatureBuffer = await crypto.subtle.sign(
        { name: 'RSASSA-PKCS1-v1_5' },
        key,
        encoded
    );

    return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
}

export async function decryptMessage(encryptedMessage, pem) {
    const privateKeyBuffer = pemToArrayBuffer(pem);
    const key = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        false,
        ['decrypt']
    );

    const encryptedBuffer = Uint8Array.from(atob(encryptedMessage), (c) => c.charCodeAt(0));
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        key,
        encryptedBuffer
    );
    
    return new TextDecoder().decode(decryptedBuffer);
}

export async function verifyMessage(message, signature, pem) {
    
    const publicKeyBuffer = pemToArrayBuffer(pem);
    const key = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        false,
        ['verify']
    );
    const encoded = new TextEncoder().encode(message);
    const signatureBuffer = Uint8Array.from(atob(signature), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify(
        { name: 'RSASSA-PKCS1-v1_5' },
        key,
        signatureBuffer,
        encoded
    );
}

export async function encryptMessageWithAES(plaintext, base64Key) {
    const encoder = new TextEncoder();
    const keyBuffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    console.log("Key buffer: ", keyBuffer);
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        'AES-GCM',
        false,
        ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoder.encode(plaintext)
    );

    // Combine IV + ciphertext
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
}


export async function decryptMessageWithAES(encryptedMessage, base64Key) {
    const combinedBuffer = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    const iv = combinedBuffer.slice(0, 12); // First 12 bytes are the IV
    const ciphertext = combinedBuffer.slice(12); // The rest is the ciphertext

    const keyBuffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        'AES-GCM',
        false,
        ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
}