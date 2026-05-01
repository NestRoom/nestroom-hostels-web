export const getAccessToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

export const getRefreshToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('refreshToken');
    }
    return null;
};

export const setTokens = (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }
};

export const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
};

export const isAuthenticated = () => {
    return typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const secureFetch = async (url, options = {}) => {
    // Substitute hardcoded localhost with env variable if present, 
    // or prepend API_URL if it's a relative path
    const normalizedUrl = url.startsWith('') 
        ? url.replace('', API_URL)
        : url.startsWith('/') 
            ? `${API_URL}${url}` 
            : url;

    const accessToken = getAccessToken();
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
    };

    let response = await fetch(normalizedUrl, { ...options, headers });

    if (response.status === 401) {
        // Try to refresh token
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            try {
                const refreshRes = await fetch(`${API_URL}/v1/auth/refresh-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    setTokens(data.data.accessToken, data.data.refreshToken);
                    
                    // Retry original request
                    headers['Authorization'] = `Bearer ${data.data.accessToken}`;
                    response = await fetch(url, { ...options, headers });
                    return response;
                }
            } catch (e) {
                console.error("Token refresh failed", e);
            }
        }
        
        // If refresh fails or no refresh token, logout
        clearTokens();
        window.location.href = '/login';
        throw new Error("Session expired. Please log in again.");
    }

    return response;
};

