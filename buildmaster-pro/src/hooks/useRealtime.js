import { useEffect } from 'react';
import { realtimeSync, TABLES } from '../lib/realtime';

export function useRealtime(table, data, setData, getKey = (item) => item.id) {
  useEffect(() => {
    if (!table || !setData) return;

    const handleChange = (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setData(prev => {
        if (!prev) return prev;
        
        switch (eventType) {
          case 'INSERT':
            return [newRecord, ...prev];
            
          case 'UPDATE':
            return prev.map(item => 
              getKey(item) === getKey(newRecord) ? newRecord : item
            );
            
          case 'DELETE':
            return prev.filter(item => 
              getKey(item) !== getKey(oldRecord)
            );
            
          default:
            return prev;
        }
      });
    };

    realtimeSync.subscribe(table, handleChange);

    return () => {
      realtimeSync.unsubscribe(table);
    };
  }, [table]);
}

export default useRealtime;
