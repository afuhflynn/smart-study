"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Save,
  Edit2,
  Camera,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [newInterest, setNewInterest] = useState("");
  const [userStats, setUserStats] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: "",
    location: "",
    website: "",
    interests: [] as string[],
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            bio: data.user.bio || "",
            location: data.user.location || "",
            website: data.user.website || "",
            interests: data.user.interests || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/user/stats");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserStats(data.stats);
          }
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };
    if (session?.user) {
      fetchProfile();
      fetchStats();
    } else {
      setIsLoading(false);
      setStatsLoading(false);
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          interests: formData.interests,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addInterest = () => {
    if (
      newInterest.trim() &&
      !formData.interests.includes(newInterest.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const getReadingStats = () => {
    if (!userStats) return [];

    return [
      {
        label: "Documents Read",
        value: userStats.documentsRead,
        target: Math.max(userStats.documentsRead + 10, 50),
        unit: "",
      },
      {
        label: "Reading Speed",
        value: userStats.readingSpeed,
        target: Math.max(userStats.readingSpeed + 50, 300),
        unit: "WPM",
      },
      {
        label: "Quiz Average",
        value: userStats.quizScore,
        target: 95,
        unit: "%",
      },
      {
        label: "Hours Saved",
        value: Math.round(userStats.hoursSaved),
        target: Math.max(Math.round(userStats.hoursSaved) + 20, 100),
        unit: "hrs",
      },
    ];
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "speed_reader":
        return TrendingUp;
      case "quiz_master":
        return Award;
      case "consistency":
        return Target;
      case "explorer":
        return BookOpen;
      case "enthusiast":
        return Award;
      case "time_saver":
        return TrendingUp;
      default:
        return Award;
    }
  };

  const getAchievementColor = (earned: boolean) => {
    return earned ? "bg-green-500" : "bg-gray-400";
  };
  if (isLoading) {
    return (
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    My Profile
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Manage your account and reading preferences
                  </p>
                </div>
                <Button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  variant={isEditing ? "outline" : "default"}
                  className={
                    isEditing
                      ? ""
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src={session?.user?.image || ""} />
                            <AvatarFallback className="text-xl">
                              {session?.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          {isEditing && (
                            <Button
                              size="sm"
                              className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                  handleInputChange("name", e.target.value)
                                }
                                disabled={!isEditing}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                  handleInputChange("email", e.target.value)
                                }
                                disabled={!isEditing}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                            disabled={!isEditing}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) =>
                              handleInputChange("website", e.target.value)
                            }
                            disabled={!isEditing}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          disabled={!isEditing}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Interests</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.interests.map((interest, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>{interest}</span>
                              {isEditing && (
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                                  onClick={() => removeInterest(interest)}
                                />
                              )}
                            </Badge>
                          ))}
                          {isEditing && (
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                placeholder="Add interest"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyPress={(e) =>
                                  e.key === "Enter" && addInterest()
                                }
                                className="w-32 h-8"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={addInterest}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reading Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Reading Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {statsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[...Array(4)].map((_, index) => (
                            <div key={index} className="space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-2 w-full" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {getReadingStats().map((stat, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {stat.label}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {stat.value}
                                  {stat.unit} / {stat.target}
                                  {stat.unit}
                                </span>
                              </div>
                              <Progress
                                value={(stat.value / stat.target) * 100}
                                className="h-2"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Account Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Account Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Member since January 2024
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          24 documents read
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Premium member
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {statsLoading ? (
                        [...Array(4)].map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3"
                          >
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        ))
                      ) : userStats?.achievements ? (
                        userStats.achievements
                          .sort((a: any, b: any) => {
                            if (a.earned && !b.earned) return -1;
                            if (!a.earned && b.earned) return 1;
                            return b.progress - a.progress;
                          })
                          .slice(0, 6)
                          .map((achievement: any, index: number) => {
                            const IconComponent = getAchievementIcon(
                              achievement.type
                            );
                            return (
                              <div
                                key={achievement.type}
                                className={`flex items-center space-x-3 p-3 rounded-lg ${
                                  achievement.earned
                                    ? "bg-green-50 dark:bg-green-900/20"
                                    : "bg-gray-50 dark:bg-gray-800"
                                }`}
                              >
                                <div
                                  className={`p-2 rounded-full ${getAchievementColor(
                                    achievement.earned
                                  )}`}
                                >
                                  <IconComponent className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4
                                    className={`text-sm font-medium ${
                                      achievement.earned
                                        ? "text-gray-900 dark:text-white"
                                        : "text-gray-500 dark:text-gray-400"
                                    }`}
                                  >
                                    {achievement.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {achievement.description}
                                  </p>
                                  {!achievement.earned && (
                                    <div className="mt-1">
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                        <div
                                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                          style={{
                                            width: `${Math.min(
                                              100,
                                              achievement.progress
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          Start reading to unlock achievements!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
