import { useEffect, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { cacheIsAdmin } from "~~/services/cache.service";

const useIsAdmin = () => {
  const { primaryWallet } = useDynamicContext();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_OFFLINE) {
      setIsAdmin(true);
    }
    if (primaryWallet?.address) {
      cacheIsAdmin(primaryWallet?.address).then(setIsAdmin);
    }
  }, [primaryWallet?.address]);
  return isAdmin;
};

export default useIsAdmin;
