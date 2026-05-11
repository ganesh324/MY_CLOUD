import { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

export function useFiles(currentPath = "") {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            // 1. GET THE TOKEN FROM STORAGE
            const token = localStorage.getItem('token');

            // 2. SEND THE TOKEN IN THE HEADER
            const res = await fetch(`${API_URL}/files?path=${encodeURIComponent(currentPath)}`, {
                headers: {
                    'Authorization': `Bearer ${token}` // <--- CRITICAL LINE
                }
            });

            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setFiles(data);
        } catch (err) {
            console.error("Cloud fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPath]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { files, loading, refresh };
}