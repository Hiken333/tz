import { app } from "./app";
import { env } from "./env";

export { app };

app.listen(env.port);
console.log(`api listening on ${env.port}`);
