const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || "prod";
const localSever = "localhost:8000";
const apiSever = "api.daysi.dk";
const devSever = "api.daysi.dk";
const prodSever = "api.daysi.dk";

const apiUrl =`https://${prodSever}/api/`
          ;

export const assetsUrl = "https://assets.babble-ai.com";

export default apiUrl;
