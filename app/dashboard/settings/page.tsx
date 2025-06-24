"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Shield,
  Download,
  Save,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  // const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    readingReminders: true,
    achievementAlerts: true,

    // Reading Preferences
    fontSize: [16],
    fontFamily: "inter",
    readingSpeed: [250],
    autoPlay: false,
    highlightWords: true,
    showProgress: true,

    // Audio Settings
    defaultVoice: "rachel",
    speechRate: [1.0],
    volume: [75],
    autoplayChapters: false,

    // Privacy
    profileVisibility: "private",
    dataSharing: false,
    analyticsOptOut: false,

    // Interface
    language: "en",
    sidebarCollapsed: false,
    compactMode: false,
  });

  // Define keys that should always be arrays for the Slider component
  const sliderKeys = useMemo(() => {
    return ["fontSize", "readingSpeed", "speechRate", "volume"];
  }, []);

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          const fetchedPreferences = data.preferences;

          // --- FIX START ---
          // Ensure slider values are always arrays
          const transformedPreferences = { ...fetchedPreferences };
          sliderKeys.forEach((key) => {
            // Check if the key exists and its value is not already an array
            if (
              key in transformedPreferences &&
              !Array.isArray(transformedPreferences[key])
            ) {
              transformedPreferences[key] = [transformedPreferences[key]];
            }
          });
          setSettings(transformedPreferences);
          // --- FIX END ---
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [sliderKeys]);

  const updateSetting = (key: string, value: boolean | string) => {
    // When a slider's onValueChange triggers, it already provides an array,
    // so no special handling is needed here for slider values.
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // When saving, you might want to convert the single-element arrays
          // back to numbers if your backend expects them that way.
          // For now, sending the array is usually fine if the backend handles it,
          // or if the backend doesn't explicitly require a number.
          preferences: settings,
        }),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    setIsExportingData(true);

    fetch("/api/user/export-data", {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          toast.success(
            "Data export prepared! Check your email for the download link."
          );
        } else {
          throw new Error(data.error || "Export failed");
        }
      })
      .catch((error) => {
        console.error("Export error:", error);
        toast.error("Failed to export data: " + error.message);
      })
      .finally(() => {
        setIsExportingData(false);
      });
  };

  // const handleDeleteAccount = () => {
  //   setIsDeletingAccount(true);

  //   fetch("/api/user/delete-account", {
  //     method: "DELETE",
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.success) {
  //         toast.success(
  //           "Data export prepared! Check your email for the download link."
  //         );
  //       } else {
  //         throw new Error(data.error || "Export failed");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Export error:", error);
  //       toast.error("Failed to export data: " + error.message);
  //     })
  //     .finally(() => {
  //       setIsDeletingAccount(false);
  //     });
  //   toast.error(
  //     "Account deletion requires additional verification. Please contact support."
  //   );
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-[14rem]">
      <div>
        <Button asChild variant={"outline"} className="mt-4 ml-4">
          <Link href="/dashboard" className="flex items-center gap-4">
            <ArrowLeft />
            Back
          </Link>
        </Button>
      </div>
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div></div>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
          <div className="gap-8">
            {/* Right Column */}
            <div className="space-y-6">
              {/* Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="h-5 w-5 mr-2" />
                    Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) =>
                        updateSetting("language", value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-mode">Compact Mode</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Use a more compact interface
                      </p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={settings.compactMode}
                      onCheckedChange={(checked) =>
                        updateSetting("compactMode", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sidebar-collapsed">
                        Auto-collapse Sidebar
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically collapse sidebar on mobile
                      </p>
                    </div>
                    <Switch
                      id="sidebar-collapsed"
                      checked={settings.sidebarCollapsed}
                      onCheckedChange={(checked) =>
                        updateSetting("sidebarCollapsed", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Profile Visibility</Label>
                    <Select
                      value={settings.profileVisibility}
                      onValueChange={(value) =>
                        updateSetting("profileVisibility", value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-sharing">
                        Anonymous Data Sharing
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Help improve SmartStudy with anonymous usage data
                      </p>
                    </div>
                    <Switch
                      id="data-sharing"
                      checked={settings.dataSharing}
                      onCheckedChange={(checked) =>
                        updateSetting("dataSharing", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics-optout">
                        Opt-out of Analytics
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Disable all analytics tracking
                      </p>
                    </div>
                    <Switch
                      id="analytics-optout"
                      checked={settings.analyticsOptOut}
                      onCheckedChange={(checked) =>
                        updateSetting("analyticsOptOut", checked)
                      }
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      disabled={isExportingData}
                      className="w-full mb-3"
                    >
                      {isExportingData ? (
                        "Exporting..."
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export My Data
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              {/* <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      This action cannot be undone. All your data will be
                      permanently deleted.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="w-full"
                    >
                      {isDeletingAccount ? (
                        "Deleting..."
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete My Account
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
