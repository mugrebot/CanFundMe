const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";

export const fetchCantoPrice = async (): Promise<number> => {
  try {
    const response = await fetch(`${COINGECKO_API_URL}?ids=canto&vs_currencies=usd`);
    const data = await response.json();

    if (data && data.canto && data.canto.usd) {
      return parseFloat(data.canto.usd);
    } else {
      console.error("fetchCantoPrice - Error fetching Canto price from CoinGecko: Invalid data format");
      return 0;
    }
  } catch (error) {
    console.error("fetchCantoPrice - Error fetching Canto price from CoinGecko: ", error);
    return 0;
  }
};
