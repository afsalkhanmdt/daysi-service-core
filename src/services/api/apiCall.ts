import apiUrl from "@/config/apiUrl";

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

export interface ForgotPasswordPayload {
  UserName: string;
  FamilyId?: number | null;
  Locale?: string;
}

export const ForgotPasswordCall = async (payload: ForgotPasswordPayload) => {
  const backendBase = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
  // Try Account/ForgotPassword or fallback to ForgotPassword
  const url = `${backendBase}Account/ForgotPassword`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Source": "events-webpage"
    },
    body: JSON.stringify(payload),
    redirect: "manual"
  });

  if (!res.ok) {
    let errorMessage = "Failed to reset password. Please try again.";
    try {
      const errorData = await res.json();
      if (errorData.message || errorData.Message) {
        errorMessage = errorData.message || errorData.Message;
      } else if (errorData.error_description) {
        errorMessage = errorData.error_description;
      }
    } catch {
      if (res.status === 404) {
        errorMessage = "User not found with the provided credentials.";
      } else if (res.status === 400) {
        errorMessage = "Invalid request. Please check the entered username or details.";
      } else {
        errorMessage = `Error: ${res.status} ${res.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }

  // Handle 200/204 with or without JSON body
  try {
    return await res.json();
  } catch {
    return { success: true };
  }
};


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
    
    let authToken = token;
    if (!authToken && typeof window !== "undefined") {
        authToken = localStorage.getItem("access_token") || undefined;
    }

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
