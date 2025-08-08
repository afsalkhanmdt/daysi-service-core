export const AdminLoginCall = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("grant_type", "password");
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch("https://dev.daysi.dk/Token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
};

export const getAllFamilies = async (familyId: string, token: string) => {
  const res = await fetch(
    `https://dev.daysi.dk/api/Families/GetAllFamilies?familyId=${familyId}`,
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
