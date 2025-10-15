export const AdminLoginCall = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("grant_type", "password");
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch("https://dev.daysi.dk/Token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Source": "events-webpage" // ← ADD THIS HEADER to identify your new events webpage
    },
    body: formData,
    credentials: "omit",       // Do NOT send cookies or credentials
    redirect: "manual",        // Prevent automatic redirect following
  });

  // If server tries to redirect (status 3xx), treat as error here
  if (res.status >= 300 && res.status < 400) {
    throw new Error("Login failed: server redirected the request.");
  }

  if (!res.ok) {
    // Enhanced error handling to get more details
    let errorMessage = "Login failed";
    try {
      const errorData = await res.json();
      if (errorData.error_description) {
        errorMessage = errorData.error_description;
      }
    } catch {
      // If we can't parse JSON, use status text
      errorMessage = `Login failed: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return res.json();
};

export const getAllFamilies = async (familyId: string, token: string) => {
  const res = await fetch(
    `https://dev.daysi.dk/api/Families/GetAllFamilies?familyId=${familyId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Source": "events-webpage" // ← Also add to other API calls for consistency
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch families: ${res.status}`);
  }

  return res.json();
};