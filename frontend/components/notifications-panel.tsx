"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/lib/notifications-context"
import { Bell, X, CheckCheck, Trash2 } from "lucide-react"

export default function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification, clearAll } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ride_update":
        return "🚴"
      case "bike_alert":
        return "⚠️"
      case "payment":
        return "💳"
      case "maintenance":
        return "🔧"
      default:
        return "📢"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500"
      case "medium":
        return "border-l-4 border-l-yellow-500"
      default:
        return "border-l-4 border-l-blue-500"
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-96 bg-popover border border-border rounded-lg shadow-lg z-50 flex flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <>
              <div className="overflow-y-auto flex-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-border p-4 hover:bg-muted/50 transition-colors ${getPriorityColor(notification.priority)} cursor-pointer ${!notification.read ? "bg-muted/30" : ""}`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          dismissNotification(notification.id)
                        }}
                        className="p-1 hover:bg-destructive/20 rounded flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Action Button */}
                    {notification.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          notification.action?.handler()
                        }}
                        className="mt-2 w-full"
                      >
                        {notification.action.label}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="border-t border-border p-3 flex gap-2">
                <Button size="sm" variant="ghost" onClick={markAllAsRead} className="flex-1">
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAll} className="flex-1">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
