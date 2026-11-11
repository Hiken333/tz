function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL", "postgres://geo:geo@localhost:5433/geo"),
  cookieSecret: required("COOKIE_SECRET", "dev-cookie-secret-change-me"),
  webOrigin: required("WEB_ORIGIN", "http://localhost:3000"),
  port: Number(process.env.API_PORT ?? "3001"),
};
