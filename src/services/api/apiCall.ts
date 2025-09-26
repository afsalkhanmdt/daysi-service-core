export const AdminLoginCall = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("grant_type", "password");
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch("https://api.daysi.dk/Token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
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
    throw new Error("Login failed");
  }

  return res.json();
};

export const getAllFamilies = async (familyId: string, token: string) => {
  const res = await fetch(
    `https://api.daysi.dk/api/Families/GetAllFamilies?familyId=${familyId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch families: ${res.status}`);
  }

  return res.json();
};
