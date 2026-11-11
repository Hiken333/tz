export type Actor = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
  companyId: string | null;
};
