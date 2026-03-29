"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import UserAvatar from "@/components/shared/user-avatar";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { Pencil, KeyRound } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

interface EditableProfileProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

export function EditableProfile({ user }: EditableProfileProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image ?? "");
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(user.name);
  const [displayImage, setDisplayImage] = useState(user.image);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, startPasswordTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await authClient.updateUser({
          name,
          image: image || undefined,
        });
        toast.success("Profile updated");
        setDisplayName(name);
        setDisplayImage(image || null);
        setIsEditing(false);
        router.refresh();
      } catch {
        toast.error("Failed to update profile");
      }
    });
  };

  const handleCancel = () => {
    setName(displayName);
    setImage(displayImage ?? "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    startPasswordTransition(async () => {
      try {
        const res = await authClient.changePassword({
          currentPassword,
          newPassword,
        });
        if (res?.error) {
          toast.error(res.error.message || "Failed to change password");
          return;
        }
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch {
        toast.error("Failed to change password");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Profile</CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEditing ? (
          <div className="flex items-center gap-4">
            <UserAvatar name={displayName} imageURL={displayImage} />
            <div>
              <p className="text-lg font-semibold">{displayName}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <UserAvatar name={name || user.name} imageURL={image || null} />
              <div className="text-muted-foreground text-sm">
                Preview of your avatar
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-image">Avatar URL</Label>
              <Input
                id="profile-image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/avatar.png"
                disabled={isPending}
              />
              <p className="text-muted-foreground text-xs">
                Leave empty to use initials
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
              <p className="text-muted-foreground text-xs">
                Email cannot be changed
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Change Password</h3>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <PasswordInput
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={isChangingPassword}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <PasswordInput
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={isChangingPassword}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <PasswordInput
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={isChangingPassword}
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={
                  isChangingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                variant="outline"
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
