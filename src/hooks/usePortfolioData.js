import { useEffect, useState } from "react";

import { getPortfolioData, localPortfolioData } from "../lib/portfolioData";

export const usePortfolioData = () => {
  const [data, setData] = useState(localPortfolioData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPortfolioData = async () => {
      setIsLoading(true);

      try {
        const remoteData = await getPortfolioData();

        if (isMounted) {
          setData(remoteData);
        }
      } catch (error) {
        console.warn("Using local portfolio fallback:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPortfolioData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading };
};
