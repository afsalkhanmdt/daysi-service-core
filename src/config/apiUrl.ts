const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || "prod";

const apiUrl =`https://${process.env.NEXT_PUBLIC_API_HOSTNAME}/`
          ;

export const assetsUrl = "https://assets.babble-ai.com";

export default apiUrl;
