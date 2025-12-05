import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/config";

export function usePort(projectId: string) {
  const [port, setPort] = useState<string | null>(null);
  const { getToken } = useAuth();
  const [status, setStatus] = useState<"BOOTING" | "READY">("BOOTING");

  useEffect(() => {
    if (!projectId || port) return;

    const checkPort = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${BACKEND_URL}/port/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.port) {
          setPort(data.port);
          setStatus("READY");
        }
      } catch (error) {
        console.log("Waiting for container...");
      }
    };

    checkPort();

    const interval = setInterval(checkPort, 2000);

    return () => clearInterval(interval);
  }, [projectId, port]);

  return { port, status };
}
