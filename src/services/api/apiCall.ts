 export const AdminLoginCall = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("grant_type", "password");
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch("https://api.daysi.dk/Token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Source": "events-webpage"
    },
    body: formData,
    // credentials: "include",   // <-- Use 'include' if backend uses cookies for auth
    redirect: "manual"        // <-- Prevent automatic redirect
  });

  if (res.status >= 300 && res.status < 400) {
    throw new Error("Login failed: server redirected the request.");
  }

  if (!res.ok) {
    let errorMessage = "Login failed";
    try {
      const errorData = await res.json();
      if (errorData.error_description) {
        errorMessage = errorData.error_description;
      }
    } catch {
      errorMessage = `Login failed: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return res.json();
};


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
    const authToken = token || localStorage.getItem("access_token");

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
