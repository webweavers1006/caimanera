"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { SSE_EVENTS, SSE_CONFIG } from "@/features/shared/config/event.constants";

const getReconnectDelay = () =>
  SSE_CONFIG.RECONNECT.BASE_MS + Math.random() * SSE_CONFIG.RECONNECT.JITTER_MS;

/**
 * SseContext — shared EventSource connection for the entire browser tab.
 *
 * Instead of each hook opening its own EventSource (2-3 connections per tab),
 * the SseProvider opens ONE connection and dispatches events to all subscribers.
 *
 * This eliminates the MaxListenersExceededWarning by reducing SSE connections
 * from ~2-3 per user to exactly 1, and cuts server resource usage by the same ratio.
 */
const SseContext = createContext(null);

/**
 * Access the shared SSE connection state.
 * Returns { isConnected, subscribe }.
 *
 * Safe to call outside the provider — returns a no-op stub.
 */
export function useSseConnection() {
  const ctx = useContext(SseContext);
  if (!ctx) {
    return { isConnected: false, subscribe: () => () => {} };
  }
  return ctx;
}

/**
 * Subscribe to a single SSE event type. Auto-cleans on unmount.
 *
 * @param {string} eventType - SSE event name (e.g., "case:forwarded")
 * @param {Function} callback - Receives parsed JSON payload
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true] - Set false to skip subscription
 */
export function useSseSubscription(eventType, callback, { enabled = true } = {}) {
  const { subscribe } = useSseConnection();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const unsub = subscribe(eventType, (data) => callbackRef.current(data));
    return unsub;
  }, [eventType, subscribe, enabled]);
}

/**
 * SseProvider — wraps the app with a single, shared EventSource connection.
 * Place inside ThemeProvider in RootLayout.
 */
export function SseProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const mountedRef = useRef(true);
  // Map<eventType, Set<callback>>
  const subscribersRef = useRef(new Map());

  /**
   * Subscribe callback to an event type. Returns unsubscribe function.
   */
  const subscribe = useCallback((eventType, callback) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set());
    }
    const set = subscribersRef.current.get(eventType);
    set.add(callback);

    return () => {
      set.delete(callback);
      if (set.size === 0) subscribersRef.current.delete(eventType);
    };
  }, []);

  /**
   * Dispatch event data to all subscribers of a given type.
   */
  const dispatch = useCallback((eventType, data) => {
    const set = subscribersRef.current.get(eventType);
    if (!set) return;
    set.forEach((cb) => {
      try { cb(data); } catch { /* swallow subscriber errors */ }
    });
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(SSE_CONFIG.STREAM_URL);
    eventSourceRef.current = es;

    es.onopen = () => {
      if (mountedRef.current) setIsConnected(true);
    };

    // All known event types the server may emit
    const allEventTypes = [
      SSE_EVENTS.CONNECTED,
      SSE_EVENTS.CASE_FORWARDED,
      SSE_EVENTS.CASE_CLAIMED,
      SSE_EVENTS.CASE_RELEASED,
      SSE_EVENTS.METRICS_UPDATED,
      SSE_EVENTS.NOTIFICATION_UNREAD_COUNT,
      SSE_EVENTS.SSE_CONNECTIONS_CHANGED,
    ];

    const domListeners = {};

    allEventTypes.forEach((eventType) => {
      const listener = (event) => {
        try {
          dispatch(eventType, JSON.parse(event.data));
        } catch {
          dispatch(eventType, {});
        }
      };
      domListeners[eventType] = listener;
      es.addEventListener(eventType, listener);
    });

    es.onerror = () => {
      if (mountedRef.current) setIsConnected(false);
      es.close();

      allEventTypes.forEach((eventType) => {
        es.removeEventListener(eventType, domListeners[eventType]);
      });

      if (mountedRef.current) {
        reconnectTimerRef.current = setTimeout(connect, getReconnectDelay());
      }
    };
  }, [dispatch]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [connect]);

  return (
    <SseContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </SseContext.Provider>
  );
}
