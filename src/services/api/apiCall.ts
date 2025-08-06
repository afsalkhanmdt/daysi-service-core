import apiUrl from "@/config/apiUrl";

interface ApiCallParameters {
    url: string;
    method?: "POST" | "GET" | "PUT" | "DELETE";
    data?: any;
    isFile?: boolean;
    token?: string;
}

const apiCall = async ({
    url,
    method = "GET",
    data = null,
    isFile = false,
    token
}: ApiCallParameters) => {
    const formData = new FormData();

    if (isFile && data instanceof File) {
        formData.append("file", data);
    }

    const headers = new Headers();

    if (!isFile) headers.append("Content-Type", "application/json");
    const authToken = token || localStorage.getItem("chat-token");

    if (authToken) headers.append("Authorization", `Bearer ${authToken}`);
    const response = await fetch(`${apiUrl}${url}`, {
        method,
        headers,
        body: isFile ? formData : data ? JSON.stringify(data) : undefined
    });
    if (response.status === 404)
        return { status: false, data: response.statusText };
    return response.json();
};

export const postCall =
    (url: string) =>
    (data = {}, token?: string) =>
        apiCall({
            url,
            method: "POST",
            data,
            token
        });

export const putCall =
    (url: string) =>
    (data = {}) =>
        apiCall({
            url,
            method: "PUT",
            data
        });

export const getCall = (url: string) => apiCall({ url });

export const deleteCall = (url: string) => apiCall({ url, method: "DELETE" });

export const uploadCall = (url: string) => (data: any) =>
    apiCall({
        url,
        data,
        method: "POST",
        isFile: true
    });

export default apiCall;
