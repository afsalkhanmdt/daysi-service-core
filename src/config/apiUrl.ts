const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || "prod";
const localSever = "localhost:8000";
const apiSever = "api.daysi.dk";
const devSever = "dev.daysi.dk";

const apiUrl =
    ENVIRONMENT === "prod"
        ? `https://${apiSever}/api/`
        : ENVIRONMENT === "uat"
          ? `https://${devSever}/api/`
          : `http://${localSever}/api/`;

export const assetsUrl = "https://assets.babble-ai.com";

export default apiUrl;
