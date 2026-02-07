"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import type { UserProfile, UserProfileFormData } from "@/types";

interface ProfileFormProps {
  userId: string;
  userEmail: string;
  userMetadata?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

const universities = [
  "University of Dhaka (DU)",
  "Bangladesh University of Engineering and Technology (BUET)",
  "North South University (NSU)",
  "BRAC University",
  "Independent University, Bangladesh (IUB)",
  "American International University-Bangladesh (AIUB)",
  "East West University",
  "Jahangirnagar University",
  "Rajshahi University",
  "Chittagong University",
  "Khulna University",
  "Shahjalal University of Science and Technology (SUST)",
  "Bangladesh Agricultural University",
  "Islamic University, Bangladesh",
  "National University, Bangladesh",
  "Other",
];

const occupations = [
  "Student - Undergraduate",
  "Student - Graduate",
  "Student - High School",
  "Teacher / Professor",
  "Research Assistant",
  "Working Professional",
  "Freelancer",
  "Other",
];

export default function ProfileForm({
  userId,
  userEmail,
  userMetadata,
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<UserProfileFormData>({
    first_name: "",
    last_name: "",
    email: userEmail,
    phone: "",
    university: "",
    occupation: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();

      if (data.profile) {
        setFormData({
          first_name: data.profile.first_name || "",
          last_name: data.profile.last_name || "",
          email: data.profile.email || userEmail,
          phone: data.profile.phone || "",
          university: data.profile.university || "",
          occupation: data.profile.occupation || "",
        });
      } else {
        // Set defaults from user metadata
        setFormData({
          first_name: userMetadata?.first_name || "",
          last_name:
            userMetadata?.last_name ||
            userMetadata?.full_name?.split(" ").slice(1).join(" ") ||
            "",
          email: userEmail,
          phone: "",
          university: "",
          occupation: "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save profile");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof UserProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information. This helps us personalize your
          experience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="first_name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                First Name
              </label>
              <Input
                id="first_name"
                type="text"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="last_name"
                className="text-sm font-medium flex items-center gap-2"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Last Name
              </label>
              <Input
                id="last_name"
                type="text"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled
              className="bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          {/* University */}
          <div className="space-y-2">
            <label
              htmlFor="university"
              className="text-sm font-medium flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              University / Institution
            </label>
            <Select
              value={formData.university}
              onValueChange={(value) => handleChange("university", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your university" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((uni) => (
                  <SelectItem key={uni} value={uni}>
                    {uni}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <label
              htmlFor="occupation"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Occupation
            </label>
            <Select
              value={formData.occupation}
              onValueChange={(value) => handleChange("occupation", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupations.map((occ) => (
                  <SelectItem key={occ} value={occ}>
                    {occ}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {saveSuccess && (
            <div className="bg-accent/10 text-accent text-sm p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Profile saved successfully!
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
