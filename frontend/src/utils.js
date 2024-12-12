export const GetIpfsUrlFromPinata = (pinataUrl) => {
    if (!pinataUrl || typeof pinataUrl !== "string") {
        console.error("Invalid Pinata URL provided:", pinataUrl);
        return "";
    }
    const hash = pinataUrl.split("/").pop();
    return `https://ipfs.io/ipfs/${hash}`;
};
export const setCookieFunction = (name, value) => {
    let expires = "";
    const date = new Date();
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();

    document.cookie = name + "=" + value + expires + "; path=/";
    console.log(`Cookie set: ${name} = ${value}`);
};
export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
};