"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getNotificationsAPI, markNotificationsReadAPI } from "@/lib/api";
import type { UserNotification } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { FiBell, FiCheckCircle } from "react-icons/fi";

function getPickupLink(notification: UserNotification) {
  if (!notification.data) return null;
  try {
    const data: unknown = JSON.parse(notification.data);
    if (
      typeof data === "object" &&
      data !== null &&
      "pickupId" in data &&
      typeof data.pickupId === "string"
    ) {
      return `/pickups/${encodeURIComponent(data.pickupId)}`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [markingRead, setMarkingRead] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoadError("");
      const response = await getNotificationsAPI();
      if (response.success) setNotifications(response.data.notifications);
    } catch (cause: unknown) {
      setLoadError(cause instanceof Error ? cause.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAllAsRead = async () => {
    setMarkingRead(true);
    try {
      await markNotificationsReadAPI();
      setNotifications((current) => current.map((notification) => ({
        ...notification,
        isRead: true,
      })));
      window.dispatchEvent(new Event("notifications-read"));
    } catch (cause: unknown) {
      setLoadError(cause instanceof Error ? cause.message : "Could not update notifications.");
    } finally {
      setMarkingRead(false);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <section className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Updates about your pickups and recycling progress.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" loading={markingRead} onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </header>

      {loadError && (
        <div role="alert">
          <Card className="text-sm text-red-700">{loadError}</Card>
        </div>
      )}

      {loading ? (
        <div className="h-36 animate-pulse rounded-2xl bg-gray-100" />
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const pickupLink = getPickupLink(notification);
            return (
              <Card
                key={notification.id}
                className={`p-5 ${notification.isRead ? "" : "border-primary-200 bg-primary-50/40"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-primary-700">
                    {notification.isRead
                      ? <FiCheckCircle aria-hidden="true" />
                      : <FiBell aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-sm font-bold text-gray-900">{notification.title}</h2>
                      <time className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    {pickupLink && (
                      <Link
                        href={pickupLink}
                        className="mt-3 inline-block text-xs font-semibold text-primary-700 hover:text-primary-800"
                      >
                        View pickup details
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <FiBell className="mx-auto h-7 w-7 text-gray-300" aria-hidden="true" />
          <h2 className="mt-3 font-bold text-gray-900">You&apos;re all caught up</h2>
          <p className="mt-1 text-sm text-gray-500">New pickup updates will appear here.</p>
        </Card>
      )}
    </section>
  );
}
