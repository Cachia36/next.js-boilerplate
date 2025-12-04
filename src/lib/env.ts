export const JWT_SECRET = (() => {
    if (!process.env.JWT_SECRET) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("JWT_SECRET is not set");
        }
        return "dev-jwt-secret-change-me"; // dev only
    }
    return process.env.JWT_SECRET;
})();

export const APP_URL = (() => {
    const url = process.env.NEXT_PUBLIC_APP_URL;
    if(!url) {
        if(process.env.NODE_ENV === "production") {
            throw new Error("NEXT_PUBLIC_APP_URL is not set");
        }
        return "http://localhost:3000"; // sensible dev default
    }
    return url;
})();