import { useState, useCallback, useRef, useEffect } from "react";

export const useHttp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequest = useRef([]);
  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortController = new AbortController();
      activeHttpRequest.current.push(httpAbortController);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortController.signal
        });

        const responseData = await response.json();
        activeHttpRequest.current = activeHttpRequest.current.filter(
          reqCtrl => reqCtrl !== httpAbortController
        );

        console.log("resp", responseData);
        if (!response.ok) {
          throw new Error(responseData.messgage);
        }
        setIsLoading(false);

        return responseData;
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
        throw error;
      }
    },
    []
  );

  const clearError = () => setError(null);

  useEffect(() => {
    return () => {
      activeHttpRequest.current.forEach(abctlr => {
        abctlr.abort();
      });
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
